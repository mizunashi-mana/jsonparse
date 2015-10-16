/// <reference path="../../lib/lib/typings.d.ts" />

import {
  assert,
  assertThrow,
} from "../lib/chai_setup";

import * as jsonparse from "../../lib/";
const {
  nestedReporter,
  listReporter,
  ConfigParseError,
} = jsonparse;

describe("reporters test", () => {
  function assertDataWithReport<T, U>(data: {
    parser: jsonparse.ConfigParser<T, U>,
    input: T,
    output: string[]
  }, reporter: (logFunc: (msg: string) => any) => jsonparse.ReporterType) {
    let calledCount = 0;
    const assertOutputFunc = (msg: string) => {
      assert.strictEqual(msg, data.output[calledCount++]);
    };

    assertThrow(() => data.parser.parseWithReporter(
      data.input,
      reporter(assertOutputFunc)
    ), ConfigParseError);
    assert.strictEqual(calledCount, data.output.length, "should be called same as output count");
  }

  it("should report nested by nestedReporter", () => {
    const reportData1 = {
      parser: jsonparse.hasProperties([
        ["a", jsonparse.boolean],
        ["b", jsonparse.hasProperties([
          ["c", jsonparse.hasProperties([
            ["d", jsonparse.array(jsonparse.string)],
            ["e", jsonparse.number],
          ])],
        ])],
      ]),
      input: {"b": {"c": {"d": [0, "ww", true]}}},
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
      parser: jsonparse.hasProperties([
        ["a", jsonparse.boolean],
        ["b", jsonparse.hasProperties([
          ["c", jsonparse.hasProperties([
            ["d", jsonparse.array(jsonparse.string)],
            ["e", jsonparse.number],
          ])],
        ])],
      ]),
      input: {"b": {"c": {"d": [0, "ww", true]}}},
      output: [
        "this : failed to parse elem of 'object'",
        "├── .a : undefined is not 'boolean'",
        "└── .b : failed to parse elem of 'object'",
      ],
    };
    const reportData3 = {
      parser: jsonparse.boolean,
      input: {a: "", b: true, c: 0, d: {}},
      output: [
        "this : {\"a\":\"\",\"b\":true,\"c\":0,\"d\":{}} is not 'boolean'",
      ],
    };
    assertDataWithReport(reportData1, (logFunc) => nestedReporter(logFunc));
    assertDataWithReport(reportData2, (logFunc) => nestedReporter(logFunc, 1));
    assertDataWithReport(reportData3, (logFunc) => nestedReporter(logFunc));
    assertDataWithReport(reportData3, (logFunc) => nestedReporter(logFunc, 3));
  });

  it("should report nested by listReporter", () => {
    const reportData1 = {
      parser: jsonparse.hasProperties([
        ["a", jsonparse.boolean],
        ["b", jsonparse.hasProperties([
          ["c", jsonparse.hasProperties([
            ["d", jsonparse.array(jsonparse.string)],
            ["e", jsonparse.number],
          ])],
        ])],
      ]),
      input: {"b": {"c": {"d": [0, "ww", true]}}},
      output: [
        "this.a : undefined is not 'boolean'",
        "this.b.c.d[0] : 0 is not 'string'",
        "this.b.c.d[2] : true is not 'string'",
        "this.b.c.e : undefined is not 'number'",
      ],
    };
    const reportData2 = {
      parser: jsonparse.hasProperties([
        ["a", jsonparse.boolean],
        ["b", jsonparse.hasProperties([
          ["c", jsonparse.hasProperties([
            ["d", jsonparse.array(jsonparse.string)],
            ["e", jsonparse.number],
          ])],
        ])],
      ]),
      input: {"b": {"c": {"d": [0, "ww", true]}}},
      output: [
        "this.a : undefined is not 'boolean'",
        "this.b : failed to parse elem of 'object'",
      ],
    };
    const reportData3 = {
      parser: jsonparse.boolean,
      input: {a: "", b: true, c: 0, d: {}},
      output: [
        "this : {\"a\":\"\",\"b\":true,\"c\":0,\"d\":{}} is not 'boolean'",
      ],
    };
    assertDataWithReport(reportData1, (logFunc) => listReporter(logFunc));
    assertDataWithReport(reportData2, (logFunc) => listReporter(logFunc, 1));
    assertDataWithReport(reportData3, (logFunc) => listReporter(logFunc));
    assertDataWithReport(reportData3, (logFunc) => listReporter(logFunc, 3));
  });
});
