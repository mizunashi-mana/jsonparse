'use strict';

var sparse = require('sonparser');

var listReporter = sparse.reporters.listReporter;

var listConsoleReporter = listReporter(
  console.log
);
var listShConsoleReporter = listReporter(
  console.log, 1
);

/**
 * Output:
 * this : "not boolean" is not 'boolean'
 */
sparse.boolean
  .parseWithResult('not boolean').report(listConsoleReporter);

/**
 * Output:
 * this.pB : "not boolean" is not 'boolean'
 * this.pP1.pB : "not boolean" is not 'boolean'
 * this.pP1.pA[0] : 0 is not 'boolean'
 * this.pP1.pA[2] : "str" is not 'boolean'
 * this.pP2 : "not object" is not 'object'
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
}).report(listConsoleReporter);

/**
 * Output:
 * this.pB : "not boolean" is not 'boolean'
 * this.pP1 : failed to parse elem of 'object'
 * this.pP2 : "not object" is not 'object'
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
}).report(listShConsoleReporter);
