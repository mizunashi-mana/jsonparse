const sparse = require("sonparser");
const assert = require("assert");

/**
 * This parser converts natural number to is even.
 */
const IsEvenNatualParser = sparse.custom(function(makeSuccess, makeFailure) {
  return function(obj) {
    if (Number.isInteger(obj) && obj >= 0) {
      return makeSuccess(obj % 2 == 0);
    }
    return makeFailure(`${obj} is not natural number`, "natural number");
  };
});
const IsEvenNaturalNumberParser = sparse.number.and(IsEvenNatualParser);

assert.strictEqual(
  IsEvenNaturalNumberParser.parse(0),
  true
); // success

assert.strictEqual(
  IsEvenNaturalNumberParser.parse(11),
  false
); // success

assert.throws(
  () => IsEvenNaturalNumberParser.parse(-101),
  sparse.ConfigParseError
); // failure

assert.throws(
  () => IsEvenNaturalNumberParser.parse(2.7),
  sparse.ConfigParseError
); // failure

assert.throws(
  () => IsEvenNaturalNumberParser.parse("str"),
  sparse.ConfigParseError
); // failure
