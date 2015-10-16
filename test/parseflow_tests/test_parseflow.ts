/// <reference path="../../lib/lib/typings.d.ts" />

import {
  assert,
  assertThrow,
} from "../lib/chai_setup";

import * as path from "path";

import * as jsonparse from "../../lib/";
const {
  ConfigParseError,
  parseFile,
  parseFileWithStatus,
  nestedReporter,
} = jsonparse;

describe("parse methods test", () => {

  describe("parse object test", () => {

    it("should return result on success and throw on fail", () => {
      assert.strictEqual(jsonparse.boolean.parse(true), true);
      assertThrow(() => jsonparse.boolean.parse("str"),
        ConfigParseError, "\"str\" is not 'boolean'"
      );
    });

    it("should return result with status", () => {
      const result1 = jsonparse
        .boolean.parseWithStatus(true);
      assert.propertyVal(result1, "status", true);
      assert.propertyVal(result1, "value", true);

      const result2 = jsonparse
        .boolean.parseWithStatus(1);
      assert.propertyVal(result2, "status", false);
    });

    it("should return result on success and report on fail", () => {
      const reporter = nestedReporter((msg) => {
        return;
      });
      assert.strictEqual(jsonparse
        .boolean.parseWithReporter(true, reporter),
        true
      );
      assertThrow(() => jsonparse
        .boolean.parseWithReporter("str", reporter),
        ConfigParseError, "\"str\" is not 'boolean'"
      );
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
      assert.deepEqual(parseFile(resolvePath("data/valid.json"), jsonparse.object), dataObj);
      assert.deepEqual(parseFile(resolvePath("data/valid.cson"), jsonparse.object), dataObj);
      assert.deepEqual(parseFile(resolvePath("data/json.txt"), jsonparse.object), dataObj);
      assert.deepEqual(parseFile(resolvePath("data/cson.txt"), jsonparse.object), dataObj);
      assertThrow(() => parseFile(resolvePath("data/invalid.json"), jsonparse.object), Error);
      assertThrow(() => parseFile(resolvePath("data/invalid.cson"), jsonparse.object), Error);
      assertThrow(() => parseFile(resolvePath("data/nosuchfile"), jsonparse.object), Error);
      assertThrow(() => parseFile(resolvePath("data/normal.txt"), jsonparse.object),
        Error, `${resolvePath("data/normal.txt")} is not parsable file`);
      assertThrow(() => parseFile(resolvePath("data/valid.json"), jsonparse.boolean), ConfigParseError);
    });

    it("should be through only son file and return result", () => {
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
      statusAssert(parseFileWithStatus(resolvePath("data/valid.json"), jsonparse.object), true, dataObj);
      statusAssert(parseFileWithStatus(resolvePath("data/valid.cson"), jsonparse.object), true, dataObj);
      statusAssert(parseFileWithStatus(resolvePath("data/json.txt"), jsonparse.object), true, dataObj);
      statusAssert(parseFileWithStatus(resolvePath("data/cson.txt"), jsonparse.object), true, dataObj);
      statusAssert(parseFileWithStatus(resolvePath("data/invalid.json"), jsonparse.object), false);
      statusAssert(parseFileWithStatus(resolvePath("data/invalid.cson"), jsonparse.object), false);
      statusAssert(parseFileWithStatus(resolvePath("data/nosuchfile"), jsonparse.object), false);
      statusAssert(parseFileWithStatus(resolvePath("data/normal.txt"), jsonparse.object), false);
      statusAssert(parseFileWithStatus(resolvePath("data/valid.json"), jsonparse.boolean), false);
    });

  });

});
