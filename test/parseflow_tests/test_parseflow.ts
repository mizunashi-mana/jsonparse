/// <reference path="../../lib/lib/typings.d.ts" />

import {assert} from "chai";

import * as jsonparse from "../../lib/";

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
