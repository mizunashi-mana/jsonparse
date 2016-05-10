'use strict';

var gutil = require('gulp-util');
var gdata = require('gulp-data');
var path = require('path');

var runJsFile = require('./context').runJsFile;

module.exports = function tester() {
  return gdata(function(file) {
    file.docsTester = runJsFile(file.path, file.contents);
  });
}

module.exports.reporter = function testerReporter(isFail) {
  var isEmitFail = !!isFail;
  var failures = [];
  var count = 0;

  var resultStream = gdata(function(file) {
    var result = file.docsTester;

    count++;

    if (!result.status) {
      if (isEmitFail) {
        failures.push(result);
      }

      /*
      console.error(
        result.err.stack.split('    at Module.require (module.js:')[0]
      );
      */
      gutil.log(
        '[' + gutil.colors.cyan('gulp-docs-tester') + ']',
        '[' + path.relative(process.cwd(), file.path) + ']',
        gutil.colors.red('error'),
        result.err.message
      )
    }
  });

  if (isEmitFail) {
    resultStream = resultStream.on('end', function() {
      var isfail = failures.length > 0;
      var spaces = '  ';

      gutil.log('jstesting...');

      gutil.log(gutil.colors.green(spaces + (count - failures.length) + ' passing'));
      gutil.log(gutil.colors.red(spaces + failures.length + ' failing'));

      if (isfail) {
        throw new gutil.PluginError('gulp-docs-tester', 'emit failure');
      }
    });
  }

  return resultStream;
}
