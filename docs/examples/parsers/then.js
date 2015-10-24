const sparse = require("sonparser");
const assert = require("assert");

/**
 * Then parser returns last result as it is.
 */
assert.strictEqual(
  sparse.boolean.then(function(obj) {
    assert.strictEqual(obj, true);
  }, function(msg, exp, act) {
    throw Error("This function will not be called.");
  }).parse(true),
  true
); // success

/**
 * Then parser returns last result as it is.
 */
assert.throws(
  sparse.boolean.catch(function(obj) {
    throw Error("This function will not be called.");
  }, function(msg, exp, act) {
    console.log(`Error: ${msg}`);
    console.log(`Error: Expected ${exp}, but actual ${act}.`);
  }).parse("str"),
  sparse.ConfigParseError
); // failure
