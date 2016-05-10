'use strict';

var sparse = require('sonparser');
var assert = require('assert');
var path = require('path');

/**
 * Resolve path util
 *
 * @param {String} pathStr path string
 * @returns {String} resolved path string
 */
function resolvePath(pathStr) {
  return path.isAbsolute(pathStr)
    ? pathStr
    : path.join(__dirname, pathStr)
    ;
}

var myConfParser = sparse.hasProperties([
  ['private', sparse.boolean.option(false)],
  ['name', sparse.string],
  ['version', sparse.string],
  ['description', sparse.string],
  ['keywords', sparse.array(sparse.string).option([])],
  ['scripts', sparse.object],
  ['repository', sparse.hasProperties([
    ['type', sparse.string],
    ['url', sparse.string],
  ]).option({
    type: 'git',
    url: '',
  })],
]).desc('failed to parse my config', 'my config');

// pattern throw Error on failure
assert.deepEqual(
  sparse.parseFile(resolvePath('datas/config.json'), myConfParser),
  {
    private: false,
    name: 'example-sonparser',
    version: '0.0.0',
    description: 'An example of sonparser',
    keywords: [
      'example',
      'more', 'complexible',
    ],
    scripts: {
      test: 'echo "not implements!" && exit 1',
    },
    repository: {
      type: 'git',
      url: '',
    },
  }
); // success


assert.deepEqual(
  sparse.parseFile(resolvePath('datas/config.cson'), myConfParser),
  {
    private: false,
    name: 'example-sonparser',
    version: '0.0.0',
    description: 'An example of sonparser',
    keywords: [
      'example',
      'more', 'complexible',
    ],
    scripts: {
      test: 'echo "not implements!" && exit 1',
    },
    repository: {
      type: 'git',
      url: '',
    },
  }
); // success

/**
 * Unusual extension is also ok.
 * It will be tryed by all son format.
 */
assert.deepEqual(
  sparse.parseFile(resolvePath('datas/config.conf'), myConfParser),
  {
    private: false,
    name: 'example-sonparser',
    version: '0.0.0',
    description: 'An example of sonparser',
    keywords: [
      'example',
      'more', 'complexible',
    ],
    scripts: {
      test: 'echo "not implements!" && exit 1',
    },
    repository: {
      type: 'git',
      url: '',
    },
  }
); // success

/**
 * Type check error or convert missing error will be thrown.
 * You can receive and output error message.
 */
try {
  sparse.parseFile(resolvePath('datas/illconf.cson'), myConfParser);
  assert(false, "Don't reach here!");
} catch (e) {
  assert(e instanceof sparse.ConfigParseError);
  console.log('Got Error: ' + e.message);
}

/**
 * errno error will be recept
 */
assert.throws(
  function() {
    return sparse.parseFile('not exists file!', myConfParser);
  },
  Error
); // failure

/**
 * parse format error will be recept.
 */
assert.throws(
  function() {
    return sparse.parseFile(resolvePath('datas/invalid.cson'), myConfParser);
  },
  Error
); // failure

/**
 * not son file will also receive parse format error.
 */
assert.throws(
  function() {
    return sparse.parseFile(resolvePath('datas/normal.txt'), myConfParser);
  },
  Error
); // failure

// you can use with result method.
var resultConfig = sparse.parseFileWithResult(resolvePath('datas/config.conf'), myConfParser);

assert.strictEqual(resultConfig.status, true);
assert.deepEqual(
  resultConfig.ok,
  {
    private: false,
    name: 'example-sonparser',
    version: '0.0.0',
    description: 'An example of sonparser',
    keywords: [
      'example',
      'more', 'complexible',
    ],
    scripts: {
      test: 'echo "not implements!" && exit 1',
    },
    repository: {
      type: 'git',
      url: '',
    },
  }
);
