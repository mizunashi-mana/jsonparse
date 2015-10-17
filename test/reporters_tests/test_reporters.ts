/// <reference path="../../lib/lib/typings.d.ts" />

import {
  assert,
  assertThrow,
} from "../lib/chai_setup";

import * as sonparse from "../../lib/";
const {
  nestedReporter,
  listReporter,
  jsonReporter,
  ConfigParseError,
} = sonparse;

describe("reporters test", () => {
  function assertDataWithReport<T, U>(data: {
    parser: sonparse.ConfigParser<T, U>,
    input: T,
    output: string[]
  }, reporter: (logFunc: (msg: string) => any) => sonparse.ReporterType) {
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
      parser: sonparse.hasProperties([
        ["a", sonparse.boolean],
        ["b", sonparse.hasProperties([
          ["c", sonparse.hasProperties([
            ["d", sonparse.array(sonparse.string)],
            ["e", sonparse.number],
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
      parser: sonparse.hasProperties([
        ["a", sonparse.boolean],
        ["b", sonparse.hasProperties([
          ["c", sonparse.hasProperties([
            ["d", sonparse.array(sonparse.string)],
            ["e", sonparse.number],
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
      parser: sonparse.boolean,
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
      parser: sonparse.hasProperties([
        ["a", sonparse.boolean],
        ["b", sonparse.hasProperties([
          ["c", sonparse.hasProperties([
            ["d", sonparse.array(sonparse.string)],
            ["e", sonparse.number],
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
      parser: sonparse.hasProperties([
        ["a", sonparse.boolean],
        ["b", sonparse.hasProperties([
          ["c", sonparse.hasProperties([
            ["d", sonparse.array(sonparse.string)],
            ["e", sonparse.number],
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
      parser: sonparse.boolean,
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

  it("should report json format by jsonReporter", () => {
    const reportData1 = {
      parser: sonparse.hasProperties([
        ["a", sonparse.boolean],
        ["b", sonparse.hasProperties([
          ["c", sonparse.hasProperties([
            ["d", sonparse.array(sonparse.string)],
            ["e", sonparse.number],
          ])],
        ])],
      ]),
      input: {"b": {"c": {"d": [0, "ww", true]}}},
      output: [
        "{",
        "  \"a\": \"undefined is not 'boolean'\",",
        "  \"b\": {",
        "    \"c\": {",
        "      \"d\": {",
        "        \"[0]\": \"0 is not 'string'\",",
        "        \"[2]\": \"true is not 'string'\"",
        "      },",
        "      \"e\": \"undefined is not 'number'\"",
        "    }",
        "  }",
        "}",
      ],
    };
    const reportData2 = {
      parser: sonparse.hasProperties([
        ["a", sonparse.boolean],
        ["b", sonparse.hasProperties([
          ["c", sonparse.hasProperties([
            ["d", sonparse.array(sonparse.string)],
            ["e", sonparse.number],
          ])],
        ])],
      ]),
      input: {"b": {"c": {"d": [0, "ww", true]}}},
      output: [
        "{\"a\":\"undefined is not 'boolean'\","
        + "\"b\":{\"c\":{\"d\":"
        + "{\"[0]\":\"0 is not 'string'\","
        + "\"[2]\":\"true is not 'string'\"},"
        + "\"e\":\"undefined is not 'number'\"}}}",
      ],
    };
    const reportData3 = {
      parser: sonparse.hasProperties([
        ["a", sonparse.boolean],
        ["b", sonparse.hasProperties([
          ["c", sonparse.hasProperties([
            ["d", sonparse.array(sonparse.string)],
            ["e", sonparse.number],
          ])],
        ])],
      ]),
      input: {"b": {"c": {"d": [0, "ww", true]}}},
      output: [
        "{",
        "  \"a\": \"undefined is not 'boolean'\",",
        "  \"b\": \"failed to parse elem of 'object'\"",
        "}",
      ],
    };
    const reportData4 = {
      parser: sonparse.hasProperties([
        ["a", sonparse.boolean],
        ["b", sonparse.hasProperties([
          ["c", sonparse.hasProperties([
            ["d", sonparse.array(sonparse.string)],
            ["e", sonparse.number],
          ])],
        ])],
      ]),
      input: {"b": {"c": {"d": [0, "ww", true]}}},
      output: [
        "{\"a\":\"undefined is not 'boolean'\","
        + "\"b\":\"failed to parse elem of 'object'\"}",
      ],
    };
    const reportData5 = {
      parser: sonparse.boolean,
      input: {a: "", b: true, c: 0, d: {}},
      output: [
        "\"{\\\"a\\\":\\\"\\\",\\\"b\\\":true,\\\"c\\\":0,\\\"d\\\":{}}"
        + " is not 'boolean'\"",
      ],
    };
    assertDataWithReport(reportData1, (logFunc) => jsonReporter(logFunc));
    assertDataWithReport(reportData2, (logFunc) => jsonReporter(logFunc, {isOneLine: true}));
    assertDataWithReport(reportData3, (logFunc) => jsonReporter(logFunc, undefined, 1));
    assertDataWithReport(reportData4, (logFunc) => jsonReporter(logFunc, {isOneLine: true}, 1));
    assertDataWithReport(reportData5, (logFunc) => jsonReporter(logFunc));
    assertDataWithReport(reportData5, (logFunc) => jsonReporter(logFunc, undefined, 3));
    assertDataWithReport(reportData5, (logFunc) => jsonReporter(logFunc, {isOneLine: true}));
  });

});
