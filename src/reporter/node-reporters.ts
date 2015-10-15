import {
  ParseErrorNode,
} from "../parseresult/parseerr";

import {
  repeat
} from "../lib/util/util";

export function customReporter(logFunc: (msg: string) => any): (msg: string, exp?: string, childs?: ParseErrorNode[]) => void {
  const reportF = (pname: string, depth: number) => (msg: string, exp?: string, childs?: ParseErrorNode[]) => {
    logFunc(`Error: ${repeat(depth * 2, " ")}${depth === 0 ? "" : "."}${pname} - ${msg}`);
    childs.forEach((e) => {
      e[1].report(reportF(e[0], depth + 1));
    });
  };
  return reportF("root", 0);
}
