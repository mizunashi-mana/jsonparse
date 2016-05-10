'use strict';

var sparse = require('sonparser');
var assert = require('assert');

assert.deepEqual(
  sparse.object.parse({}),
  {}
); // success

assert.deepEqual(
  sparse.object.parse({a: 'a'}),
  {a: 'a'}
); // success

assert.deepEqual(
  sparse.object.parse({0: 'a', length: '1'}),
  {0: 'a', length: '1'}
); // success

assert.throws(
  function() {
    return sparse.object.parse(false);
  },
  sparse.ConfigParseError
); // failure

assert.throws(
  function() {
    return sparse.object.parse(10);
  },
  sparse.ConfigParseError
); // failure

assert.throws(
  function() {
    return sparse.object.parse('str');
  },
  sparse.ConfigParseError
); // failure

assert.throws(
  function() {
    return sparse.object.parse([0, 1]);
  },
  sparse.ConfigParseError
); // failure
