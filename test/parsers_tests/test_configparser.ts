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

  });

});
