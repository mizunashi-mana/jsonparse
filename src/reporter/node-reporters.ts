import {
  ParseErrorNode,
} from "../parseresult/parseerr";

import {
  repeat
} from "../lib/util/util";

function convertPropertyNameForConcat(pname: string) {
  return pname[0] === "["
    ? pname
    : "." + pname
    ;
}

function propertyJoin(base: string, pname: string) {
  return base === "" ? pname : base + convertPropertyNameForConcat(pname);
}

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
    logFunc(`${depthCount === 0 ? `- ${pname}` : `${repeat(depthCount - 1, " ")}|- ${convertPropertyNameForConcat(pname)}`} : ${msg}`);
    childs.forEach((e) => {
      e[1].report(reportF(e[0], depthCount + 1));
    });
  };
  return reportF("this", 0);
}

export function listReporter(
  logFunc: (msg: string) => any,
  depth?: number
): (msg: string, exp?: string, childs?: ParseErrorNode[]) => void {
  const reportF = (
    pname: string,
    basename: string,
    depthCount: number
  ) => (msg: string, exp?: string, childs?: ParseErrorNode[]) => {
    const propertyFullName = propertyJoin(basename, pname);
    if (typeof depth !== "undefined" && depthCount === depth || childs.length === 0) {
      logFunc(`${propertyFullName} : ${msg}`);
      return;
    }
    childs.forEach((e) => {
      e[1].report(reportF(e[0], propertyFullName, depthCount + 1));
    });
  };
  return reportF("this", "", 0);
}
