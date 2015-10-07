/// <reference path="../../build/lib/typings.d.ts" />

import {assert} from "chai";

import * as jsonparse from "../../build/";
const {
  //ConfigParser,
  ConfigParseError,
} = jsonparse;

describe("basetype parsers test", () => {

  it("should be through only boolean value by boolean parser", () => {
    assert.strictEqual(jsonparse.boolean.parse(true), true);
    assert.throw(() => jsonparse.boolean.parse(1), ConfigParseError);
  });

  it("should be through only number value by number parser", () => {
    assert.strictEqual(jsonparse.number.parse(1), 1);
    assert.throw(() => jsonparse.number.parse("1"), ConfigParseError);
  });

  it("should be through only string value by string parser", () => {
    assert.strictEqual(jsonparse.string.parse("str"), "str");
    assert.throw(() => jsonparse.string.parse(true), ConfigParseError);
  });

  it("should be through only object value by object parser", () => {
    assert.strictEqual(jsonparse.object.parse({}), {});
    assert.strictEqual(jsonparse.object.parse({a: "a", b: "b"}), {a: "a", b: "b"});
    assert.throw(() => jsonparse.object.parse([]), ConfigParseError);
    assert.throw(() => jsonparse.object.parse(""), ConfigParseError);
  });

  it("should be through only strict array value by array parser", () => {
    assert.strictEqual(jsonparse.array(jsonparse.string).parse([]), []);
    assert.strictEqual(jsonparse.array(jsonparse.string).parse(["", "true", "1"]), ["", "true", "1"]);
    assert.throw(() => jsonparse.array(jsonparse.string).parse(["", true, 1]), ConfigParseError);
    assert.throw(() => jsonparse.array(jsonparse.string).parse({"0": "1"}), ConfigParseError);
    assert.throw(() => jsonparse.array(jsonparse.string).parse({0: "1"}), ConfigParseError);
  });
});
