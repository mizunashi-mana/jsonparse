const sparse = require("sonparser");
const assert = require("assert");

/**
 * Option parser sets option value when target value is `undefined`.
 */
const MyFlagObjParser = sparse.hasProperties([
  ["flag", sparse.boolean.option(false)],
]);

assert.deepEqual(
  MyFlagObjParser.parse({"flag": true}),
  {"flag": true}
); // success

assert.deepEqual(
  MyFlagObjParser.parse({}),
  {"flag": false}
); // success with option value(false)

assert.deepEqual(
  MyFlagObjParser.parse({"flag": undefined}),
  {"flag": false}
); // success with option value(false)

assert.throws(
  () => MyFlagObjParser.parse({"flag": "true"}),
  ConfigParseError
); // failure
