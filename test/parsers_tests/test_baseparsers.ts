/// <reference path="../../lib/lib/typings.d.ts" />

import {
  assert,
  assertThrow,
} from "../lib/chai_setup";

import * as sonparse from "../../lib/";
const {
  ConfigParseError,
} = sonparse;


describe("base parsers test", () => {

  describe("basetype parsers test", () => {

    it("should be through all by base parser", () => {
      assert.strictEqual(sonparse.base.parse(true), true);
      assert.strictEqual(sonparse.base.parse(1), 1);
      assert.strictEqual(sonparse.base.parse("str"), "str");
      assert.deepEqual(sonparse.base.parse({}), {});
      assert.deepEqual(sonparse.base.parse({
        "anything": "ok?",
        "something": true,
      }), {
        "anything": "ok?",
        "something": true,
      });
      assert.deepEqual(sonparse.base.parse([]), []);
      assert.deepEqual(sonparse.base.parse(["", "true", "1", "{}"]), ["", "true", "1", "{}"]);
      assert.deepEqual(sonparse.base.parse(["", true, 1, {}]), ["", true, 1, {}]);
    });

    it("should be success at all by succeed parser", () => {
      assert.strictEqual(sonparse.succeed(true).parse(true), true);
      assert.strictEqual(sonparse.succeed(true).parse("anything"), true);
      assert.deepEqual(sonparse.succeed({
        "anything": "ok?",
        "something": true,
      }).parse({
        "anything": "ok?",
        "something": true,
      }), {
        "anything": "ok?",
        "something": true,
      });
      assert.deepEqual(sonparse.succeed({
        "anything": "ok?",
        "something": true,
      }).parse({"some": "anything"}), {
        "anything": "ok?",
        "something": true,
      });
    });

    it("should be fail at all by fail parser", () => {
      assert.throws(
        () => sonparse.fail("error!").parse(true),
        sonparse.ConfigParseError,
        "error!"
      );
      assert.throws(
        () => sonparse.fail("fail at all!").parse({
          "anything": "ok?",
          "something": true,
        }),
        "fail at all!"
      );
    });

    it("should be through only boolean value by boolean parser", () => {
      assert.strictEqual(sonparse.boolean.parse(true), true);
      assertThrow(() => sonparse.boolean.parse(1),
      ConfigParseError, "1 is not 'boolean'");
    });

    it("should be through only number value by number parser", () => {
      assert.strictEqual(sonparse.number.parse(1), 1);
      assertThrow(() => sonparse.number.parse("1"),
      ConfigParseError, "\"1\" is not 'number'");
    });

    it("should be through only string value by string parser", () => {
      assert.strictEqual(sonparse.string.parse("str"), "str");
      assertThrow(() => sonparse.string.parse(true),
      ConfigParseError, "true is not 'string'");
    });

    it("should be through only object value by object parser", () => {
      assert.deepEqual(sonparse.object.parse({}), {});
      assert.deepEqual(sonparse.object.parse({ a: "a", b: "b" }), { a: "a", b: "b" });
      assertThrow(() => sonparse.object.parse([]),
      ConfigParseError, "[] is not 'object'");
      assertThrow(() => sonparse.object.parse(""),
      ConfigParseError, "\"\" is not 'object'");
    });

    it("should be through only strict array value by array parser", () => {
      assert.deepEqual(sonparse.array(sonparse.string).parse([]), []);
      assert.deepEqual(sonparse.array(sonparse.string).parse(["", "true", "1"]), ["", "true", "1"]);
      assertThrow(() => sonparse.array(sonparse.string).parse(["", true, 1]),
      ConfigParseError, "failed to parse elem of 'array'");
      assertThrow(() => sonparse.array(sonparse.string).parse({ 0: "1" }),
      ConfigParseError, "{\"0\":\"1\"} is not 'array'");
    });

  });

  describe("base extra parsers test", () => {

    it("should be through only having specify properties by hasProperties parser", function() {
      const MyObjectParser = sonparse.hasProperties([
        ["propB", sonparse.boolean],
        ["propN", sonparse.number],
        ["propS", sonparse.string],
        ["propO", sonparse.object],
        ["propAs", sonparse.array(sonparse.string)],
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
      assertThrow(() => MyObjectParser.parse({
        "propB": true,
        "propN": 1,
        "propS": "str",
        "propO": {
          "anything": true
        },
      }), ConfigParseError, "failed to parse property of 'object'");
      assertThrow(() => MyObjectParser.parse({
        "propB": true,
        "propN": true,
        "propS": "str",
        "propO": {
          "anything": true
        },
        "propAs": ["str1", "str2"],
      }), ConfigParseError, "failed to parse property of 'object'");
      assertThrow(() => MyObjectParser.parse({
        "propB": true,
        "propN": true,
        "propS": "str",
        "propOther": {
          "anything": true
        },
        "propAs": ["str1", "str2"],
      }), ConfigParseError, "failed to parse property of 'object'");
      assertThrow(() => MyObjectParser.parse([]),
      ConfigParseError, "[] is not 'object'");
    });

    it("should be customize by my custom parser", () => {
      const CustomParser1 = sonparse.custom<Object, boolean>((makeSuccess, makeFailure) => {
        return (obj) => {
          if (typeof obj === "number") {
            return makeSuccess(true);
          } else if (typeof obj === "string") {
            return makeSuccess(false);
          }
          return makeFailure();
        };
      });
      const CustomParser2 = sonparse.custom<string, string>((makeSuccess, makeFailure) => {
        return (obj) => {
          if (obj == "debug" || obj == "info" || obj == "error") {
            return makeSuccess(obj);
          }
          return makeFailure();
        };
      });

      assert.strictEqual(CustomParser1.parse(1), true);
      assert.strictEqual(CustomParser1.parse("str"), false);
      assertThrow(() => CustomParser1.parse(true), ConfigParseError);
      assert.strictEqual(CustomParser2.parse("debug"), "debug");
      assert.strictEqual(CustomParser2.parse("info"), "info");
      assert.strictEqual(CustomParser2.parse("error"), "error");
      assertThrow(() => CustomParser2.parse("not implement"), ConfigParseError);
    });
  });
});
