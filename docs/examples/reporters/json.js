var sparse = require("sonparser");
var assert = require("assert");

var jsonReporter = sparse.Reporters.jsonReporter;

var jsonConsoleReporter = jsonReporter(
  console.log
);
var jsonShConsoleReporter = jsonReporter(
  console.log, 1
);
var jsonOLConsoleReporter = jsonReporter(
  console.log, {isOneLine: true}
);
var jsonOLShConsoleReporter = jsonReporter(
  console.log, {isOneLine: true}, 1
);

/**
 * Output:
 * ```
 * "\"not boolean\" is not 'boolean'"
 * ```
 */
assert.throws(
  function() {
    return sparse.boolean.parseWithReporter(
      "not boolean",
      jsonConsoleReporter
    );
  },
  sparse.ConfigParseError
);

/**
 * Output:
 * ```
 * {
 *  "pB": "\"not boolean\" is not 'boolean'",
 *  "pP1": {
 *    "pB": "\"not boolean\" is not 'boolean'",
 *    "pA": {
 *      "[0]": "0 is not 'boolean'",
 *      "[2]": "\"str\" is not 'boolean'"
 *    }
 *  },
 *  "pP2": "\"not object\" is not 'object'"
 * }
 * ```
 */
assert.throws(
  function() {
    return sparse.hasProperties([
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
    }, jsonConsoleReporter);
  },
  sparse.ConfigParseError
);

/**
 * Output:
 * ```
 * {
 *  "pB": "\"not boolean\" is not 'boolean'",
 *  "pP1": "failed to parse elem of 'object'",
 *  "pP2": "\"not object\" is not 'object'"
 * }
 * ```
 */
assert.throws(
  function() {
    return sparse.hasProperties([
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
    }, jsonShConsoleReporter);
  },
  sparse.ConfigParseError
);

/**
 * Output:
 * ```
 * {"pB":"\"not boolean\" is not 'boolean'","pP1":{"pB":"\"not boolean\" is not 'boolean'","pA":{"[0]":"0 is not 'boolean'","[2]":"\"str\" is not 'boolean'"}},"pP2":"\"not object\" is not 'object'"}
 * ```
 */
assert.throws(
  function() {
    return sparse.hasProperties([
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
    }, jsonOLConsoleReporter);
  },
  sparse.ConfigParseError
);

/**
 * Output:
 * ```
 * {"pB":"\"not boolean\" is not 'boolean'","pP1":"failed to parse elem of 'object'","pP2":"\"not object\" is not 'object'"}
 * ```
 */
assert.throws(
  function() {
    return sparse.hasProperties([
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
    }, jsonOLShConsoleReporter);
  },
  sparse.ConfigParseError
);
