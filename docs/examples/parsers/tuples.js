'use strict';

var sparse = require('sonparser');
var assert = require('assert');

assert.deepEqual(
  sparse.tuple1(sparse.boolean)
    .parse([true]),
  [true]
); // success

assert.deepEqual(
  sparse.tuple2(
    sparse.boolean,
    sparse.string
  ).parse([true, 'str']),
  [true, 'str']
); // success

assert.deepEqual(
  sparse.tuple3(
    sparse.boolean,
    sparse.string,
    sparse.number
  ).parse([true, 'str', 1]),
  [true, 'str', 1]
); // success

assert.deepEqual(
  sparse.tuple4(
    sparse.boolean,
    sparse.string,
    sparse.number,
    sparse.array(sparse.number)
  ).parse([true, 'str', 1, [0]]),
  [true, 'str', 1, [0]]
); // success

assert.deepEqual(
  sparse.tuple5(
    sparse.boolean,
    sparse.string,
    sparse.number,
    sparse.array(sparse.number),
    sparse.array(sparse.boolean)
  ).parse([true, 'str', 1, [0], [false]]),
  [true, 'str', 1, [0], [false]]
); // success

assert.throws(
  function() {
    return sparse.tuple3(
      sparse.boolean,
      sparse.string,
      sparse.number
    ).parse('not expected');
  },
  sparse.ConfigParseError
); // failure

assert.throws(
  function() {
    return sparse.tuple3(
      sparse.boolean,
      sparse.string,
      sparse.number
    ).parse([true, 'str', 1, 'extra']);
  },
  sparse.ConfigParseError
); // failure

assert.throws(
  function() {
    return sparse.tuple3(
      sparse.boolean,
      sparse.string,
      sparse.number
    ).parse(['not', 'expected', 1]);
  },
  sparse.ConfigParseError
); // failure
