const sparse = require("sonparser");
const assert = require("assert");

const listReporter = sparse.Reporters.listReporter;

const listConsoleReporter = listReporter(
  console.log
);
const listShConsoleReporter = listReporter(
  console.log, 1
);

/**
 * Output:
 * this : "not boolean" is not 'boolean'
 */
assert.throws(
  () => sparse.boolean.parseWithReporter(
    "not boolean",
    listConsoleReporter
  ),
  sparse.ConfigParseError
);

/**
 * Output:
 * this.pB : "not boolean" is not 'boolean'
 * this.pP1.pB : "not boolean" is not 'boolean'
 * this.pP1.pA[0] : 0 is not 'boolean'
 * this.pP1.pA[2] : "str" is not 'boolean'
 * this.pP2 : "not object" is not 'object'
 */
assert.throws(
  () => sparse.hasProperties([
    ["pB", sparse.boolean],
    ["pP1", sparse.hasProperties([
      ["pB", sparse.boolean],
      ["pA", sparse.array(sparse.boolean)],
    ])],
    ["pP2", sparse.hasProperties([
      ["pB", sparse.boolean],
    ])],
  ]).parseWithReporter({
    "pB": "not boolean",
    "pP1": {
      "pB": "not boolean",
      "pA": [0, true, "str"],
    },
    "pP2": "not object",
  }, listConsoleReporter),
  sparse.ConfigParseError
);

/**
 * Output:
 * this.pB : "not boolean" is not 'boolean'
 * this.pP1 : failed to parse elem of 'object'
 * this.pP2 : "not object" is not 'object'
 */
assert.throws(
  () => sparse.hasProperties([
    ["pB", sparse.boolean],
    ["pP1", sparse.hasProperties([
      ["pB", sparse.boolean],
      ["pA", sparse.array(sparse.boolean)],
    ])],
    ["pP2", sparse.hasProperties([
      ["pB", sparse.boolean],
    ])],
  ]).parseWithReporter({
    "pB": "not boolean",
    "pP1": {
      "pB": "not boolean",
      "pA": [0, true, "str"],
    },
    "pP2": "not object",
  }, listShConsoleReporter),
  sparse.ConfigParseError
);
