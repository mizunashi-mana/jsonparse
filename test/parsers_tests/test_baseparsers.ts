/// <reference path="../../lib/lib/typings.d.ts" />

import {assert} from "chai";

import * as jsonparse from "../../lib/";
const {
  ConfigParseError,
} = jsonparse;

describe("base parsers test", () => {

  describe("basetype parsers test", () => {

    it("should be through all by base parser", () => {
      assert.strictEqual(jsonparse.base.parse(true), true);
      assert.strictEqual(jsonparse.base.parse(1), 1);
      assert.strictEqual(jsonparse.base.parse("str"), "str");
      assert.deepEqual(jsonparse.base.parse({}), {});
      assert.deepEqual(jsonparse.base.parse({
        "anything": "ok?",
        "something": true,
      }), {
        "anything": "ok?",
        "something": true,
      });
      assert.deepEqual(jsonparse.base.parse([]), []);
      assert.deepEqual(jsonparse.base.parse(["", "true", "1", "{}"]), ["", "true", "1", "{}"]);
      assert.deepEqual(jsonparse.base.parse(["", true, 1, {}]), ["", true, 1, {}]);
    });

    it("should be through only boolean value by boolean parser", () => {
      assert.strictEqual(jsonparse.boolean.parse(true), true);
      assert.throw(() => jsonparse.boolean.parse(1), ConfigParseError, "1 is not 'boolean'");
    });

    it("should be through only number value by number parser", () => {
      assert.strictEqual(jsonparse.number.parse(1), 1);
      assert.throw(() => jsonparse.number.parse("1"), ConfigParseError, "\"1\" is not 'number'");
    });

    it("should be through only string value by string parser", () => {
      assert.strictEqual(jsonparse.string.parse("str"), "str");
      assert.throw(() => jsonparse.string.parse(true), ConfigParseError, "true is not 'string'");
    });

    it("should be through only object value by object parser", () => {
      assert.deepEqual(jsonparse.object.parse({}), {});
      assert.deepEqual(jsonparse.object.parse({ a: "a", b: "b" }), { a: "a", b: "b" });
      assert.throw(() => jsonparse.object.parse([]), ConfigParseError, "[] is not 'object'");
      assert.throw(() => jsonparse.object.parse(""), ConfigParseError, "\"\" is not 'object'");
    });

    it("should be through only strict array value by array parser", () => {
      assert.deepEqual(jsonparse.array(jsonparse.string).parse([]), []);
      assert.deepEqual(jsonparse.array(jsonparse.string).parse(["", "true", "1"]), ["", "true", "1"]);
      assert.throw(() => jsonparse.array(jsonparse.string).parse(["", true, 1]), ConfigParseError, "failed to parse elem of array");
      assert.throw(() => jsonparse.array(jsonparse.string).parse({ 0: "1" }), ConfigParseError, "{\"0\":\"1\"} is not 'array'");
    });

  });

  describe("base extra parsers test", () => {

    it("should be through only having specify properties by hasProperties parser", function() {
      const MyObjectParser = jsonparse.hasProperties([
        ["propB", jsonparse.boolean],
        ["propN", jsonparse.number],
        ["propS", jsonparse.string],
        ["propO", jsonparse.object],
        ["propAs", jsonparse.array(jsonparse.string)],
      ]);

      assert.deepEqual(MyObjectParser.parse({
        "propB": true,
        "propN": 1,
        "propS": "str",
        "propO": {
          "anything": true
        },
        "propAs": ["str1", "str2"],
      }), {
          "propB": true,
          "propN": 1,
          "propS": "str",
          "propO": {
            "anything": true
          },
          "propAs": ["str1", "str2"],
        });
      assert.deepEqual(MyObjectParser.parse({
        "propB": true,
        "propN": 1,
        "propS": "str",
        "propO": {
          "anything": true
        },
        "propAs": ["str1", "str2"],
        "propExtra": "anything!"
      }), {
          "propB": true,
          "propN": 1,
          "propS": "str",
          "propO": {
            "anything": true
          },
          "propAs": ["str1", "str2"],
        });
      assert.throw(() => MyObjectParser.parse({
        "propB": true,
        "propN": 1,
        "propS": "str",
        "propO": {
          "anything": true
        },
      }), ConfigParseError, "failed to parse property of object");
      assert.throw(() => MyObjectParser.parse({
        "propB": true,
        "propN": true,
        "propS": "str",
        "propO": {
          "anything": true
        },
        "propAs": ["str1", "str2"],
      }), ConfigParseError, "failed to parse property of object");
      assert.throw(() => MyObjectParser.parse({
        "propB": true,
        "propN": true,
        "propS": "str",
        "propOther": {
          "anything": true
        },
        "propAs": ["str1", "str2"],
      }), ConfigParseError, "failed to parse property of object");
      assert.throw(() => MyObjectParser.parse([]),
      ConfigParseError, "[] is not 'object'");
    });

    it("should be customize by my custom parser", () => {
      const CustomParser1 = jsonparse.custom<Object, boolean>((makeSuccess, makeFailure) => {
        return (obj) => {
          if (typeof obj === "number") {
            return makeSuccess(true);
          } else if (typeof obj === "string") {
            return makeSuccess(false);
          }
          return makeFailure();
        };
      });
      const CustomParser2 = jsonparse.custom<string, string>((makeSuccess, makeFailure) => {
        return (obj) => {
          if (obj == "debug" || obj == "info" || obj == "error") {
            return makeSuccess(obj);
          }
          return makeFailure();
        };
      });

      assert.strictEqual(CustomParser1.parse(1), true);
      assert.strictEqual(CustomParser1.parse("str"), false);
      assert.throw(() => CustomParser1.parse(true), ConfigParseError);
      assert.strictEqual(CustomParser2.parse("debug"), "debug");
      assert.strictEqual(CustomParser2.parse("info"), "info");
      assert.strictEqual(CustomParser2.parse("error"), "error");
      assert.throw(() => CustomParser2.parse("not implement"), ConfigParseError);
    });
  });
});
