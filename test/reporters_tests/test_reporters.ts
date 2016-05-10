/// <reference path="../lib/typings.ts" />

import {
  assert,
  assertThrow,
} from '../lib/chai_setup';

import * as sparse from '../../lib/';
const {
  ConfigParseError,
} = sparse;

const {
  nestReporter,
  listReporter,
  jsonReporter,
  customReporter,
} = sparse.reporters;

describe('reporters test', () => {
  function assertDataWithReport<T, U>(data: {
    parser: sparse.ConfigParser<T, U>,
    input: T,
    output: string[]
  }, reporter: (logFunc: (msg: string) => any) => sparse.ReporterType) {
    let calledCount = 0;

    const assertOutputFunc = (msg: string) => {
      assert.strictEqual(msg, data.output[calledCount++]);
    };

    const parseResult = data.parser.parseWithResult(data.input);

    // should be input is wrong
    assertThrow(
      () => parseResult.except(),
      ConfigParseError
    );

    parseResult.report(reporter(assertOutputFunc));
    assert.strictEqual(calledCount, data.output.length, 'should be called same as output count');
  }

  it('should report nested by nestReporter', () => {
    const reportData1 = {
      parser: sparse.hasProperties([
        ['a', sparse.boolean],
        ['b', sparse.hasProperties([
          ['c', sparse.hasProperties([
            ['d', sparse.array(sparse.string)],
            ['e', sparse.number],
          ])],
        ])],
      ]),
      input: {b: {c: {d: [0, 'ww', true]}}},
      output: [
        "this : failed to parse elem of 'object'",
        "├── .a : undefined is not 'boolean'",
        "└─┬ .b : failed to parse elem of 'object'",
        "  └─┬ .c : failed to parse elem of 'object'",
        "    ├─┬ .d : failed to parse elem of 'array'",
        "    │ ├── [0] : 0 is not 'string'",
        "    │ └── [2] : true is not 'string'",
        "    └── .e : undefined is not 'number'",
      ],
    };
    const reportData2 = {
      parser: sparse.hasProperties([
        ['a', sparse.boolean],
        ['b', sparse.hasProperties([
          ['c', sparse.hasProperties([
            ['d', sparse.array(sparse.string)],
            ['e', sparse.number],
          ])],
        ])],
      ]),
      input: {b: {c: {d: [0, 'ww', true]}}},
      output: [
        "this : failed to parse elem of 'object'",
        "├── .a : undefined is not 'boolean'",
        "└── .b : failed to parse elem of 'object'",
      ],
    };
    const reportData3 = {
      parser: sparse.boolean,
      input: {a: '', b: true, c: 0, d: {}},
      output: [
        'this : {"a":"","b":true,"c":0,"d":{}} is not \'boolean\'',
      ],
    };
    assertDataWithReport(reportData1, (logFunc) => nestReporter(logFunc));
    assertDataWithReport(reportData2, (logFunc) => nestReporter(logFunc, 1));
    assertDataWithReport(reportData3, (logFunc) => nestReporter(logFunc));
    assertDataWithReport(reportData3, (logFunc) => nestReporter(logFunc, 3));
  });

  it('should report listed by listReporter', () => {
    const reportData1 = {
      parser: sparse.hasProperties([
        ['a', sparse.boolean],
        ['b', sparse.hasProperties([
          ['c', sparse.hasProperties([
            ['d', sparse.array(sparse.string)],
            ['e', sparse.number],
          ])],
        ])],
      ]),
      input: {b: {c: {d: [0, 'ww', true]}}},
      output: [
        "this.a : undefined is not 'boolean'",
        "this.b.c.d[0] : 0 is not 'string'",
        "this.b.c.d[2] : true is not 'string'",
        "this.b.c.e : undefined is not 'number'",
      ],
    };
    const reportData2 = {
      parser: sparse.hasProperties([
        ['a', sparse.boolean],
        ['b', sparse.hasProperties([
          ['c', sparse.hasProperties([
            ['d', sparse.array(sparse.string)],
            ['e', sparse.number],
          ])],
        ])],
      ]),
      input: {b: {c: {d: [0, 'ww', true]}}},
      output: [
        "this.a : undefined is not 'boolean'",
        "this.b : failed to parse elem of 'object'",
      ],
    };
    const reportData3 = {
      parser: sparse.boolean,
      input: {a: '', b: true, c: 0, d: {}},
      output: [
        'this : {"a":"","b":true,"c":0,"d":{}} is not \'boolean\'',
      ],
    };
    assertDataWithReport(reportData1, (logFunc) => listReporter(logFunc));
    assertDataWithReport(reportData2, (logFunc) => listReporter(logFunc, 1));
    assertDataWithReport(reportData3, (logFunc) => listReporter(logFunc));
    assertDataWithReport(reportData3, (logFunc) => listReporter(logFunc, 3));
  });

  it('should report json format by jsonReporter', () => {
    const reportData1 = {
      parser: sparse.hasProperties([
        ['a', sparse.boolean],
        ['b', sparse.hasProperties([
          ['c', sparse.hasProperties([
            ['d', sparse.array(sparse.string)],
            ['e', sparse.number],
          ])],
        ])],
      ]),
      input: {b: {c: {d: [0, 'ww', true]}}},
      output: [
        '{',
        '  "a": "undefined is not \'boolean\'",',
        '  "b": {',
        '    "c": {',
        '      "d": {',
        '        "[0]": "0 is not \'string\'",',
        '        "[2]": "true is not \'string\'"',
        '      },',
        '      "e": "undefined is not \'number\'"',
        '    }',
        '  }',
        '}',
      ],
    };
    const reportData2 = {
      parser: sparse.hasProperties([
        ['a', sparse.boolean],
        ['b', sparse.hasProperties([
          ['c', sparse.hasProperties([
            ['d', sparse.array(sparse.string)],
            ['e', sparse.number],
          ])],
        ])],
      ]),
      input: {b: {c: {d: [0, 'ww', true]}}},
      output: [
        '{"a":"undefined is not \'boolean\'",'
        + '"b":{"c":{"d":'
        + '{"[0]":"0 is not \'string\'",'
        + '"[2]":"true is not \'string\'"},'
        + '"e":"undefined is not \'number\'"}}}',
      ],
    };
    const reportData3 = {
      parser: sparse.hasProperties([
        ['a', sparse.boolean],
        ['b', sparse.hasProperties([
          ['c', sparse.hasProperties([
            ['d', sparse.array(sparse.string)],
            ['e', sparse.number],
          ])],
        ])],
      ]),
      input: {b: {c: {d: [0, 'ww', true]}}},
      output: [
        '{',
        '  "a": "undefined is not \'boolean\'",',
        '  "b": "failed to parse elem of \'object\'"',
        '}',
      ],
    };
    const reportData4 = {
      parser: sparse.hasProperties([
        ['a', sparse.boolean],
        ['b', sparse.hasProperties([
          ['c', sparse.hasProperties([
            ['d', sparse.array(sparse.string)],
            ['e', sparse.number],
          ])],
        ])],
      ]),
      input: {b: {c: {d: [0, 'ww', true]}}},
      output: [
        "{\"a\":\"undefined is not 'boolean'\","
        + "\"b\":\"failed to parse elem of 'object'\"}",
      ],
    };
    const reportData5 = {
      parser: sparse.boolean,
      input: {a: '', b: true, c: 0, d: {}},
      output: [
        '"{\\"a\\":\\"\\",\\"b\\":true,\\"c\\":0,\\"d\\":{}}'
        + ' is not \'boolean\'"',
      ],
    };
    assertDataWithReport(reportData1, (logFunc) => jsonReporter(logFunc));
    assertDataWithReport(reportData2, (logFunc) => jsonReporter(logFunc, {isOneLine: true}));
    assertDataWithReport(reportData3, (logFunc) => jsonReporter(logFunc, 1));
    assertDataWithReport(reportData4, (logFunc) => jsonReporter(logFunc, {isOneLine: true}, 1));
    assertDataWithReport(reportData5, (logFunc) => jsonReporter(logFunc));
    assertDataWithReport(reportData5, (logFunc) => jsonReporter(logFunc, 3));
    assertDataWithReport(reportData5, (logFunc) => jsonReporter(logFunc, {isOneLine: true}));
  });

  it('should report custom format by customReporter', () => {
    function detailReporter(logFunc: (msg: string) => void, depth?: number) {
      const is_depth = typeof depth !== 'undefined';
      return customReporter(function(reportInfo, data) {
        if (is_depth && data.depth > depth) {
          return;
        }

        if (is_depth && data.depth === depth || data.isLeaf) {
          logFunc(`Error:[${data.propertyName}]: ${reportInfo.message}`);
          if (
            typeof reportInfo.expected !== 'undefined' && typeof reportInfo.actual !== 'undefined'
          ) {
            logFunc(`   - Expected ${reportInfo.expected}, but got ${reportInfo.actual}.`);
          }
        }
      });
    }

    const reportData1 = {
      parser: sparse.hasProperties([
        ['a', sparse.boolean],
        ['b', sparse.hasProperties([
          ['c', sparse.hasProperties([
            ['d', sparse.array(sparse.string)],
            ['e', sparse.number],
          ])],
        ])],
      ]),
      input: { b: { c: { d: [0, 'ww', true] } } },
      output: [
        "Error:[this.a]: undefined is not 'boolean'",
        '   - Expected boolean, but got undefined.',
        "Error:[this.b.c.d[0]]: 0 is not 'string'",
        '   - Expected string, but got 0.',
        "Error:[this.b.c.d[2]]: true is not 'string'",
        '   - Expected string, but got true.',
        "Error:[this.b.c.e]: undefined is not 'number'",
        '   - Expected number, but got undefined.',
      ],
    };
    const reportData2 = {
      parser: sparse.hasProperties([
        ['a', sparse.boolean],
        ['b', sparse.hasProperties([
          ['c', sparse.hasProperties([
            ['d', sparse.array(sparse.string)],
            ['e', sparse.number],
          ])],
        ])],
      ]),
      input: { b: { c: { d: [0, 'ww', true] } } },
      output: [
        "Error:[this.a]: undefined is not 'boolean'",
        '   - Expected boolean, but got undefined.',
        "Error:[this.b]: failed to parse elem of 'object'",
        '   - Expected object, but got {"c":{"d":[0,"ww",true]}}.',
      ],
    };
    const reportData3 = {
      parser: sparse.boolean,
      input: { a: '', b: true, c: 0, d: {} },
      output: [
        'Error:[this]: {"a":"","b":true,"c":0,"d":{}} is not \'boolean\'',
        '   - Expected boolean, but got {"a":"","b":true,"c":0,"d":{}}.',
      ],
    };

    assertDataWithReport(reportData1, (logFunc) => detailReporter(logFunc));
    assertDataWithReport(reportData2, (logFunc) => detailReporter(logFunc, 1));
    assertDataWithReport(reportData3, (logFunc) => detailReporter(logFunc));
    assertDataWithReport(reportData3, (logFunc) => detailReporter(logFunc, 3));
  });

});
