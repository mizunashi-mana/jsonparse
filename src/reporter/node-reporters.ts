import {
  ParseErrorNode,
} from "../parseresult/parseerr";

import {
  repeat
} from "../lib/util/util";

export function nestedReporter(
  logFunc: (msg: string) => any,
  depth?: number
): (msg: string, exp?: string, childs?: ParseErrorNode[]) => void {
  const reportF = (
    pname: string,
    depthCount: number
  ) => (msg: string, exp?: string, childs?: ParseErrorNode[]) => {
    if (typeof depth !== "undefined" && depthCount > depth) {
      return;
    }
    logFunc(`${depthCount === 0 ? "-" : `${repeat(depthCount - 1, " ")}|- .${pname} :`} ${msg}`);
    childs.forEach((e) => {
      e[1].report(reportF(e[0], depthCount + 1));
    });
  };
  return reportF("", 0);
}
