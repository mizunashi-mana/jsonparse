'use strict';

var gutil = require('gulp-util');
var gdata = require('gulp-data');
var path = require('path');

module.exports = function tester() {
  return gdata(function(file) {
    try {
      file.docsTester = {
        status: true,
        value: null,
      };
    } catch (e) {
      file.docsTester = {
        status: false,
        err: e,
      };
    }
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

      console.log(
        result.err.stack.split('    at Module.require (module.js:')[0]
      );
      gutil.log(
        '[' + gutil.colors.cyan('gulp-docs-tester') + ']',
        '[' + path.relative(process.cwd(), file.path) + ']',
        gutil.colors.red('error')
      )
    }
  });

  return resultStream;
}
