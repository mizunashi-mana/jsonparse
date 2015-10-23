const sparse = require("sonparser");
const assert = require("assert");

assert.strictEqual(
  sparse.boolean.parse(false),
  false
); // success

assert.strictEqual(
  sparse.boolean.parse(true),
  true
); // success

assert.throws(
  sparse.boolean.parse(0),
  sparse.ConfigParseError
); // failure

assert.throws(
  sparse.boolean.parse("true"),
  sparse.ConfigParseError
); // failure
