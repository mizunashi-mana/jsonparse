var sparse = require("sonparser");
var assert = require("assert");

var jsonReporter = sparse.reporters.jsonReporter;

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
sparse.boolean
  .parseWithResult("not boolean").report(jsonConsoleReporter);

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
sparse.hasProperties([
  ["pB", sparse.boolean],
  ["pP1", sparse.hasProperties([
    ["pB", sparse.boolean],
    ["pA", sparse.array(sparse.boolean)],
  ])],
  ["pP2", sparse.hasProperties([
    ["pB", sparse.boolean],
  ])],
]).parseWithResult({
  "pB": "not boolean",
  "pP1": {
    "pB": "not boolean",
    "pA": [0, true, "str"],
  },
  "pP2": "not object",
}).report(jsonConsoleReporter);

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
sparse.hasProperties([
  ["pB", sparse.boolean],
  ["pP1", sparse.hasProperties([
    ["pB", sparse.boolean],
    ["pA", sparse.array(sparse.boolean)],
  ])],
  ["pP2", sparse.hasProperties([
    ["pB", sparse.boolean],
  ])],
]).parseWithResult({
  "pB": "not boolean",
  "pP1": {
    "pB": "not boolean",
    "pA": [0, true, "str"],
  },
  "pP2": "not object",
}).report(jsonShConsoleReporter);

/**
 * Output:
 * ```
 * {"pB":"\"not boolean\" is not 'boolean'","pP1":{"pB":"\"not boolean\" is not 'boolean'","pA":{"[0]":"0 is not 'boolean'","[2]":"\"str\" is not 'boolean'"}},"pP2":"\"not object\" is not 'object'"}
 * ```
 */
sparse.hasProperties([
  ["pB", sparse.boolean],
  ["pP1", sparse.hasProperties([
    ["pB", sparse.boolean],
    ["pA", sparse.array(sparse.boolean)],
  ])],
  ["pP2", sparse.hasProperties([
    ["pB", sparse.boolean],
  ])],
]).parseWithResult({
  "pB": "not boolean",
  "pP1": {
    "pB": "not boolean",
    "pA": [0, true, "str"],
  },
  "pP2": "not object",
}).report(jsonOLConsoleReporter);

/**
 * Output:
 * ```
 * {"pB":"\"not boolean\" is not 'boolean'","pP1":"failed to parse elem of 'object'","pP2":"\"not object\" is not 'object'"}
 * ```
 */
sparse.hasProperties([
  ["pB", sparse.boolean],
  ["pP1", sparse.hasProperties([
    ["pB", sparse.boolean],
    ["pA", sparse.array(sparse.boolean)],
  ])],
  ["pP2", sparse.hasProperties([
    ["pB", sparse.boolean],
  ])],
]).parseWithResult({
  "pB": "not boolean",
  "pP1": {
    "pB": "not boolean",
    "pA": [0, true, "str"],
  },
  "pP2": "not object",
}).report(jsonOLShConsoleReporter);
