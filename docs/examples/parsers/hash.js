'use strict';

var sparse = require('sonparser');
var assert = require('assert');

assert.deepEqual(
  sparse.hash(sparse.boolean).parse({}),
  {}
); // success

assert.deepEqual(
  sparse.hash(sparse.boolean).parse({a: true, b: true}),
  {a: true, b: true}
); // success

assert.deepEqual(
  sparse.hash(sparse.boolean).parse({0: true, 1: true}),
  {0: true, 1: true}
); // success

assert.throws(
  function() {
    return sparse.hash(sparse.boolean).parse('not hash object');
  },
  sparse.ConfigParseError
); // failure

assert.throws(
  function() {
    return sparse.hash(sparse.boolean).parse({a: 'not boolean'});
  },
  sparse.ConfigParseError
); // failure
