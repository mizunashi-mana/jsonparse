'use strict';

var sparse = require('sonparser');
var EventEmitter = require('events').EventEmitter;

var customReporter = sparse.reporters.customReporter;

/**
 * Detailing reporter
 *
 * @param {Number} depth nest depth with reporting
 * @returns {Void} no return
 */
function detailReporter(depth) {
  if (typeof depth !== 'number' && typeof depth !== 'undefined') {
    throw new TypeError('depth must be number.');
  }

  return customReporter(function(reportInfo, data) {
    if (data.depth > depth) {
      return;
    }

    if (data.depth === depth || data.isLeaf) {
      console.log('Error:[' + data.propertyName + ']: ' + reportInfo.message);
      if (
        typeof reportInfo.expected !== 'undefined' && typeof reportInfo.actual !== 'undefined'
      ) {
        console.log('   - Expected ' + reportInfo.expected + ', but got ' + reportInfo.actual);
      }
    }
  });
}

/**
 * Output:
 * ```
 * Error:[this]: "not expected!" is not 'boolean'
 *   - Expected boolean, but got "not expected!"
 * ```
 */
sparse.boolean.parseWithResult('not expected!').report(detailReporter());

/**
 * Output:
 * ```
 * Error:[this.prop1]: "not boolean!" is not 'boolean'
 *   - Expected boolean, but got "not boolean!"
 * Error:[this.prop2.prop21]: undefined is not 'string'
 *   - Expected string, but got undefined
 * Error:[this.prop3[0]]: "not number" is not 'number'
 *   - Expected number, but got "not number"
 * Error:[this.prop3[2]]: true is not 'number'
 *   - Expected number, but got true
 * ```
 */
sparse.hasProperties([
  ['prop1', sparse.boolean],
  ['prop2', sparse.hasProperties([
    ['prop21', sparse.string],
  ])],
  ['prop3', sparse.array(sparse.number)],
]).parseWithResult({
  prop1: 'not boolean!',
  prop2: {
    anything: 'not prop21',
  },
  prop3: [ 'not number', 1, true ],
}).report(detailReporter());

/**
 * Output:
 * ```
 * Error:[this.prop1]: "not boolean!" is not 'boolean'
 *   - Expected boolean, but got "not boolean!"
 * Error:[this.prop2.prop21.prop211]: undefined is not 'object'
 *   - Expected object, but got undefined
 * Error:[this.prop2.prop22.prop221]: failed to parse elem of 'object'
 *   - Expected object, but got {"anything":"not prop211"}
 * Error:[this.prop3[0]]: "not number array" is not 'array'
 *   - Expected array, but got "not number array"
 * Error:[this.prop3[1][0]]: failed to parse elem of 'array'
 *   - Expected array, but got ["not number"]
 * ```
 */
sparse.hasProperties([
  ['prop1', sparse.boolean],
  ['prop2', sparse.hasProperties([
    ['prop21', sparse.hasProperties([
      ['prop211', sparse.hasProperties([
        ['prop2111', sparse.number]
      ])]
    ])],
    ['prop22', sparse.hasProperties([
      ['prop221', sparse.hasProperties([
        ['prop2211', sparse.number]
      ])]
    ])],
  ])],
  ['prop3', sparse.array(sparse.array(sparse.array(sparse.number)))],
]).parseWithResult({
  prop1: 'not boolean!',
  prop2: {
    prop21: {
      anything: 'not prop211',
    },
    prop22: {
      prop221: {
        anything: 'not prop211',
      },
    },
  },
  prop3: [
    'not number array', [
      ['not number']
    ],
  ],
}).report(detailReporter(3));

/**
 * Extra detail reporter
 *
 * @param {Number} depth nest depth with reporting
 * @returns {Void} no return
 */
function detailExReporter(depth) {
  if (typeof depth !== 'number' && typeof depth !== 'undefined') {
    throw new TypeError('depth must be number.');
  }

  var emitter = new EventEmitter()
    .on('start', function(msg) {
      console.log('Error: ' + msg + ':');
    })
    .on('end', function() {
      console.log('');
      console.log('has problems...');
    });

  return customReporter(function(reportInfo, data) {
    if (data.depth > depth) {
      return;
    }

    if (data.depth === depth || data.isLeaf) {
      console.log('[' + data.propertyName + ']: ' + reportInfo.message);
      if (
        typeof reportInfo.expected !== 'undefined' && typeof reportInfo.actual !== 'undefined'
      ) {
        console.log('   - Expected ' + reportInfo.expected + ', but got ' + reportInfo.actual);
      }
    }
  }, emitter);
}

/**
 * Output:
 * ```
 * Error: Config must be specify properties:
 * [this.prop1]: "not boolean!" is not 'boolean'
 *   - Expected boolean, but got "not boolean!"
 * [this.prop2.prop21.prop211]: undefined is not 'object'
 *   - Expected object, but got undefined
 * [this.prop2.prop22.prop221]: failed to parse elem of 'object'
 *   - Expected object, but got {"anything":"not prop211"}
 * [this.prop3[0]]: "not number array" is not 'array'
 *   - Expected array, but got "not number array"
 * [this.prop3[1][0]]: failed to parse elem of 'array'
 *   - Expected array, but got ["not number"]
 *
 * has problems...
 * ```
 */
sparse.hasProperties([
  ['prop1', sparse.boolean],
  ['prop2', sparse.hasProperties([
    ['prop21', sparse.hasProperties([
      ['prop211', sparse.hasProperties([
        ['prop2111', sparse.number]
      ])]
    ])],
    ['prop22', sparse.hasProperties([
      ['prop221', sparse.hasProperties([
        ['prop2211', sparse.number]
      ])]
    ])],
  ])],
  ['prop3', sparse.array(sparse.array(sparse.array(sparse.number)))],
]).desc('Config must be specify properties')
  .parseWithResult({
    prop1: 'not boolean!',
    prop2: {
      prop21: {
        anything: 'not prop211',
      },
      prop22: {
        prop221: {
          anything: 'not prop211',
        },
      },
    },
    prop3: [
      'not number array', [
        ['not number']
      ],
    ],
  }).report(detailExReporter(3));
