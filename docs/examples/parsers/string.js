const sparse = require("sonparser");
const assert = require("assert");

assert.strictEqual(
  sparse.string.parse(""),
  ""
); // success

assert.strictEqual(
  sparse.string.parse("str"),
  "str"
); // success

assert.strictEqual(
  sparse.string.parse("0"),
  "0"
); // success

assert.throws(
  () => sparse.string.parse(false),
  sparse.ConfigParseError
); // failure

assert.throws(
  () => sparse.string.parse(10),
  sparse.ConfigParseError
); // failure
