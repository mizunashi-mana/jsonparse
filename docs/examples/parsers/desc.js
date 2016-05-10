'use strict';

var sparse = require('sonparser');
var assert = require('assert');

var flag;
var FlagParser = sparse.boolean
  .desc('`flag` should be boolean object.');

flag = true;
assert.strictEqual(
  FlagParser.parse(flag),
  true
); // success

flag = 'true';
assert.throws(
  function() {
    return FlagParser.parse(flag);
  },
  sparse.ConfigParseError,
  '`flag` should be boolean object.'
); // failure with custom description
