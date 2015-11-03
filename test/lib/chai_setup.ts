/// <reference path="../../lib/lib/typings.d.ts" />
/* tslint:disable:no-require-imports */

import * as chai from "chai";
import chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

function escapeRegExp(str: string){
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function assertThrow(
  fn: () => any,
  err?: Function,
  msg?: string|RegExp
) {
  const regMsg = typeof msg === "string"
    ? new RegExp("(^| )" + escapeRegExp(msg) + "( |$)")
    : msg
    ;
  return chai.assert.throw(
    fn, err,
    (typeof msg === "undefined") ? undefined : regMsg
  );
}

export {
  assert
} from "chai";
