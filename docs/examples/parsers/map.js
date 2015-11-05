var sparse = require("sonparser");
var assert = require("assert");

/**
 * This parser converts number to is integer.
 */
var IsIntegerParser = sparse.number.map(Number.isInteger);

assert.strictEqual(
  IsIntegerParser.parse(-1),
  true
); // success

assert.strictEqual(
  IsIntegerParser.parse(11.11),
  false
); // success

assert.throws(
  function() {
    return IsIntegerParser.parse("str");
  },
  sparse.ConfigParseError
); // failure
