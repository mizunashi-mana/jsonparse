'use strict';

var sparse = require('sonparser');
var assert = require('assert');

/**
 * This parser filters my enum values.
 *
 * @param {Function} makeSuccess success return function
 * @param {Function} makeFailure failure return function
 * @returns {Function} my enum parse function
 */
function MyEnumParseFunc(makeSuccess, makeFailure) {
  return function(obj) {
    if (['VAL1', 'VAL2', 'VAL3'].indexOf(obj) !== -1) {
      return makeSuccess(obj);
    }
    return makeFailure('expected "VAL1", "VAL2" or "VAL3"', '"VAL1" | "VAL2" | "VAL3"');
  };
}
var MyEnumParser = sparse.custom(MyEnumParseFunc);

assert.strictEqual(
  MyEnumParser.parse('VAL1'),
  'VAL1'
); // success

assert.strictEqual(
  MyEnumParser.parse('VAL3'),
  'VAL3'
); // success

assert.throws(
  function() {
    return MyEnumParser.parse(0);
  },
  sparse.ConfigParseError
); // failure

assert.throws(
  function() {
    return MyEnumParser.parse('str');
  },
  sparse.ConfigParseError
); // failure

/**
 * This parser converts bool object to bool value.
 *
 * @param {Function} makeSuccess success return function
 * @param {Function} makeFailure failure return function
 * @returns {Function} my convert parse function
 */
function MyConvertParseFunc(makeSuccess, makeFailure) {
  return function(obj) {
    if (typeof obj === 'boolean') {
      return makeSuccess(obj);
    } else if (typeof obj === 'number') {
      return makeSuccess(obj !== 0);
    } else if (typeof obj === 'string') {
      switch (obj) {
        case 'true':
        case 'yes':
        case 'on':
          return makeSuccess(true);
        case 'false':
        case 'no':
        case 'off':
          return makeSuccess(false);
        default:
      }
      return makeFailure(JSON.stringify(obj) + ' is not flag string', 'flag string(yes/no)');
    }
    return makeFailure('This is not bool object', 'bool object');
  };
}
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
  MyConvertParser.parse('true'),
  true
); // success

assert.strictEqual(
  MyConvertParser.parse('no'),
  false
); // success

assert.throws(
  function() {
    return MyConvertParser.parse('str');
  },
  sparse.ConfigParseError
); // failure

assert.throws(
  function() {
    return MyConvertParser.parse({});
  },
  sparse.ConfigParseError
); // failure

assert.throws(
  function() {
    return MyConvertParser.parse([]);
  },
  sparse.ConfigParseError
); // failure
