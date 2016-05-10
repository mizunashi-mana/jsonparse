'use strict';

var sparse = require('sonparser');
var assert = require('assert');

/**
 * This parser sets default value(true) on last parse failed.
 */
var defaultTrueParser = sparse.boolean.default(true);

assert.strictEqual(
  defaultTrueParser.parse(false),
  false
); // success

assert.strictEqual(
  defaultTrueParser.parse(true),
  true
); // success

// set default on failure
assert.strictEqual(
  defaultTrueParser.parse('unexpected'),
  true
); // success
