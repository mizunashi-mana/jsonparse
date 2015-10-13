import {
  ParseErrorNode,
} from "../parseresult/parseerr";

function repeat(count: number, str: string): string {
  if (count == 0) {
    return "";
  }
  const repU = repeat(Math.floor(count / 2), str);
  const repU2 = repU + repU;
  return repU2 + ((count % 2) == 1 ? str : "");
}
export function customReporter(logFunc: (msg: string) => any): (msg: string, exp?: string, childs?: ParseErrorNode[]) => void {
  const reportF = (pname: string, depth: number) => (msg: string, exp?: string, childs?: ParseErrorNode[]) => {
    logFunc(`Error: ${repeat(depth * 2, " ")}${depth === 0 ? "" : "."}${pname} - ${msg}`);
    childs.forEach((e) => {
      e[1].report(reportF(e[0], depth + 1));
    });
  };
  return reportF("root", 0);
}
