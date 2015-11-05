var sparse = require("sonparser");
var assert = require("assert");

assert.strictEqual(
  sparse.boolean.parse(false),
  false
); // success

assert.strictEqual(
  sparse.boolean.parse(true),
  true
); // success

assert.throws(
  function() {
    return sparse.boolean.parse(0);
  },
  sparse.ConfigParseError
); // failure

assert.throws(
  function() {
    return sparse.boolean.parse("true");
  },
  sparse.ConfigParseError
); // failure
