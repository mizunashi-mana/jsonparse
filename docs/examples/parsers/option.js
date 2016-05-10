'use strict';

var sparse = require('sonparser');
var assert = require('assert');

/**
 * Option parser sets option value when target value is `undefined`.
 */
var MyFlagObjParser = sparse.hasProperties([
  ['flag', sparse.boolean.option(false)],
]);

assert.deepEqual(
  MyFlagObjParser.parse({flag: true}),
  {flag: true}
); // success

assert.deepEqual(
  MyFlagObjParser.parse({}),
  {flag: false}
); // success with option value(false)

assert.deepEqual(
  MyFlagObjParser.parse({flag: null}),
  {flag: false}
); // success with option value(false)

assert.throws(
  function() {
    return MyFlagObjParser.parse({flag: 'true'});
  },
  sparse.ConfigParseError
); // failure
