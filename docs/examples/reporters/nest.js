const sparse = require("sonparser");
const assert = require("assert");

const nestReporter = sparse.Reporters.nestReporter;

const nestConsoleReporter = nestReporter(
  console.log
);
const nestShConsoleReporter = nestReporter(
  console.log, 1
);

/**
 * Output:
 * this : "not boolean" is not 'boolean'
 */
assert.throws(
  () => sparse.boolean.parseWithReporter(
    "not boolean",
    nestConsoleReporter
  ),
  sparse.ConfigParseError
);

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
  }, nestConsoleReporter),
  sparse.ConfigParseError
);

/**
 * Output:
 * this : failed to parse elem of 'object'
 * ├── .pB : "not boolean" is not 'boolean'
 * ├── .pP1 : failed to parse elem of 'object'
 * └── .pP2 : "not object" is not 'object'
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
  }, nestShConsoleReporter),
  sparse.ConfigParseError
);
