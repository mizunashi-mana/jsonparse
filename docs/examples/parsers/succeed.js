var sparse = require("sonparser");
var assert = require("assert");

assert.strictEqual(
  sparse.succeed(true).parse("anything!"),
  true
); // success

assert.deepEqual(
  sparse.succeed({"a": "a"}).parse("anything!"),
  {"a": "a"}
); // success
