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

assert.strictEqual(
  MyEnumParser.parse("VAL1"),
  "VAL1"
); // success

assert.strictEqual(
  MyEnumParser.parse("VAL3"),
  "VAL3"
); // success

assert.throws(
  MyEnumParser.parse(0),
  sparse.ConfigParseError
); // failure

assert.throws(
  MyEnumParser.parse("str"),
  sparse.ConfigParseError
); // failure

/**
 * This parser converts bool object to bool value.
 */
var MyConvertParseFunc = function(makeSuccess, makeFailure) {
  return function(obj) {
    if (typeof obj === "boolean") {
      return makeSuccess(obj);
    } else if (typeof obj === "number") {
      return makeSuccess(obj == 0);
    } else if (typeof obj === "string") {
      switch(obj) {
        case "true":
        case "yes":
        case "on":
          return makeSuccess(true);
        case "false":
        case "no":
        case "off":
          return makeSuccess(false);
      }
      return makeFailure(JSON.stringify(obj) + " is not flag string", "flag string(yes/no)");
    } else {
      return makeFailure("this is not bool object", "bool object");
    }
  };
};
var MyConvertParser = sparse.custom(MyConvertParseFunc);

assert.strictEqual(
  MyConvertParser.parse(true),
  true
); // success

assert.strictEqual(
  MyConvertParser.parse(0),
  false
); // success

assert.strictEqual(
  MyConvertParser.parse("true"),
  true
); // success

assert.strictEqual(
  MyConvertParser.parse("no"),
  false
); // success

assert.throws(
  MyConvertParser.parse("str"),
  sparse.ConfigParseError
); // failure

assert.throws(
  MyConvertParser.parse({}),
  sparse.ConfigParseError
); // failure

assert.throws(
  MyConvertParser.parse([]),
  sparse.ConfigParseError
); // failure
