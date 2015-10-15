/// <reference path="../../lib/lib/typings.d.ts" />

import {
  assert,
  assertThrow,
} from "../lib/chai_setup";

import * as jsonparse from "../../lib/";
const {
  ConfigParseError,
} = jsonparse;

describe("chain parser test", () => {

  describe("base parsers test", () => {

    it("should be using second parser when first parser failed", () => {
      const CustomParser1 = jsonparse.custom<Object, boolean>((makeSuccess, makeFailure) => {
        return (obj) => {
          if (typeof obj === "number") {
            return makeSuccess(true);
          }
          return makeFailure();
        };
      });
      const CustomParser2 = jsonparse.custom<Object, boolean>((makeSuccess, makeFailure) => {
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
      const CustomParser1 = jsonparse.custom<Object, number>((makeSuccess, makeFailure) => {
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
      const CustomParser2 = jsonparse.custom<number, boolean>((makeSuccess, makeFailure) => {
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
      const MyParser = jsonparse.string
        .map((str) => str === "true");

      assert.strictEqual(MyParser.parse("true"), true);
      assert.strictEqual(MyParser.parse("false"), false);
      assertThrow(() => MyParser.parse({}), ConfigParseError);
      assertThrow(() => MyParser.parse(true), ConfigParseError);
    });

  });

  describe("extra parsers test", () => {

    it("should be not converted and added desc by my description", () => {
      const MyParser = jsonparse.string
        .desc("this should be string value");

      assert.strictEqual(MyParser.parse(""), "");
      assert.strictEqual(MyParser.parse("str"), "str");
      assertThrow(() => MyParser.parse({}),
      ConfigParseError, "this should be string value");
      assertThrow(() => MyParser.parse(true),
      ConfigParseError, "this should be string value");
    });

    it("should be not converted and added desc by my description from expected", () => {
      const MyParser1 = jsonparse.custom<Object, number>((makeSuccess, makeFailure) => {
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
      const MyParser2 = jsonparse.string
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
      const MyParser = jsonparse.string;

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
      const MyParser = jsonparse.string;

      assert.strictEqual(MyParser
        .catch(() => assert(false, "unexpected call on fail"))
        .parse("str"), "str");
      assertThrow(() => MyParser
        .catch(() => assert(true, "called on fail"))
        .parse(1), ConfigParseError);
    });

    it("should be set default value on fail after converting", () => {
      const MyParser = jsonparse
        .boolean.default(false);

      assert.strictEqual(MyParser.parse(true), true);
      assert.strictEqual(MyParser.parse(1), false);
    });

    it("should be optional value for no value received", () => {
      const MyParser = jsonparse
        .boolean.option(false);

      assert.strictEqual(MyParser.parse(true), true);
      assert.strictEqual(MyParser.parse(undefined), false);
      assert.strictEqual(MyParser.parse(null), false);
      assertThrow(() => MyParser.parse(1), ConfigParseError);
    });

  });

});
