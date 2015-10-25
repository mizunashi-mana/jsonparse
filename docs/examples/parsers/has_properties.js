const sparse = require("sonparser");
const assert = require("assert");

/**
 * This parser filters my enum values.
 */
const MyEnumParseFunc = function(makeSuccess, makeFailure) {
  return function(obj) {
    if (["VAL1", "VAL2", "VAL3"].indexOf(obj) != -1) {
      return makeSuccess(obj);
    }
    return makeFailure('expected "VAL1", "VAL2" or "VAL3"', '"VAL1" | "VAL2" | "VAL3"');
  };
};
const MyEnumParser = sparse.custom(MyEnumParseFunc);

/**
 * This parser checks object type structure.
 */
const MyObjectParser = sparse.hasProperties([
  ["propBool", sparse.boolean],
  ["propNum", sparse.number],
  ["propStr", sparse.string],
  ["propObj", sparse.hasProperties([
    ["propNumArr", sparse.array(sparse.number)],
    ["propEnum", MyEnumParser],
  ])],
]);

assert.deepEqual(MyObjectParser.parse({
  "propBool": true,
  "propNum": 1,
  "propStr": "str",
  "propObj": {
    "propNumArr": [0,1,2],
    "propEnum": "VAL2",
  },
}), {
  "propBool": true,
  "propNum": 1,
  "propStr": "str",
  "propObj": {
    "propNumArr": [0,1,2],
    "propEnum": "VAL2",
  },
}); // success

assert.deepEqual(MyObjectParser.parse({
  "propBool": true,
  "propNum": 1,
  "propStr": "str",
  "propObj": {
    "propNumArr": [0,1,2],
    "propEnum": "VAL2",
    "propExtra1": "extra str",
  },
  "propExtra2": {},
}), {
  "propBool": true,
  "propNum": 1,
  "propStr": "str",
  "propObj": {
    "propNumArr": [0,1,2],
    "propEnum": "VAL2",
  },
}); // success

assert.throws(
  () => MyObjectParser.parse({}),
  sparse.ConfigParseError
); // failure

assert.throws(
  () => MyObjectParser.parse({
    "propBool": true,
    "propStr": "str",
  }),
  sparse.ConfigParseError
); // failure

assert.throws(
  () => MyObjectParser.parse({
    "propBool": true,
    "propNum": 1,
    "propStr": true,
    "propObj": {
      "propNumArr": [0,1,2],
      "propEnum": "VAL2",
    },
  }),
  sparse.ConfigParseError
); // failure

assert.throws(
  () => MyObjectParser.parse(true),
  sparse.ConfigParseError
); // failure
