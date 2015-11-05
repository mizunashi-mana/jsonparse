var sparse = require("sonparser");
var assert = require("assert");

/**
 * This parser converts natural number to is even.
 */
var IsEvenNatualParser = sparse.custom(function(makeSuccess, makeFailure) {
  return function(obj) {
    if (Number.isInteger(obj) && obj >= 0) {
      return makeSuccess(obj % 2 == 0);
    }
    return makeFailure(obj + " is not natural number", "natural number");
  };
});
var IsEvenNaturalNumberParser = sparse.number.and(IsEvenNatualParser);

assert.strictEqual(
  IsEvenNaturalNumberParser.parse(0),
  true
); // success

assert.strictEqual(
  IsEvenNaturalNumberParser.parse(11),
  false
); // success

assert.throws(
  function() {
    return IsEvenNaturalNumberParser.parse(-101);
  },
  sparse.ConfigParseError
); // failure

assert.throws(
  function() {
    return IsEvenNaturalNumberParser.parse(2.7);
  },
  sparse.ConfigParseError
); // failure

assert.throws(
  function() {
    return IsEvenNaturalNumberParser.parse("str");
  },
  sparse.ConfigParseError
); // failure
