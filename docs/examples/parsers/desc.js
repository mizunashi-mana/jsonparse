const sparse = require("sonparser");
const assert = require("assert");

let flag;
const FlagParser = sparse.boolean
  .desc("`flag` should be boolean object.");

flag = true;
assert.strictEqual(
  FlagParser.parse(flag),
  true
); // success

flag = "true";
assert.throws(
  () => FlagParser.parse(flag),
  sparse.ConfigParseError,
  "`flag` should be boolean object."
); // failure with custom description
