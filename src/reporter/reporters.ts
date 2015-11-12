/// <reference path="../lib/typings.d.ts" />

import {
  EventEmitter
} from "events";

import {
  ReporterType,
} from "../";

import {
  ParseErrorNode,
  ParseErrorStocker,
} from "../parseresult/parseerr";

/**
 * converting string for [[propertyJoin]] or more...
 *
 * @param pname property name
 * @returns converted string
 */
function convertPropertyNameForConcat(pname: string) {
  return pname[0] === "["
    ? pname
    : "." + pname
    ;
}

/**
 * properties join function
 *
 * @param base base property
 * @param pname property child name
 * @returns joined property
 */
function propertyJoin(base: string, pname: string) {
  return base === "" ? pname : base + convertPropertyNameForConcat(pname);
}

/**
 * A builder of reporter with nested show
 *
 * @param logFunc print function for log
 * @param depth depth count (if not set, all logged)
 * @returns nested show reporter
 */
export function nestReporter(
  logFunc: (msg: string) => any,
  depth?: number
): ReporterType {
  const reportF = (
    pname: string,
    depthCount: number,
    prefix: string,
    last: boolean
  ) => (msg: string, exp: string, act: string, childs: ParseErrorNode[]) => {
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

/**
 * A builder of reporter with listed show
 *
 * @param logFunc print function for log
 * @param depth depth count (if not set, all logged)
 * @returns listed show reporter
 */
export function listReporter(
  logFunc: (msg: string) => any,
  depth?: number
): ReporterType {
  const reportF = (
    pname: string,
    basename: string,
    depthCount: number
  ) => (msg: string, exp: string, act: string, childs: ParseErrorNode[]) => {
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

/**
 * A builder of reporter with json show
 *
 * @param logFunc print function for log
 * @param flags reporter options
 * @param flags.isOneLine is report one line (default: false)
 * @param depth depth count (if not set, all logged)
 * @returns json show reporter
 */
export function jsonReporter(
  logFunc: (msg: string) => any,
  flags?: {
    isOneLine?: boolean;
  },
  depth?: number
): ReporterType;
export function jsonReporter(
  logFunc: (msg: string) => any,
  depth?: number
): ReporterType;
export function jsonReporter(
  logFunc: (msg: string) => any,
  arg1?: {
    isOneLine?: boolean;
  } | number,
  arg2?: number
): ReporterType {
  let flags: {
    isOneLine?: boolean;
  } = undefined;
  let depth: number = undefined;
  if (typeof arg1 === "number") {
    depth = arg1;
  } else {
    flags = arg1;
    depth = arg2;
  }

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

/**
 * custom report function type
 *
 * @param customReportFunc.reportInfo report information
 * @param customReportFunc.reportInfo.message fail message
 * @param customReportFunc.reportInfo.expected expected type
 * @param customReportFunc.reportInfo.actual actual recept object
 * @param customReportFunc.data extra report data
 * @param customReportFunc.data.depth called depth count
 * @param customReportFunc.data.isLeaf the flag of is leaf
 * @param customReportFunc.data.propertyName full propertyname
 */
export type customReportFunc = (
  reportInfo: {
    message?: string;
    expected?: string;
    actual?: string;
  },
  data?: {
    depth: number;
    isLeaf: boolean;
    propertyName: string;
  }
) => void;

/**
 * A builder of customize reporter with given function
 *
 * @param reportFunc custom report function
 * @returns a reporter with given function
 */
export function customReporter(reportFunc: customReportFunc, emitterObj?: EventEmitter): ReporterType {
  const emitFunc: Function = (
    typeof emitterObj === "undefined"
    ? () => { return; }
    : emitterObj.emit
  )
    .bind(emitterObj);

  const reportF = (
    pname: string,
    basename: string,
    depthCount: number
  ) => (msg: string, exp: string, act: string, childs: ParseErrorNode[]) => {
    const propertyFullName = propertyJoin(basename, pname);
    const data = {
      depth: depthCount,
      isLeaf: childs.length === 0,
      propertyName: propertyFullName,
    };
    reportFunc({message: msg, expected: exp, actual: act}, data);
    childs.forEach((e) => {
      e[1].report(reportF(e[0], propertyFullName, depthCount + 1));
    });
  };

  return (msg: string, exp: string, act: string, childs: ParseErrorNode[]) => {
    try{
      emitFunc("start", msg, exp, act);
      emitFunc("begin", msg, exp, act);
      reportF("this", "", 0)(msg, exp, act, childs);
      emitFunc("end", msg, exp, act);
    } catch(e) {
      emitFunc("error", e);
    }
  };
}
