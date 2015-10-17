export type ParseErrorNode = [string, ParseErrorStocker];

export class ParseErrorStocker {
  private innerMsg: string;
  private innerExpected: string;
  private innerActual: string;
  private innerChilds: ParseErrorNode[];

  constructor(childs?: ParseErrorNode[]);
  constructor(msg: string, childs?: ParseErrorNode[]);
  constructor(msg: string, exp?: string, childs?: ParseErrorNode[]);
  constructor(msg: string, exp?: string, act?: string, childs?: ParseErrorNode[]);
  constructor(
    arg1?: (ParseErrorNode[]|string),
    arg2?: (ParseErrorNode[]|string),
    arg3?: (ParseErrorNode[]|string),
    arg4?: ParseErrorNode[]
  ) {
    this.innerMsg = "this is not parsable";
    this.innerExpected = "unknown";
    this.innerActual = typeof undefined;
    if (typeof arg1 !== "string") {
      this.innerChilds = typeof arg1 === "undefined" ? [] : arg1;
    } else if (typeof arg2 !== "string") {
      this.innerMsg = arg1;
      this.innerChilds = typeof arg2 === "undefined" ? [] : arg2;
    } else if (typeof arg3 !== "string") {
      this.innerMsg = arg1;
      this.innerExpected = arg2;
      this.innerChilds = typeof arg3 === "undefined" ? [] : arg3;
    } else {
      this.innerMsg = arg1;
      this.innerExpected = arg2;
      this.innerActual = arg3;
      this.innerChilds = typeof arg4 === "undefined" ? [] : arg4;
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
