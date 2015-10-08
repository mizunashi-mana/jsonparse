/// <reference path="../../lib/lib/typings.d.ts" />

import {assert} from "chai";

import * as path from "path";

import * as jsonparse from "../../lib/";
const {
  ConfigParseError,
  parseFile,
  parseFileWithStatus,
} = jsonparse;

describe("parse methods test", () => {

  describe("parse object test", () => {

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

  describe("parse file test", () => {
    const dataObj = {
      a1: "b",
      a2: {
        b1: 1,
        b2: true,
      },
    };

    it("should be through only son file and return result", () => {
      function resolvePath(fname: string) {
        return path.isAbsolute(fname)
          ? fname
          : path.join(__dirname, fname)
          ;
      };
      assert.deepEqual(parseFile(resolvePath("data/valid.json"), jsonparse.object), dataObj);
      assert.deepEqual(parseFile(resolvePath("data/valid.cson"), jsonparse.object), dataObj);
      assert.deepEqual(parseFile(resolvePath("data/json.txt"), jsonparse.object), dataObj);
      assert.deepEqual(parseFile(resolvePath("data/cson.txt"), jsonparse.object), dataObj);
      assert.throw(() => parseFile(resolvePath("data/invalid.json"), jsonparse.object), Error);
      assert.throw(() => parseFile(resolvePath("data/invalid.cson"), jsonparse.object), Error);
      assert.throw(() => parseFile(resolvePath("data/normal.txt"), jsonparse.object),
        Error, `${resolvePath("data/normal.txt")} is not parsable file`);
      assert.throw(() => parseFile(resolvePath("data/valid.json"), jsonparse.boolean), ConfigParseError);
    });

  });

});
