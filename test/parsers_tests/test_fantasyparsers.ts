/// <reference path="../../lib/lib/typings.d.ts" />

import {
  assert,
  assertThrow,
} from "../lib/chai_setup";

import * as sparse from "../../lib/";
const {
  ConfigParseError,
} = sparse;

describe("fantasy methods test", () => {

  describe("monoid test", () => {

    it("should equal fail, empty and mempty", () => {
      assertThrow(
        () => sparse.base.mempty.parse("anything!"),
        ConfigParseError,
        "empty"
      );
      assertThrow(
        () => sparse.base.empty.parse("anything!"),
        ConfigParseError,
        "empty"
      );
    });

    it("should equal or, append and mappend", () => {
      const boolNumberParser = sparse.number.map((num) => num != 0);

      assert.strictEqual(
        sparse.boolean.mappend(boolNumberParser).parse(false),
        false
      );
      assert.strictEqual(
        sparse.boolean.mappend(boolNumberParser).parse(1),
        true
      );
      assertThrow(
        () => sparse.boolean.mappend(boolNumberParser).parse("not expected!"),
        ConfigParseError
      );
      assert.strictEqual(
        sparse.boolean.append(boolNumberParser).parse(1),
        true
      );
    });

    it("should equal sequential or, concat and mconcat", () => {
      const boolNumberParser = sparse.number.map((num) => num != 0);
      const boolStringParser = sparse.string.and(
        sparse.custom<string, boolean>(
          (success, failure) => (obj) => {
            return ["true", "yes", "on"].indexOf(obj) != -1
              ? success(true)
              : ["false", "no", "off"].indexOf(obj) != -1
              ? success(false)
              : failure()
              ;
          }
        ).descFromExpected("boolString")
      );

      assert.strictEqual(
        sparse.boolean.mconcat([boolNumberParser, boolStringParser]).parse(false),
        false
      );
      assert.strictEqual(
        sparse.boolean.mconcat([boolNumberParser, boolStringParser]).parse(1),
        true
      );
      assert.strictEqual(
        sparse.boolean.mconcat([boolNumberParser, boolStringParser]).parse("off"),
        false
      );
      assertThrow(
        () => sparse.boolean.mconcat([boolNumberParser, boolStringParser]).parse("not expected!"),
        ConfigParseError
      );
      assert.strictEqual(
        sparse.boolean.concat([boolNumberParser, boolStringParser]).parse(1),
        true
      );
    });

  });

  describe("functor test", () => {

    it("should equal map, fmap and lift", () => {
      assert.strictEqual(
        sparse.boolean.fmap((b) => b ? 0 : 1).parse(true),
        0
      );
      assertThrow(
        () => sparse.boolean.fmap((b) => b ? 0 : 1).parse("not expected!"),
        ConfigParseError
      );
      assert.strictEqual(
        sparse.boolean.lift((b) => b ? 0 : 1).parse(true),
        0
      );
    });

  });

  describe("applicative test", () => {

    it("should equal succeed, of and unit", () => {
      assert.strictEqual(
        sparse.base.of(0).parse("anything"),
        0
      );
      assert.strictEqual(
        sparse.boolean.of(0).parse(true),
        0
      );
      assert.strictEqual(
        sparse.boolean.unit(0).parse(true),
        0
      );
    });

    it("should be exists ap", () => {
      assert.strictEqual(
        sparse.boolean.ap(
          sparse.boolean.of((b: boolean) => b ? 0 : 1)
        ).parse(true),
        0
      );
      assertThrow(
        () => sparse.boolean.ap(
          sparse.boolean.of((b: boolean) => b ? 0 : 1)
        ).parse("not expected"),
        ConfigParseError
      );
    });

  });


  describe("monad test", () => {

    it("should equal succeed, of and unit", () => {
      assert.strictEqual(
        sparse.base.of(0).parse("anything"),
        0
      );
      assert.strictEqual(
        sparse.boolean.of(0).parse(true),
        0
      );
      assert.strictEqual(
        sparse.boolean.unit(0).parse(true),
        0
      );
    });

    it("should be exists bind and chain", () => {
      const failEmpty = <sparse.ConfigParser<boolean, number>>sparse.base.empty;
      const bindParser = sparse.boolean.bind(
        (obj) => obj ? sparse.boolean.of(0) : failEmpty
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
        sparse.boolean
          .chain((obj) => obj ? sparse.boolean.of(0) : failEmpty)
          .parse(true),
        0
      );
    });

  });

  describe("monadplus test", () => {

    it("should equal fail, mzero and zero", () => {
      assertThrow(
        () => sparse.boolean.mzero.parse("anything"),
        ConfigParseError
      );
      assertThrow(
        () => sparse.boolean.mzero.parse(true),
        ConfigParseError
      );
      assertThrow(
        () => sparse.boolean.zero.parse(true),
        ConfigParseError
      );
    });

    it("should equal or, mplus and plus", () => {
      const boolNumberParser = sparse.number.map((num) => num != 0);

      assert.strictEqual(
        sparse.boolean.mplus(boolNumberParser).parse(false),
        false
      );
      assert.strictEqual(
        sparse.boolean.mplus(boolNumberParser).parse(1),
        true
      );
      assertThrow(
        () => sparse.boolean.mplus(boolNumberParser).parse("not expected!"),
        ConfigParseError
      );
      assert.strictEqual(
        sparse.boolean.plus(boolNumberParser).parse(1),
        true
      );
    });

  });

});
