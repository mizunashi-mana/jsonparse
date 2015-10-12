export type ParseErrorNode = [string, ParseErrorStocker];

export class ParseErrorStocker {
  private innerMsg: string;
  private innerExpected: string;
  private innerChilds: ParseErrorNode[];

  constructor(childs?: ParseErrorNode[]);
  constructor(msg: string, childs?: ParseErrorNode[]);
  constructor(msg: string, exp?: string, childs?: ParseErrorNode[]);
  constructor(arg1?: (ParseErrorNode[]|string), arg2?: (ParseErrorNode[]|string), arg3?: ParseErrorNode[]) {
    if (typeof arg1 !== "string") {
      this.innerMsg = "get error";
      this.innerExpected = "unknown";
      this.innerChilds = typeof arg1 === "undefined" ? [] : arg1;
    } else if (typeof arg2 !== "string") {
      this.innerMsg = arg1;
      this.innerExpected = "unknown";
      this.innerChilds = typeof arg2 === "undefined" ? [] : arg2;
    } else {
      this.innerMsg = arg1;
      this.innerExpected = arg2;
      this.innerChilds = typeof arg3 === "undefined" ? [] : arg3;
    }
  }

  addChild(value: ParseErrorNode): ParseErrorStocker;
  addChild(pname: string, stocker: ParseErrorStocker): ParseErrorStocker;
  addChild(arg1: (string|ParseErrorNode), arg2?: ParseErrorStocker) {
    if (typeof arg1 === "string") {
      return new ParseErrorStocker(this.innerMsg, this.innerExpected, this.innerChilds.concat([[arg1, arg2]]));
    } else {
      return new ParseErrorStocker(this.innerMsg, this.innerExpected, this.innerChilds.concat([arg1]));
    }
  }

  addChilds(nodes: ParseErrorNode[]) {
    return new ParseErrorStocker(this.innerMsg, this.innerExpected, this.innerChilds.concat(nodes));
  }

  desc(msg: string, exp?: string) {
    return new ParseErrorStocker(msg, (typeof exp === "undefined") ? this.innerExpected : exp, this.innerChilds);
  }

  report(f: (msg: string, exp?: string, childs?: ParseErrorNode[]) => any): void {
    f(this.innerMsg, this.innerExpected, this.innerChilds);
  }

}
