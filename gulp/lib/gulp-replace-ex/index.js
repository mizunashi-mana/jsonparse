"use strict";

var gutil = require("gulp-util");
var gdata = require("gulp-data");
var extend = require("object-assign");

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceAll(str, find, replacement) {
  return str.replace(new RegExp(escapeRegExp(find), "g"), replacement);
}

module.exports = function(pattern, replacement, data, opt) {
  var pattern_s = pattern || "";
  var replacement_s = replacement || "";

  return gdata(function(file) {
    var replacetmp = typeof data === "boolean"
      ? data
      ? replacement_s
      : gutil.template(replacement_s, {"file": file})
      : gutil.template(replacement_s, extend({"file": file}, data))
      ;
    var content = typeof pattern_s === "string"
      ? replaceAll(file.contents.toString(), pattern_s, replacetmp)
      : file.contents.toString().replace(pattern_s, replacetmp)
      ;
    file.contents = new Buffer(content);
  });
};
