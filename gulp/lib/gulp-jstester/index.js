"use strict";

var gutil = require("gulp-util");
var gdata = require("gulp-data");
var path = require("path");
var runJsFile = require("./context").runJsFile;

module.exports = function() {

  return gdata(function(file) {
    try {
      file.jstester = {
        "status" : true,
        "value"  : runJsFile(file.path, file.contents),
      };
    } catch (e) {
      file.jstester = {
        "status" : false,
        "err"    : e,
      };
    }
  });
};

module.exports.reporter = function(isFail) {
  var isEmitFail = !!isFail;
  var failures = [];
  var count = 0;

  var resultStream = gdata(function(file) {
    var result = file.jstester;
    count++;
    if (!result.status) {
      if (isEmitFail) {
        failures.push(result);
      }
      console.log(result.err.stack.split("    at Module.require (module.js:")[0]);
      gutil.log(
        "[" + gutil.colors.cyan("gulp-jstester") + "]",
        "[" + path.relative(process.cwd(), file.path) + "]",
        gutil.colors.red("error"),
        result.err.message
      );
    }
  });

  if (isEmitFail) {
    resultStream = resultStream.on("end", function(cb) {
      var isfail = failures.length > 0;
      var spaces = "  ";
      failures = [];

      gutil.log("jstesting...");

      gutil.log(gutil.colors.green(spaces + count + " passing"));
      gutil.log(gutil.colors.red(spaces + failures.length + " failing"));

      if (isfail) {
        throw new gutil.PluginError("gulp-jstester", "emit failure");
      }
    });
  }

  return resultStream;
};
