const sparse = require("sonparser");
const assert = require("assert");

assert.strictEqual(
  sparse.number.parse(0),
  0
); // success

assert.strictEqual(
  sparse.number.parse(2.718),
  2.718
); // success

assert.throws(
  () => sparse.number.parse(false),
  sparse.ConfigParseError
); // failure

assert.throws(
  () => sparse.number.parse("10"),
  sparse.ConfigParseError
); // failure
