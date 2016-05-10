'use strict';

var sparse = require('sonparser');
var assert = require('assert');

assert.strictEqual(
  sparse.string.parse(''),
  ''
); // success

assert.strictEqual(
  sparse.string.parse('str'),
  'str'
); // success

assert.strictEqual(
  sparse.string.parse('0'),
  '0'
); // success

assert.throws(
  function() {
    return sparse.string.parse(false);
  },
  sparse.ConfigParseError
); // failure

assert.throws(
  function() {
    return sparse.string.parse(10);
  },
  sparse.ConfigParseError
); // failure
