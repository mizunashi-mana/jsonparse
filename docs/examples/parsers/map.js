const sparse = require("sonparser");
const assert = require("assert");

/**
 * This parser converts number to is integer.
 */
const IsIntegerParser = sparse.number.map(Number.isInteger);

assert.strictEqual(
  IsIntegerParser.parse(-1),
  true
); // success

assert.strictEqual(
  IsIntegerParser.parse(11.11),
  false
); // success

assert.throws(
  () => IsIntegerParser.parse("str"),
  sparse.ConfigParseError
); // failure
