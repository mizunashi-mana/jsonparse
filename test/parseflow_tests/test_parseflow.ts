/// <reference path="../../lib/lib/typings.d.ts" />

import {
  assert,
  assertThrow,
} from "../lib/chai_setup";

import * as path from "path";

import * as sparse from "../../lib/";
const {
  ConfigParseError,
  parseFile,
  parseFileWithResult,
  parseFileAsync,
} = sparse;

const {
  nestReporter,
} = sparse.reporters;

describe("parse methods test", () => {

  describe("parse object test", () => {

    it("should return result on success and throw on fail", () => {
      assert.strictEqual(sparse.boolean.parse(true), true);
      assertThrow(
        () => sparse.boolean.parse("str"),
        ConfigParseError, "\"str\" is not 'boolean'"
      );
    });

    it("should return result with status", () => {
      const result1 = sparse.boolean
        .parseWithResult(true);
      assert.strictEqual(result1.isSuccess(), true);
      assert.strictEqual(result1.except(), true);

      const result2 = sparse.boolean
        .parseWithResult(1);
      assert.strictEqual(result2.isSuccess(), false);
      assertThrow(
        () => result2.except("parse failed"),
        sparse.ConfigParseError,
        "parse failed"
      );
    });

    it("should return result on success and report on fail", () => {
      const reporter = nestReporter((msg) => { return; });
      assert.strictEqual(sparse.boolean
        .parseWithResult(true).report(reporter).except(),
        true
      );
      assertThrow(
        () => sparse.boolean
          .parseWithResult("str").report(reporter).except(),
        ConfigParseError, "\"str\" is not 'boolean'"
      );
    });

    it("should return a promise parsing result", () => {
      const resultSuccess = sparse.boolean.parseAsync(false);
      const resultFailure = sparse.boolean.parseAsync("not expected");
      const resultOnResultSuccess = sparse.boolean
        .parseWithResult(false).toPromise();
      const resultOnResultFailure = sparse.boolean
        .parseWithResult("not expected").toPromise();

      return Promise.all([
        assert.becomes(resultSuccess, false),
        assert.isRejected(resultFailure, ConfigParseError),
        assert.becomes(resultOnResultSuccess, false),
        assert.isRejected(resultOnResultFailure, ConfigParseError),
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
      assert.deepEqual(parseFile(resolvePath("data/valid.json"), sparse.object), dataObj);
      assert.deepEqual(parseFile(resolvePath("data/valid.cson"), sparse.object), dataObj);
      assert.deepEqual(parseFile(resolvePath("data/json.txt"), sparse.object), dataObj);
      assert.deepEqual(parseFile(resolvePath("data/cson.txt"), sparse.object), dataObj);
      assertThrow(() => parseFile(resolvePath("data/invalid.json"), sparse.object), Error);
      assertThrow(() => parseFile(resolvePath("data/invalid.cson"), sparse.object), Error);
      assertThrow(() => parseFile(resolvePath("data/nosuchfile"), sparse.object), Error);
      assertThrow(() => parseFile(resolvePath("data/normal.txt"), sparse.object),
        Error, `${resolvePath("data/normal.txt")} is not parsable son file`);
      assertThrow(() => parseFile(resolvePath("data/valid.json"), sparse.boolean), ConfigParseError);
    });

    it("should be through only son file and return result with status", () => {
      function statusAssert<T>(
        result: sparse.ConfigParserResult<T>,
        expstatus: boolean,
        expvalue?: T,
        deep?: boolean
      ) {
        assert.strictEqual(result.isSuccess(), expstatus);
        const fDeepEq = deep === undefined ? true : deep;
        if (expstatus) {
          if (fDeepEq) {
            assert.deepEqual(result.except(), expvalue);
          } else {
            assert.strictEqual(result.except(), expvalue);
          }
        }
      }
      statusAssert(parseFileWithResult(resolvePath("data/valid.json"), sparse.object), true, dataObj);
      statusAssert(parseFileWithResult(resolvePath("data/valid.cson"), sparse.object), true, dataObj);
      statusAssert(parseFileWithResult(resolvePath("data/json.txt"), sparse.object), true, dataObj);
      statusAssert(parseFileWithResult(resolvePath("data/cson.txt"), sparse.object), true, dataObj);
      statusAssert(parseFileWithResult(resolvePath("data/invalid.json"), sparse.object), false);
      statusAssert(parseFileWithResult(resolvePath("data/invalid.cson"), sparse.object), false);
      statusAssert(parseFileWithResult(resolvePath("data/nosuchfile"), sparse.object), false);
      statusAssert(parseFileWithResult(resolvePath("data/normal.txt"), sparse.object), false);
      statusAssert(parseFileWithResult(resolvePath("data/valid.json"), sparse.boolean), false);
    });

    it("should be through only son file and return result on promise", () => Promise.all([
      assert.becomes(parseFileAsync(resolvePath("data/valid.json"), sparse.object), dataObj),
      assert.becomes(parseFileAsync(resolvePath("data/valid.cson"), sparse.object), dataObj),
      assert.becomes(parseFileAsync(resolvePath("data/json.txt"), sparse.object), dataObj),
      assert.becomes(parseFileAsync(resolvePath("data/cson.txt"), sparse.object), dataObj),
      assert.isRejected(parseFileAsync(resolvePath("data/invalid.json"), sparse.object), Error),
      assert.isRejected(parseFileAsync(resolvePath("data/invalid.cson"), sparse.object), Error),
      assert.isRejected(parseFileAsync(resolvePath("data/nosuchfile"), sparse.object), Error),
      assert.isRejected(parseFileAsync(resolvePath("data/normal.txt"), sparse.object), Error),
      assert.isRejected(parseFileAsync(resolvePath("data/valid.json"), sparse.boolean), ConfigParseError),
    ]));

  });

});
