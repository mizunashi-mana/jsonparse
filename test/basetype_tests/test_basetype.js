var assert = require("chai").assert;

var jsonparse = require("../../build/");
var ConfigParseError = jsonparse.ConfigParseError;

describe("basetype parsers test", () => {

  it("should be through only boolean value by boolean parser", function() {
    assert.strictEqual(jsonparse.boolean.parse(true), true);
    assert.throw(function() { return jsonparse.boolean.parse(1); }, ConfigParseError);
  });

  it("should be through only number value by number parser", function() {
    assert.strictEqual(jsonparse.number.parse(1), 1);
    assert.throw(function() { return jsonparse.number.parse("1"); }, ConfigParseError);
  });

  it("should be through only string value by string parser", function() {
    assert.strictEqual(jsonparse.string.parse("str"), "str");
    assert.throw(function() { return jsonparse.string.parse(true); }, ConfigParseError);
  });

  it("should be through only object value by object parser", function() {
    assert.deepEqual(jsonparse.object.parse({}), {});
    assert.deepEqual(jsonparse.object.parse({a: "a", b: "b"}), {a: "a", b: "b"});
    assert.throw(function() { return jsonparse.object.parse([]); }, ConfigParseError);
    assert.throw(function() { return jsonparse.object.parse(""); }, ConfigParseError);
  });

  it("should be through only strict array value by array parser", function() {
    assert.deepEqual(jsonparse.array(jsonparse.string).parse([]), []);
    assert.deepEqual(jsonparse.array(jsonparse.string).parse(["", "true", "1"]), ["", "true", "1"]);
    assert.throw(function() { return jsonparse.array(jsonparse.string).parse(["", true, 1]); }, ConfigParseError);
    assert.throw(function() { return jsonparse.array(jsonparse.string).parse({"0": "1"}); }, ConfigParseError);
    assert.throw(function() { return jsonparse.array(jsonparse.string).parse({0: "1"}); }, ConfigParseError);
  });
});
