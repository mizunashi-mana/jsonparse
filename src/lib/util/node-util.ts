/// <reference path="../typings.d.ts" />

import * as fs from "fs";
import * as path from "path";
import * as CSON from "cson";

export function parseJSONString(jsonStr: string): Object {
  return JSON.parse(jsonStr);
}

export function parseCSONString(csonStr: string): Object {
  const res = CSON.parseCSONString(csonStr);
  if (res instanceof Error) {
    throw res;
  }
  return res;
}

export function parseJSONFile(filename: string): Object {
  return parseJSONString(fs.readFileSync(filename).toString());
}

export function parseCSONFile(filename: string): Object {
  return parseCSONString(fs.readFileSync(filename).toString());
}

enum ResultType { Left, Right }

class SONParseResult<L, R> {
  private t: ResultType;
  private lv: L;
  private rv: R;

  constructor(
    type: ResultType,
    left?: L,
    right?: R
    ) {
    this.t = type;
    this.lv = left;
    this.rv = right;
  }

  static left<L, R>(lv: L) {
    return new SONParseResult<L, R>(ResultType.Left, lv);
  }

  static right<L, R>(rv: R) {
    return new SONParseResult<L, R>(ResultType.Right, undefined, rv);
  }

  of<T>(t: T) {
    return SONParseResult.right<L, T>(t);
  }

  chain<T>(f: (r: R) => SONParseResult<L, T>) {
    return this.t === ResultType.Left
      ? SONParseResult.left<L, T>(this.lv)
      : f(this.rv)
      ;
  }

  lift<T>(f: (r: R) => T) {
    return this.chain((v) => this.of<T>(f(v)));
  }

  value(def: L) {
    return this.t === ResultType.Left
      ? this.lv
      : def
      ;
  }

  isRight() {
    return this.t === ResultType.Right;
  }

  trycatch(f: (r: R) => L) {
    return this.chain((v) => {
      try {
        return SONParseResult.left<L, R>((f(v)));
      } catch (e) {
        return this.of(v);
      }
    });
  }

}

export function parseSONFileSync(filename: string): Object {
  const extname = path.extname(filename);
  const fcontent = fs.readFileSync(filename).toString();
  if (extname === ".json") {
    return parseJSONString(fcontent);
  } else if (extname === ".cson") {
    return parseCSONString(fcontent);
  } else {
    const result = SONParseResult.right<Object, string>(fcontent)
      .trycatch(parseJSONString)
      .trycatch(parseCSONString);

    if (result.isRight()) {
      throw new Error(`${filename} is not parsable file`);
    }
    return result.value(undefined);
  }
}


export function parseSONFile(fname: string, cb: (e: any, obj: Object) => any): void {
  fs.readFile(fname, (err: NodeJS.ErrnoException, data: Buffer) => {
    const fcontent = data.toString();
    if (err) {
      cb(err, undefined);
    }
    const ename = path.extname(fname);
    let result: Object;
    try {
      if (ename === ".json") {
        result = parseJSONString(fcontent);
      } else if (ename === ".cson") {
        result = parseCSONString(fcontent);
      } else {
        const pResult = SONParseResult.right<Object, string>(fcontent)
          .trycatch(parseJSONString)
          .trycatch(parseCSONString);

        if (pResult.isRight()) {
          throw new Error(`${fname} is not parsable file`);
        }
        result = pResult.value(undefined);
      }
      cb(undefined, result);
    } catch (e) {
      cb(e, undefined);
    }
  });

}
