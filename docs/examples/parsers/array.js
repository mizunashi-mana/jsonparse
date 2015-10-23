const sparse = require("sonparser");
const assert = require("assert");

const strArray = sparse.array(sparse.string);

assert.deepEqual(
  strArray.parse([]),
  []
); // success

assert.deepEqual(
  strArray.parse(["0", "true", "str"]),
  ["0", "true", "str"]
); // success

assert.throws(
  strArray.parse([0, true, "str"]),
  sparse.ConfigParseError
); // failure

assert.throws(
  strArray.parse({}),
  sparse.ConfigParseError
); // failure

const checkArray = sparse.array(sparse.base);

assert.deepEqual(
  checkArray.parse([true, 0, "str", {}, []]),
  [true, 0, "str", {}, []]
); // success

assert.throws(
  checkArray.parse({}),
  sparse.ConfigParseError
); // failure

assert.throws(
  checkArray.parse(true),
  sparse.ConfigParseError
); // failure

const str2DimArray = sparse.array(strArray);

assert.deepEqual(
  str2DimArray.parse([]),
  []
); // success

assert.deepEqual(
  str2DimArray.parse([[]]),
  [[]]
); // success

assert.deepEqual(
  str2DimArray.parse([["str"], ["a", "b"]]),
  [["str"], ["a", "b"], []]
); // success

assert.throws(
  str2DimArray.parse({}),
  sparse.ConfigParseError
); // failure

assert.throws(
  str2DimArray.parse([{}, ["str"]]),
  sparse.ConfigParseError
); // failure

assert.throws(
  str2DimArray.parse([[{}], ["str"]]),
  sparse.ConfigParseError
); // failure
