/// <reference path="../../lib/lib/typings.d.ts" />

import {
  assert,
  assertThrow,
} from "../lib/chai_setup";

import * as path from "path";

import * as sonparse from "../../lib/";
const {
  ConfigParseError,
  parseFile,
  parseFileWithStatus,
  parseFileAsync,
} = sonparse;

const {
  nestReporter,
} = sonparse.reporters;

describe("parse methods test", () => {

  describe("parse object test", () => {

    it("should return result on success and throw on fail", () => {
      assert.strictEqual(sonparse.boolean.parse(true), true);
      assertThrow(() => sonparse.boolean.parse("str"),
        ConfigParseError, "\"str\" is not 'boolean'"
      );
    });

    it("should return result with status", () => {
      const result1 = sonparse
        .boolean.parseWithStatus(true);
      assert.propertyVal(result1, "status", true);
      assert.propertyVal(result1, "value", true);

      const result2 = sonparse
        .boolean.parseWithStatus(1);
      assert.propertyVal(result2, "status", false);
    });

    it("should return result on success and report on fail", () => {
      const reporter = nestReporter((msg) => {
        return;
      });
      assert.strictEqual(sonparse
        .boolean.parseWithReporter(true, reporter),
        true
      );
      assertThrow(() => sonparse
        .boolean.parseWithReporter("str", reporter),
        ConfigParseError, "\"str\" is not 'boolean'"
      );
    });

    it("should return a promise parsing result", () => {
      const resultSuccess = sonparse.boolean.parseAsync(false);
      const resultFailure = sonparse.boolean.parseAsync("notexpected");

      return Promise.all([
        assert.becomes(resultSuccess, false),
        assert.isRejected(resultFailure, ConfigParseError)
      ]);
    });

  });

  describe("parse file test", () => {
    const dataObj = {
      a1: "b",
      a2: {
        b1: 1,
        b2: true,
      },
    };

    function resolvePath(fname: string) {
      return path.isAbsolute(fname)
        ? fname
        : path.join(__dirname, fname)
        ;
    };

    it("should be through only son file and return result", () => {
      assert.deepEqual(parseFile(resolvePath("data/valid.json"), sonparse.object), dataObj);
      assert.deepEqual(parseFile(resolvePath("data/valid.cson"), sonparse.object), dataObj);
      assert.deepEqual(parseFile(resolvePath("data/json.txt"), sonparse.object), dataObj);
      assert.deepEqual(parseFile(resolvePath("data/cson.txt"), sonparse.object), dataObj);
      assertThrow(() => parseFile(resolvePath("data/invalid.json"), sonparse.object), Error);
      assertThrow(() => parseFile(resolvePath("data/invalid.cson"), sonparse.object), Error);
      assertThrow(() => parseFile(resolvePath("data/nosuchfile"), sonparse.object), Error);
      assertThrow(() => parseFile(resolvePath("data/normal.txt"), sonparse.object),
        Error, `${resolvePath("data/normal.txt")} is not parsable son file`);
      assertThrow(() => parseFile(resolvePath("data/valid.json"), sonparse.boolean), ConfigParseError);
    });

    it("should be through only son file and return result with status", () => {
      function statusAssert<T>(result: {status: boolean; value?: T;}, expstatus: boolean, expvalue?: T, deep?: boolean) {
        assert.propertyVal(result, "status", expstatus);
        const fDeepEq = deep === undefined ? true : deep;
        if (expstatus) {
          if (fDeepEq) {
            assert.deepEqual(result.value, expvalue);
          } else {
            assert.strictEqual(result.value, expvalue);
          }
        }
      }
      statusAssert(parseFileWithStatus(resolvePath("data/valid.json"), sonparse.object), true, dataObj);
      statusAssert(parseFileWithStatus(resolvePath("data/valid.cson"), sonparse.object), true, dataObj);
      statusAssert(parseFileWithStatus(resolvePath("data/json.txt"), sonparse.object), true, dataObj);
      statusAssert(parseFileWithStatus(resolvePath("data/cson.txt"), sonparse.object), true, dataObj);
      statusAssert(parseFileWithStatus(resolvePath("data/invalid.json"), sonparse.object), false);
      statusAssert(parseFileWithStatus(resolvePath("data/invalid.cson"), sonparse.object), false);
      statusAssert(parseFileWithStatus(resolvePath("data/nosuchfile"), sonparse.object), false);
      statusAssert(parseFileWithStatus(resolvePath("data/normal.txt"), sonparse.object), false);
      statusAssert(parseFileWithStatus(resolvePath("data/valid.json"), sonparse.boolean), false);
    });

    it("should be through only son file and return result on promise", () => Promise.all([
      assert.becomes(parseFileAsync(resolvePath("data/valid.json"), sonparse.object), dataObj),
      assert.becomes(parseFileAsync(resolvePath("data/valid.cson"), sonparse.object), dataObj),
      assert.becomes(parseFileAsync(resolvePath("data/json.txt"), sonparse.object), dataObj),
      assert.becomes(parseFileAsync(resolvePath("data/cson.txt"), sonparse.object), dataObj),
      assert.isRejected(parseFileAsync(resolvePath("data/invalid.json"), sonparse.object), Error),
      assert.isRejected(parseFileAsync(resolvePath("data/invalid.cson"), sonparse.object), Error),
      assert.isRejected(parseFileAsync(resolvePath("data/nosuchfile"), sonparse.object), Error),
      assert.isRejected(parseFileAsync(resolvePath("data/normal.txt"), sonparse.object), Error),
      assert.isRejected(parseFileAsync(resolvePath("data/valid.json"), sonparse.boolean), ConfigParseError),
    ]));

  });

});
