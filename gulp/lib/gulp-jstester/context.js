"use strict";

var vm = require("vm");
var path = require("path");
var fs = require("fs");
var mkdirp = require("mkdirp").sync;

module.exports.runJsFile = function(filename, content) {
  var result = undefined;
  var is_error = false;
  var tmpfilename = path.join(__dirname, "tmp", path.relative(process.cwd(), filename));
  var contenttmp = '___dirname = __dirname;__dirname = "' + path.dirname(filename) + '";';

  try {
    mkdirp(path.dirname(tmpfilename));

    if (content instanceof Buffer) {
      contenttmp = new Buffer(contenttmp);
      contenttmp = Buffer.concat([contenttmp, content], contenttmp.length + content.length);
      fs.writeFileSync(tmpfilename, contenttmp, 0, contenttmp.length);
    } else {
      contenttmp = contenttmp + content;
      fs.writeFileSync(tmpfilename, contenttmp, 0, "utf-8");
    }
  } catch(e) {
    throw new Error("Failed to run js file.");
  }

  // running
  try {
    result = require(tmpfilename);
  } catch(e) {
    is_error = true;
    result = e;
  }

  fs.unlink(tmpfilename, function(err) {});

  if (is_error) {
    throw result;
  } else {
    return result;
  }
};
