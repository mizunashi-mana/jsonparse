'use strict';

var sparse = require('sonparser');

var nestReporter = sparse.reporters.nestReporter;

var nestConsoleReporter = nestReporter(
  console.log
);
var nestShConsoleReporter = nestReporter(
  console.log, 1
);

/**
 * Output:
 * this : "not boolean" is not 'boolean'
 */
sparse.boolean
  .parseWithResult('not boolean').report(nestConsoleReporter);

/**
 * Output:
 * this : failed to parse elem of 'object'
 * ├── .pB : "not boolean" is not 'boolean'
 * ├─┬ .pP1 : failed to parse elem of 'object'
 * │ ├── .pB : "not boolean" is not 'boolean'
 * │ └─┬ .pA : failed to parse elem of 'array'
 * │   ├── [0] : 0 is not 'boolean'
 * │   └── [2] : "str" is not 'boolean'
 * └── .pP2 : "not object" is not 'object'
 */
sparse.hasProperties([
  ['pB', sparse.boolean],
  ['pP1', sparse.hasProperties([
    ['pB', sparse.boolean],
    ['pA', sparse.array(sparse.boolean)],
  ])],
  ['pP2', sparse.hasProperties([
    ['pB', sparse.boolean],
  ])],
]).parseWithResult({
  pB: 'not boolean',
  pP1: {
    pB: 'not boolean',
    pA: [0, true, 'str'],
  },
  pP2: 'not object',
}).report(nestConsoleReporter);

/**
 * Output:
 * this : failed to parse elem of 'object'
 * ├── .pB : "not boolean" is not 'boolean'
 * ├── .pP1 : failed to parse elem of 'object'
 * └── .pP2 : "not object" is not 'object'
 */
sparse.hasProperties([
  ['pB', sparse.boolean],
  ['pP1', sparse.hasProperties([
    ['pB', sparse.boolean],
    ['pA', sparse.array(sparse.boolean)],
  ])],
  ['pP2', sparse.hasProperties([
    ['pB', sparse.boolean],
  ])],
]).parseWithResult({
  pB: 'not boolean',
  pP1: {
    pB: 'not boolean',
    pA: [0, true, 'str'],
  },
  pP2: 'not object',
}).report(nestShConsoleReporter);
