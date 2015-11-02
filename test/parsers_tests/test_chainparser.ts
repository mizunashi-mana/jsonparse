/// <reference path="../../lib/lib/typings.d.ts" />

import {
  assert,
  assertThrow,
} from "../lib/chai_setup";

import * as sonparse from "../../lib/";
const {
  ConfigParseError,
} = sonparse;

describe("chain parser test", () => {

  describe("base parsers test", () => {

    it("should be using second parser when first parser failed", () => {
      const CustomParser1 = sonparse.custom<Object, boolean>((makeSuccess, makeFailure) => {
        return (obj) => {
          if (typeof obj === "number") {
            return makeSuccess(true);
          }
          return makeFailure();
        };
      });
      const CustomParser2 = sonparse.custom<Object, boolean>((makeSuccess, makeFailure) => {
        return (obj) => {
          if (typeof obj === "string") {
            return makeSuccess(false);
          }
          return makeFailure();
        };
      });
      const MyParser = CustomParser1.or(CustomParser2);

      assert.strictEqual(MyParser.parse(1), true);
      assert.strictEqual(MyParser.parse("str"), false);
      assertThrow(() => MyParser.parse(true), ConfigParseError);
    });

    it("should be using second parser when first parser succeeded", () => {
      const CustomParser1 = sonparse.custom<Object, number>((makeSuccess, makeFailure) => {
        return (obj) => {
          if (typeof obj === "boolean") {
            return makeSuccess(0);
          } else if (typeof obj === "number") {
            return makeSuccess(1);
          } else if (typeof obj === "string") {
            return makeSuccess(2);
          }
          return makeFailure();
        };
      });
      const CustomParser2 = sonparse.custom<number, boolean>((makeSuccess, makeFailure) => {
        return (obj) => {
          if (obj === 0) {
            return makeSuccess(false);
          } else if (obj === 1) {
            return makeSuccess(true);
          }
          return makeFailure();
        };
      });
      const MyParser = CustomParser1.and(CustomParser2);

      assert.strictEqual(MyParser.parse(true), false);
      assert.strictEqual(MyParser.parse(1), true);
      assertThrow(() => MyParser.parse({}), ConfigParseError);
      assertThrow(() => MyParser.parse("str"), ConfigParseError);
    });

    it("should be converted by my function", () => {
      const MyParser = sonparse.string
        .map((str) => str === "true");

      assert.strictEqual(MyParser.parse("true"), true);
      assert.strictEqual(MyParser.parse("false"), false);
      assertThrow(() => MyParser.parse({}), ConfigParseError);
      assertThrow(() => MyParser.parse(true), ConfigParseError);
    });

  });

  describe("extra parsers test", () => {

    it("should be not converted and added desc by my description", () => {
      const MyParser = sonparse.string
        .desc("this should be string value");

      assert.strictEqual(MyParser.parse(""), "");
      assert.strictEqual(MyParser.parse("str"), "str");
      assertThrow(() => MyParser.parse({}),
      ConfigParseError, "this should be string value");
      assertThrow(() => MyParser.parse(true),
      ConfigParseError, "this should be string value");
    });

    it("should be not converted and added desc by my description from expected", () => {
      const MyParser1 = sonparse.custom<Object, number>((makeSuccess, makeFailure) => {
        return (obj) => {
          if (typeof obj === "boolean") {
            return makeSuccess(0);
          } else if (obj === "special") {
            return makeSuccess(1);
          } else if (typeof obj === "number") {
            return makeSuccess(2);
          }
          return makeFailure();
        };
      })
        .descFromExpected(["boolean", "number", "special"]);
      const MyParser2 = sonparse.string
        .descFromExpected("string");

      assert.strictEqual(MyParser1.parse(true), 0);
      assert.strictEqual(MyParser1.parse("special"), 1);
      assert.strictEqual(MyParser1.parse(10), 2);
      assertThrow(
        () => MyParser1.parse({a: 1}),
        ConfigParseError, "{\"a\":1} is neither 'boolean', 'number' or 'special'"
      );
      assertThrow(
        () => MyParser1.parse("str"),
        ConfigParseError, "\"str\" is neither 'boolean', 'number' or 'special'"
      );
      assert.strictEqual(MyParser2.parse("str"), "str");
      assertThrow(
        () => MyParser2.parse({a: 1}),
        ConfigParseError, "{\"a\":1} is not 'string'"
      );
      assert.throw(
        () => MyParser2.parse(true),
        ConfigParseError, "true is not 'string'"
      );
    });

    it("should be sent event after converting", () => {
      const MyParser = sonparse.string;

      assert.strictEqual(MyParser
        .then(
          (obj) => assert.strictEqual(obj, "str"),
          () => assert(false, "unexpected call on fail")
        )
        .parse("str"), "str");
      assertThrow(() => MyParser
        .then(
          (obj) => assert(false, "unexpected call on success"),
          () => assert(true, "called on fail")
        )
        .parse(1), ConfigParseError);
    });

    it("should be cacthed failed after converting", () => {
      const MyParser = sonparse.string;

      assert.strictEqual(MyParser
        .catch(() => assert(false, "unexpected call on fail"))
        .parse("str"), "str");
      assertThrow(() => MyParser
        .catch(() => assert(true, "called on fail"))
        .parse(1), ConfigParseError);
    });

    it("should be set default value on fail after converting", () => {
      const MyParser = sonparse
        .boolean.default(false);

      assert.strictEqual(MyParser.parse(true), true);
      assert.strictEqual(MyParser.parse(1), false);
    });

    it("should be optional value for no value received", () => {
      const MyParser = sonparse
        .boolean.option(false);

      assert.strictEqual(MyParser.parse(true), true);
      assert.strictEqual(MyParser.parse(undefined), false);
      assert.strictEqual(MyParser.parse(null), false);
      assertThrow(() => MyParser.parse(1), ConfigParseError);
    });

    it("should return merged of two results", () => {
      const MyParser = sonparse.boolean.map((bool) => bool ? [] : [1,2]);

      assert.deepEqual(
        sonparse.boolean.seq2(sonparse.boolean).parse(true),
        [true, true]
      );
      assert.deepEqual(
        sonparse.boolean.seq2(MyParser).parse(true),
        [true, []]
      );
      assert.throws(
        () => sonparse.boolean.seq2(sonparse.string).parse(false),
        sonparse.ConfigParseError
      );
      assert.throws(
        () => sonparse.boolean.seq2(sonparse.string).parse("str"),
        sonparse.ConfigParseError
      );
      assert.throws(
        () => sonparse.boolean.seq2(sonparse.boolean).parse("not expected"),
        sonparse.ConfigParseError
      );
    });
  });

});
