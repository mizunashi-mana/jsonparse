/// <reference path="../../lib/lib/typings.d.ts" />

import {
  assert,
  assertThrow,
} from "../lib/chai_setup";

import * as sparse from "../../lib/";
const {
  ConfigParseError,
} = sparse;

describe("base parsers test", () => {

  describe("basetype parsers test", () => {

    it("should be through all by base parser", () => {
      assert.strictEqual(sparse.base.parse(true), true);
      assert.strictEqual(sparse.base.parse(1), 1);
      assert.strictEqual(sparse.base.parse("str"), "str");
      assert.deepEqual(sparse.base.parse({}), {});
      assert.deepEqual(sparse.base.parse({
        anything: "ok?",
        something: true,
      }), {
        anything: "ok?",
        something: true,
      });
      assert.deepEqual(sparse.base.parse([]), []);
      assert.deepEqual(sparse.base.parse(["", "true", "1", "{}"]), ["", "true", "1", "{}"]);
      assert.deepEqual(sparse.base.parse(["", true, 1, {}]), ["", true, 1, {}]);
    });

    it("should be success at all by succeed parser", () => {
      assert.strictEqual(sparse.succeed(true).parse(true), true);
      assert.strictEqual(sparse.succeed(true).parse("anything"), true);
      assert.deepEqual(sparse.succeed({
        anything: "ok?",
        something: true,
      }).parse({
        anything: "ok?",
        something: true,
      }), {
        anything: "ok?",
        something: true,
      });
      assert.deepEqual(sparse.succeed({
        anything: "ok?",
        something: true,
      }).parse({some: "anything"}), {
        anything: "ok?",
        something: true,
      });
    });

    it("should be fail at all by fail parser", () => {
      assert.throws(
        () => sparse.fail("error!").parse(true),
        sparse.ConfigParseError,
        "error!"
      );
      assert.throws(
        () => sparse.fail("fail at all!").parse({
          anything: "ok?",
          something: true,
        }),
        "fail at all!"
      );
    });

    it("should be through only boolean value by boolean parser", () => {
      assert.strictEqual(sparse.boolean.parse(true), true);
      assertThrow(
        () => sparse.boolean.parse(1),
        ConfigParseError,
        "1 is not 'boolean'"
      );
    });

    it("should be through only number value by number parser", () => {
      assert.strictEqual(sparse.number.parse(1), 1);
      assertThrow(
        () => sparse.number.parse("1"),
        ConfigParseError,
        "\"1\" is not 'number'"
      );
    });

    it("should be through only string value by string parser", () => {
      assert.strictEqual(sparse.string.parse("str"), "str");
      assertThrow(
        () => sparse.string.parse(true),
        ConfigParseError,
        "true is not 'string'"
      );
    });

    it("should be through only object value by object parser", () => {
      assert.deepEqual(sparse.object.parse({}), {});
      assert.deepEqual(sparse.object.parse({ a: "a", b: "b" }), { a: "a", b: "b" });
      assertThrow(
        () => sparse.object.parse([]),
        ConfigParseError,
        "[] is not 'object'"
      );
      assertThrow(
        () => sparse.object.parse(""),
        ConfigParseError,
        "\"\" is not 'object'"
      );
    });

    it("should be through only strict array value by array parser", () => {
      assert.deepEqual(sparse.array(sparse.string).parse([]), []);
      assert.deepEqual(sparse.array(sparse.string).parse(["", "true", "1"]), ["", "true", "1"]);
      assertThrow(
        () => sparse.array(sparse.string).parse(["", true, 1]),
        ConfigParseError, "failed to parse elem of 'array'"
      );
      assertThrow(
        () => sparse.array(sparse.string).parse({ 0: "1" }),
        ConfigParseError,
        "{\"0\":\"1\"} is not 'array'"
      );
    });

  });

  describe("base extra parsers test", () => {

    it("should be through only having specify properties by hasProperties parser", () => {
      const MyObjectParser = sparse.hasProperties([
        ["propB", sparse.boolean],
        ["propN", sparse.number],
        ["propS", sparse.string],
        ["propO", sparse.object],
        ["propAs", sparse.array(sparse.string)],
      ]);

      assert.deepEqual(MyObjectParser.parse({
        propB: true,
        propN: 1,
        propS: "str",
        propO: {
          anything: true
        },
        propAs: ["str1", "str2"],
      }), {
        propB: true,
        propN: 1,
        propS: "str",
        propO: {
          anything: true,
        },
        propAs: ["str1", "str2"],
      });
      assert.deepEqual(MyObjectParser.parse({
        propB: true,
        propN: 1,
        propS: "str",
        propO: {
          anything: true
        },
        propAs: ["str1", "str2"],
        propExtra: "anything!"
      }), {
        propB: true,
        propN: 1,
        propS: "str",
        propO: {
          anything: true
        },
        propAs: ["str1", "str2"],
      });
      assertThrow(
        () => MyObjectParser.parse({
          propB: true,
          propN: 1,
          propS: "str",
          propO: {
            anything: true,
          },
        }),
        ConfigParseError,
        "failed to parse property of 'object'"
      );
      assertThrow(
        () => MyObjectParser.parse({
          propB: true,
          propN: true,
          propS: "str",
          propO: {
            anything: true,
          },
          propAs: ["str1", "str2"],
        }),
        ConfigParseError,
        "failed to parse property of 'object'"
      );
      assertThrow(
        () => MyObjectParser.parse({
          propB: true,
          propN: true,
          propS: "str",
          propOther: {
            anything: true,
          },
          propAs: ["str1", "str2"],
        }),
        ConfigParseError,
        "failed to parse property of 'object'"
      );
      assertThrow(
        () => MyObjectParser.parse([]),
        ConfigParseError,
        "[] is not 'object'"
      );
    });

    it("should be customize by my custom parser", () => {
      const CustomParser1 = sparse.custom<Object, boolean>(
        (makeSuccess, makeFailure) => (obj) => {
          if (typeof obj === "number") {
            return makeSuccess(true);
          } else if (typeof obj === "string") {
            return makeSuccess(false);
          }
          return makeFailure("This is not number and string.");
        }
      );
      const CustomParser2 = sparse.custom<string, string>(
        (makeSuccess, makeFailure) => (obj) => {
          if (obj == "debug" || obj == "info" || obj == "error") {
            return makeSuccess(obj);
          }
          return makeFailure("This is not level string.");
        }
      );

      assert.strictEqual(CustomParser1.parse(1), true);
      assert.strictEqual(CustomParser1.parse("str"), false);
      assertThrow(
        () => CustomParser1.parse(true),
        ConfigParseError,
        "This is not number and string."
      );
      assert.strictEqual(CustomParser2.parse("debug"), "debug");
      assert.strictEqual(CustomParser2.parse("info"), "info");
      assert.strictEqual(CustomParser2.parse("error"), "error");
      assertThrow(
        () => CustomParser2.parse("not implement"),
        ConfigParseError,
        "This is not level string."
      );
    });

  });

});
