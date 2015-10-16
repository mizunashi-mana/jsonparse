import {
  ParseErrorNode,
} from "../parseresult/parseerr";

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
    depthCount: number,
    prefix: string,
    last: boolean
  ) => (msg: string, exp?: string, childs?: ParseErrorNode[]) => {
    if (typeof depth !== "undefined" && depthCount > depth) {
      return;
    }
    const prefixStr = depthCount == 0 ? ""
      : prefix
      + (last ? "└─" : "├─")
      + (childs.length == 0 || depth == depthCount ? "─" : "┬")
      + " "
      ;
    const descName = depthCount === 0
      ? pname
      : convertPropertyNameForConcat(pname)
      ;
    logFunc(`${prefixStr}${descName} : ${msg}`);

    const chlast = childs.length - 1;
    childs.forEach((e, i) => {
      const nPrefix = depthCount == 0 ? ""
        : prefix
        + (last ? "  " : "│ ")
        ;
      e[1].report(reportF(e[0], depthCount + 1, nPrefix, i == chlast));
    });
  };
  return reportF("this", 0, "", true);
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

//export function jsonReporter
