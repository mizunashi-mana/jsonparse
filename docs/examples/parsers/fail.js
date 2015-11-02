const sparse = require("sonparser");
const assert = require("assert");

assert.throws(
  () => sparse.fail("any fail!").parse("anything!"),
  sparse.ConfigParseError,
  "any fail!"
); // failure with message
