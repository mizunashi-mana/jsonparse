import {
  ReporterType,
} from "../";

import {
  ParseErrorNode,
  ParseErrorStocker,
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
): ReporterType {
  const reportF = (
    pname: string,
    depthCount: number,
    prefix: string,
    last: boolean
  ) => (msg: string, exp?: string, act?: string, childs?: ParseErrorNode[]) => {
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
): ReporterType {
  const reportF = (
    pname: string,
    basename: string,
    depthCount: number
  ) => (msg: string, exp?: string, act?: string, childs?: ParseErrorNode[]) => {
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

export function jsonReporter(
  logFunc: (msg: string) => any,
  flags?: {
    isOneLine?: boolean;
  },
  depth?: number
): ReporterType {
  const convertErrorToObject = (err: ParseErrorStocker, depthCount: number) => {
    let result: string | {[key: string]: any};
    err.report((msg, exp, act, childs) => {
      if (typeof depth !== "undefined" && depth == depthCount || childs.length == 0) {
        result = msg;
      } else {
        result = {};
        childs.forEach((e) => {
          (<{[key: string]: any}>result)[e[0]] = convertErrorToObject(
            e[1],
            depthCount + 1
          );
        });
      }
    });
    return result;
  };
  return (msg: string, exp: string, act: string, childs: ParseErrorNode[]) => {
    const result: Object = convertErrorToObject(
      new ParseErrorStocker(msg, exp, act, childs), 0
    );
    if (typeof flags !== "undefined" && flags.isOneLine === true) {
      logFunc(JSON.stringify(result));
    } else {
      JSON.stringify(result, null, 2)
        .split("\n").forEach((e) => logFunc(e));
    }
  };
}
