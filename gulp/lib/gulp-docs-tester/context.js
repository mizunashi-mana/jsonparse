'use strict';

var os = require('os');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp').sync;
var reload = require('require-reload')(require);

/**
 * escape RegExp string
 *
 * @param {String} str non escaped string
 * @returns {String} escaped string
 */
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * replace all string
 *
 * @param {String} str target string
 * @param {String} find find string value
 * @param {String} replacement replace string value
 * @returns {String} replaced new string
 */
function replaceAll(str, find, replacement) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replacement);
}

module.exports.runJsFile = function(filepath, content) {
  var result = { status: true };
  var tmpfilename = path.join(
    os.tmpdir(),
    'docs-tester',
    path.relative(process.cwd(), filepath)
  );

  var contenttmp
    = '___dirname = __dirname;'
    + "__dirname = '" + path.dirname(filepath) + "';"
    ;

  try {
    mkdirp(path.dirname(tmpfilename));

    contenttmp += content.toString();
    contenttmp = replaceAll(contenttmp, 'console.log', '(function(){})');
    contenttmp = contenttmp.replace(
      "require('sonparser')",
      "require(require('path').join("
      + "require('path').relative(___dirname, process.cwd()),"
      + "'lib/'"
      + '))'
    );

    // console.log(contenttmp);

    fs.writeFileSync(tmpfilename, contenttmp, 0, 'utf-8');
  } catch (e) {
    return {
      status: false,
      err: new Error('Failed to run js file.')
    };
  }

  // running
  try {
    result.value = reload(tmpfilename);
  } catch (e) {
    result.status = false;
    result.err = e;
  }

  fs.unlink(tmpfilename, function() {});

  return result;
}
