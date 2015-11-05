var sparse = require("sonparser");
var assert = require("assert");

assert.throws(
  function() {
    return sparse.fail("any fail!").parse("anything!");
  },
  sparse.ConfigParseError,
  "any fail!"
); // failure with message
