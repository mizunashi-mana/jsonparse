"use strict";

var vm = require("vm");
var path = require("path");
var fs = require("fs");
var mkdirp = require("mkdirp").sync;

module.exports.runJsFile = function(filename, content) {
  var tmpfilename = path.join(__dirname, "tmp", path.relative(process.cwd(), filename));
  var contenttmp = '___dirname = __dirname;__dirname = "' + path.dirname(filename) + '";';
  mkdirp(path.dirname(tmpfilename));
  if (content instanceof Buffer) {
    contenttmp = new Buffer(contenttmp);
    contenttmp = Buffer.concat([contenttmp, content], contenttmp.length + content.length);
    fs.writeFileSync(tmpfilename, contenttmp, 0, contenttmp.length);
  } else {
    contenttmp = contenttmp + content;
    fs.writeFileSync(tmpfilename, contenttmp, 0, "utf-8");
  }
  return require(tmpfilename);
};
