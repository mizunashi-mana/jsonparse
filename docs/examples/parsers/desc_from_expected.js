'use strict';

var sparse = require('sonparser');
var assert = require('assert');

/**
 * This parser fileters my enum value.
 */
var MyEnumParser = sparse.string.and(sparse.custom(
  function(makeSuccess, makeFailure) {
    return function(obj) {
      if (['VAL1', 'VAL2', 'VAL3'].indexOf(obj) !== -1) {
        return makeSuccess(obj);
      }
      return makeFailure();
    };
  }
)).descFromExpected(['VAL1', 'VAL2', 'VAL3']);

assert.strictEqual(
  MyEnumParser.parse('VAL2'),
  'VAL2'
); // success

// Thrown error message was converted from expected types.
try {
  MyEnumParser.parse('str'); // failure
  assert(false, "Don't reach here!");
} catch (e) {
  assert(e instanceof sparse.ConfigParseError);
  console.log('Got Error: ' + e.message);
}
