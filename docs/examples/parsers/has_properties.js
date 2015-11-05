var sparse = require("sonparser");
var assert = require("assert");

/**
 * This parser filters my enum values.
 */
function MyEnumParseFunc(makeSuccess, makeFailure) {
  return function(obj) {
    if (["VAL1", "VAL2", "VAL3"].indexOf(obj) != -1) {
      return makeSuccess(obj);
    }
    return makeFailure('expected "VAL1", "VAL2" or "VAL3"', '"VAL1" | "VAL2" | "VAL3"');
  };
};
var MyEnumParser = sparse.custom(MyEnumParseFunc);

/**
 * This parser checks object type structure.
 */
var MyObjectParser = sparse.hasProperties([
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
  function() {
    return MyObjectParser.parse({});
  },
  sparse.ConfigParseError
); // failure

assert.throws(
  function() {
    return MyObjectParser.parse({
      "propBool": true,
      "propStr": "str",
    });
  },
  sparse.ConfigParseError
); // failure

assert.throws(
  function() {
    return MyObjectParser.parse({
      "propBool": true,
      "propNum": 1,
      "propStr": true,
      "propObj": {
        "propNumArr": [0,1,2],
        "propEnum": "VAL2",
      },
    });
  },
  sparse.ConfigParseError
); // failure

assert.throws(
  function() {
    return MyObjectParser.parse(true);
  },
  sparse.ConfigParseError
); // failure
