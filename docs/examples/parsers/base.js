'use strict';

var sparse = require('sonparser');
var assert = require('assert');

// all objects pass through as they are
assert.strictEqual(sparse.base.parse(true), true);
assert.strictEqual(sparse.base.parse(0), 0);
assert.strictEqual(sparse.base.parse('str'), 'str');
assert.deepEqual(sparse.base.parse({a: 'a'}), {a: 'a'});
assert.deepEqual(sparse.base.parse(['a', 'b']), ['a', 'b']);
