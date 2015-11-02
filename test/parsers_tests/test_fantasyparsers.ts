/// <reference path="../../lib/lib/typings.d.ts" />

import {
  assert,
  assertThrow,
} from "../lib/chai_setup";

import * as sonparse from "../../lib/";
const {
  ConfigParseError,
} = sonparse;

describe("fantasy methods test", () => {

  describe("monoid test", () => {

    it("should equal fail, empty and mempty", () => {
      assertThrow(
        () => sonparse.base.mempty.parse("anything!"),
        ConfigParseError,
        "empty"
      );
      assertThrow(
        () => sonparse.base.empty.parse("anything!"),
        ConfigParseError,
        "empty"
      );
    });

    it("should equal or, append and mappend", () => {
      const boolNumberParser = sonparse.number.map((num) => num != 0);

      assert.strictEqual(
        sonparse.boolean.mappend(boolNumberParser).parse(false),
        false
      );
      assert.strictEqual(
        sonparse.boolean.mappend(boolNumberParser).parse(1),
        true
      );
      assertThrow(
        () => sonparse.boolean.mappend(boolNumberParser).parse("not expected!"),
        ConfigParseError
      );
      assert.strictEqual(
        sonparse.boolean.append(boolNumberParser).parse(1),
        true
      );
    });

    it("should equal sequential or, concat and mconcat", () => {
      const boolNumberParser = sonparse.number.map((num) => num != 0);
      const boolStringParser = sonparse.string.and(
        sonparse.custom<string, boolean>((success, failure) => {
          return (obj) => {
            return ["true", "yes", "on"].indexOf(obj) != -1
              ? success(true)
              : ["false", "no", "off"].indexOf(obj) != -1
              ? success(false)
              : failure()
              ;
          };
        }).descFromExpected("boolString")
      );

      assert.strictEqual(
        sonparse.boolean.mconcat([boolNumberParser, boolStringParser]).parse(false),
        false
      );
      assert.strictEqual(
        sonparse.boolean.mconcat([boolNumberParser, boolStringParser]).parse(1),
        true
      );
      assert.strictEqual(
        sonparse.boolean.mconcat([boolNumberParser, boolStringParser]).parse("off"),
        false
      );
      assertThrow(
        () => sonparse.boolean.mconcat([boolNumberParser, boolStringParser]).parse("not expected!"),
        ConfigParseError
      );
      assert.strictEqual(
        sonparse.boolean.concat([boolNumberParser, boolStringParser]).parse(1),
        true
      );
    });

  });

  describe("functor test", () => {

    it("should equal map, fmap and lift", () => {
      assert.strictEqual(
        sonparse.boolean.fmap((b) => b ? 0 : 1).parse(true),
        0
      );
      assertThrow(
        () => sonparse.boolean.fmap((b) => b ? 0 : 1).parse("not expected!"),
        ConfigParseError
      );
      assert.strictEqual(
        sonparse.boolean.lift((b) => b ? 0 : 1).parse(true),
        0
      );
    });

  });

  describe("applicative test", () => {

    it("should equal succeed, of and unit", () => {
      assert.strictEqual(
        sonparse.base.of(0).parse("anything"),
        0
      );
      assert.strictEqual(
        sonparse.boolean.of(0).parse(true),
        0
      );
      assert.strictEqual(
        sonparse.boolean.unit(0).parse(true),
        0
      );
    });

    it("should be exists ap", () => {
      assert.strictEqual(
        sonparse.boolean.ap(
          sonparse.boolean.of((b: boolean) => b ? 0 : 1)
        ).parse(true),
        0
      );
      assertThrow(
        () => sonparse.boolean.ap(
          sonparse.boolean.of((b: boolean) => b ? 0 : 1)
        ).parse("not expected"),
        ConfigParseError
      );
    });

  });


  describe("monad test", () => {

    it("should equal succeed, of and unit", () => {
      assert.strictEqual(
        sonparse.base.of(0).parse("anything"),
        0
      );
      assert.strictEqual(
        sonparse.boolean.of(0).parse(true),
        0
      );
      assert.strictEqual(
        sonparse.boolean.unit(0).parse(true),
        0
      );
    });

    it("should be exists bind and chain", () => {
      const failEmpty = <sonparse.ConfigParser<boolean, number>>sonparse.base.empty;
      const bindParser = sonparse.boolean.bind(
        (obj) => obj ? sonparse.boolean.of(0) : failEmpty
      );
      assert.strictEqual(
        bindParser.parse(true),
        0
      );
      assertThrow(
        () => bindParser.parse(false),
        ConfigParseError
      );
      assertThrow(
        () => bindParser.parse("not expected"),
        ConfigParseError
      );
      assert.strictEqual(
        sonparse.boolean.chain(
          (obj) => obj ? sonparse.boolean.of(0) : failEmpty
        ).parse(true),
        0
      );
    });

  });

  describe("monadplus test", () => {

    it("should equal fail, mzero and zero", () => {
      assertThrow(
        () => sonparse.boolean.mzero.parse("anything"),
        ConfigParseError
      );
      assertThrow(
        () => sonparse.boolean.mzero.parse(true),
        ConfigParseError
      );
      assertThrow(
        () => sonparse.boolean.zero.parse(true),
        ConfigParseError
      );
    });

    it("should equal or, mplus and plus", () => {
      const boolNumberParser = sonparse.number.map((num) => num != 0);

      assert.strictEqual(
        sonparse.boolean.mplus(boolNumberParser).parse(false),
        false
      );
      assert.strictEqual(
        sonparse.boolean.mplus(boolNumberParser).parse(1),
        true
      );
      assertThrow(
        () => sonparse.boolean.mplus(boolNumberParser).parse("not expected!"),
        ConfigParseError
      );
      assert.strictEqual(
        sonparse.boolean.plus(boolNumberParser).parse(1),
        true
      );
    });

  });

});
