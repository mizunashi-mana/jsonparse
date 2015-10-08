/// <reference path="../../build/lib/typings.d.ts" />

import {assert} from "chai";

import * as jsonparse from "../../build/";
const {
  ConfigParser,
  ConfigParseError,
} = jsonparse;

describe("config parser test", () => {

  describe("base parser methods test", () => {

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
      assert.throw(() => MyParser.parse(true), ConfigParseError);
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
      assert.throw(() => MyParser.parse({}), ConfigParseError);
      assert.throw(() => MyParser.parse("str"), ConfigParseError);
    });

    it("should be converted by my function", () => {
      const MyParser = jsonparse.string
        .map((str) => str === "true");

      assert.strictEqual(MyParser.parse("true"), true);
      assert.strictEqual(MyParser.parse("false"), false);
      assert.throw(() => MyParser.parse({}), ConfigParseError);
      assert.throw(() => MyParser.parse(true), ConfigParseError);
    });

    it("should be not converted by my description", () => {
      const MyParser = jsonparse.string
        .desc("this should be string value");

      assert.strictEqual(MyParser.parse(""), "");
      assert.strictEqual(MyParser.parse("str"), "str");
      assert.throw(() => MyParser.parse({}), ConfigParseError);
      assert.throw(() => MyParser.parse(true), ConfigParseError);
    });

    it("should be sent event after converting", () => {
      const MyParser = jsonparse.string;

      assert.strictEqual(MyParser
        .then(
          (obj) => assert.strictEqual(obj, "str"),
          () => assert(false, "unexpected call on fail")
        )
        .parse("str"), "str");
      assert.throw(() => MyParser
        .then(
          (obj) => assert(false, "unexpected call on success"),
          () => assert(true, "called on fail")
        )
        .parse(1), ConfigParseError);
    });

    it("should be cacthed failed after converting", () => {
      const MyParser = jsonparse.string;

      assert.strictEqual(MyParser
        .catch(
          () => assert(false, "unexpected call on fail")
        )
        .parse("str"), "str");
      assert.throw(() => MyParser
        .catch(
          () => assert(true, "called on fail")
        )
        .parse(1), ConfigParseError);
    });

    it("should be set default value on fail after converting", () => {
      const MyParser = jsonparse
        .boolean.default(false);

      assert.strictEqual(MyParser
        .parse(true), true);
      assert.strictEqual(MyParser
        .parse(1), false);
    });

  });

  describe("parse methods test", () => {

    it("should return result with status", () => {
      const result1 = jsonparse
        .boolean.parseWithStatus(true);
      assert.propertyVal(result1, "status", true);
      assert.propertyVal(result1, "value", true);

      const result2 = jsonparse
        .boolean.parseWithStatus(1);
      assert.propertyVal(result2, "status", false);
    });

  });

});
