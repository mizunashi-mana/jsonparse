var sparse = require("sonparser");
var assert = require("assert");

var strArray = sparse.array(sparse.string);

assert.deepEqual(
  strArray.parse([]),
  []
); // success

assert.deepEqual(
  strArray.parse(["0", "true", "str"]),
  ["0", "true", "str"]
); // success

assert.throws(
  function() {
    return strArray.parse([0, true, "str"]);
  },
  sparse.ConfigParseError
); // failure

assert.throws(
  function() {
    return strArray.parse({});
  },
  sparse.ConfigParseError
); // failure

var checkArray = sparse.array(sparse.base);

assert.deepEqual(
  checkArray.parse([true, 0, "str", {}, []]),
  [true, 0, "str", {}, []]
); // success

assert.throws(
  function() {
    return checkArray.parse({});
  },
  sparse.ConfigParseError
); // failure

assert.throws(
  function() {
    return checkArray.parse(true);
  },
  sparse.ConfigParseError
); // failure

var str2DimArray = sparse.array(strArray);

assert.deepEqual(
  str2DimArray.parse([]),
  []
); // success

assert.deepEqual(
  str2DimArray.parse([[]]),
  [[]]
); // success

assert.deepEqual(
  str2DimArray.parse([["str"], ["a", "b"], []]),
  [["str"], ["a", "b"], []]
); // success

assert.throws(
  function() {
    return str2DimArray.parse({});
  },
  sparse.ConfigParseError
); // failure

assert.throws(
  function() {
    return str2DimArray.parse([{}, ["str"]]);
  },
  sparse.ConfigParseError
); // failure

assert.throws(
  function() {
    return str2DimArray.parse([[{}], ["str"]]);
  },
  sparse.ConfigParseError
); // failure
