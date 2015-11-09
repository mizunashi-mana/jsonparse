var sparse = require("sonparser");
var assert = require("assert");

function detailReporter(depth) {
  if (typeof depth !== "number" && typeof depth !== "undefined") {
    throw new TypeError("depth must be number.");
  }

  return sparse.Reporters.customReporter(function(reportInfo, data) {
    if (data.depth > depth) {
      return;
    }

    if (data.depth === depth || data.isLeaf) {
      console.log("Error:[" + data.propertyName + "]:" + reportInfo.message);
      if (
        typeof reportInfo.expected !== "undefined" && typeof reportInfo.actual !== "undefined"
      ) {
        console.log("   - Expected " + reportInfo.expected + ", but got " + reportInfo.actual);
      }
    }
  });
}

assert.throws(
  function() {
    return sparse.boolean.parseWithReporter("not expected!", detailReporter());
  },
  sparse.ConfigParseError
);

assert.throws(
  function() {
    return sparse.hasProperties([
      ["prop1", sparse.boolean],
      ["prop2", sparse.hasProperties([
        ["prop21", sparse.string],
      ])],
      ["prop3", sparse.array(sparse.number)],
    ]).parseWithReporter({
      "prop1": "not boolean!",
      "prop2": {
        "anything": "not prop21",
      },
      "prop3": [ "not number", 1, true ],
    }, detailReporter());
  },
  sparse.ConfigParseError
);

assert.throws(
  function() {
    return sparse.hasProperties([
      ["prop1", sparse.boolean],
      ["prop2", sparse.hasProperties([
        ["prop21", sparse.hasProperties([
          ["prop211", sparse.hasProperties([
            ["prop2111", sparse.number]
          ])]
        ])],
        ["prop22", sparse.hasProperties([
          ["prop221", sparse.hasProperties([
            ["prop2211", sparse.number]
          ])]
        ])],
      ])],
      ["prop3", sparse.array(sparse.array(sparse.array(sparse.number)))],
    ]).parseWithReporter({
      "prop1": "not boolean!",
      "prop2": {
        "prop21": {
          "anything": "not prop211",
        },
        "prop22": {
          "prop221": {
            "anything": "not prop211",
          },
        },
      },
      "prop3": [
        "not number array",
        [
          ["not number"]
        ],
      ],
    }, detailReporter(3));
  },
  sparse.ConfigParseError
);
