/**
 * Node type for Parse Error children
 */
export type ParseErrorNode = [string, ParseErrorStocker];

/**
 * Error stocker class
 */
export class ParseErrorStocker {
  private innerMsg: string;
  private innerExpected: string;
  private innerActual: string;
  private innerChilds: ParseErrorNode[];

  /**
   * @param childs children of stocker
   * @param msg failure message
   * @param exp expected type
   * @param act actual object show
   */
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
    this.innerActual = "<unknown>";
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

  /**
   * return new stocker added child
   *
   * @param value added child value
   * @returns new stocker including new child
   */
  addChild(value: ParseErrorNode): ParseErrorStocker;
  /**
   * return new stocker added child
   *
   * @param pname property name
   * @param stocker child stocker value
   * @returns new stocker including new child
   */
  addChild(pname: string, stocker: ParseErrorStocker): ParseErrorStocker;
  addChild(arg1: (string|ParseErrorNode), arg2?: ParseErrorStocker) {
    if (typeof arg1 === "string") {
      return new ParseErrorStocker(this.innerMsg, this.innerExpected, this.innerChilds.concat([[arg1, arg2]]));
    } else {
      return new ParseErrorStocker(this.innerMsg, this.innerExpected, this.innerChilds.concat([arg1]));
    }
  }

  /**
   * return new stocker added children
   *
   * @param nodes nodes for adding
   * @returns new stocker including new children
   */
  addChilds(nodes: ParseErrorNode[]) {
    return new ParseErrorStocker(this.innerMsg, this.innerExpected, this.innerChilds.concat(nodes));
  }

  /**
   * return new stocker redesced
   *
   * @param msg new failure message
   * @param exp new expected type
   * @returns new stocker redescing
   */
  desc(msg: string, exp?: string) {
    return new ParseErrorStocker(msg, (typeof exp === "undefined") ? this.innerExpected : exp, this.innerChilds);
  }

  /**
   * report this error with report function
   *
   * @param f report function
   * @param f.msg failure message
   * @param f.exp expected type
   * @param f.act actual value
   * @param f.childs child nodes of result
   */
  report(f: (msg: string, exp?: string, act?: string, childs?: ParseErrorNode[]) => any): void {
    f(this.innerMsg, this.innerExpected, this.innerActual, this.innerChilds);
  }

}
