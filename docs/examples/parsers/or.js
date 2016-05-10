'use strict';

var sparse = require('sonparser');
var assert = require('assert');

/**
 * This parser converts "bool string" to boolean
 */
var boolStrParser = sparse.custom(function(makeSuccess, makeFailure) {
  return function(obj) {
    if (['true', 'yes', 'on'].indexOf(obj) !== -1) {
      return makeSuccess(true);
    } else if (['false', 'no', 'off'].indexOf(obj) !== -1) {
      return makeSuccess(false);
    }
    return makeFailure(JSON.stringify(obj) + ' is not bool string', 'bool string(yes/no)');
  };
});
var convertBoolParser = sparse.boolean.or(boolStrParser);

assert.strictEqual(
  convertBoolParser.parse(true),
  true
); // success

assert.strictEqual(
  convertBoolParser.parse('no'),
  false
); // success

assert.strictEqual(
  sparse.boolean.or(boolStrParser).parse('on'),
  boolStrParser.or(sparse.boolean).parse(true)
); // success

assert.throws(
  function() {
    return convertBoolParser.parse(0);
  },
  sparse.ConfigParseError
); // failure

assert.throws(
  function() {
    return convertBoolParser.parse('str');
  },
  sparse.ConfigParseError
); // failure

assert.throws(
  function() {
    return convertBoolParser.parse([]);
  },
  sparse.ConfigParseError
); // failure
