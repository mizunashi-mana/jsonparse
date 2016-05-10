/// <reference path="../typings.d.ts" />

import * as fs from 'fs';
import * as path from 'path';
import * as CSON from 'cson';

/**
 * convert JSON string to JSON object
 *
 * @param jsonStr JSON string
 * @returns converted JSON object
 */
export function parseJSONString(jsonStr: string): Object {
  return JSON.parse(jsonStr);
}

/**
 * convert CSON string to JSON object
 *
 * @param csonStr CSON string
 * @returns converted JSON object
 */
export function parseCSONString(csonStr: string): Object {
  const res = CSON.parseCSONString(csonStr);
  if (res instanceof Error) {
    throw res;
  }
  return res;
}

/**
 * convert JSON file to JSON object
 *
 * @param filename JSON file name
 * @returns converted JSON object
 */
export function parseJSONFile(filename: string): Object {
  return parseJSONString(fs.readFileSync(filename).toString());
}

/**
 * convert CSON file to JSON object
 *
 * @param filename CSON file name
 * @returns converted JSON object
 */
export function parseCSONFile(filename: string): Object {
  return parseCSONString(fs.readFileSync(filename).toString());
}

enum ResultType { Left, Right }

/**
 * SONParseResult stocker (like Either)
 *
 * @param L left type
 * @param R right type
 */
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

  public static left<L, R>(lv: L) {
    return new SONParseResult<L, R>(ResultType.Left, lv);
  }

  public static right<L, R>(rv: R) {
    return new SONParseResult<L, R>(ResultType.Right, undefined, rv);
  }

  public of<T>(t: T) {
    return SONParseResult.right<L, T>(t);
  }

  public isRight() {
    return this.t === ResultType.Right;
  }

  public chain<T>(f: (r: R) => SONParseResult<L, T>) {
    return this.isRight()
      ? f(this.rv)
      : SONParseResult.left<L, T>(this.lv)
      ;
  }

  public lift<T>(f: (r: R) => T) {
    return this.chain((v) => this.of<T>(f(v)));
  }

  public value(def: L) {
    return this.isRight()
      ? def
      : this.lv
      ;
  }

  public trycatch(f: (r: R) => L) {
    return this.chain((v) => {
      try {
        return SONParseResult.left<L, R>((f(v)));
      } catch (e) {
        return this.of(v);
      }
    });
  }

}

/**
 * SON file table for [[parseSONFile]]
 */
const parseSONTable: [string, (content: string) => Object][] = [
  ['json', parseJSONString],
  ['cson', parseCSONString],
];

/**
 * helper function of parse file content
 *
 * @param filename file name
 * @param content file content
 * @returns parse result from [[parseSONTable]]
 */
function parseSONContent(filename: string, content: string): SONParseResult<Object, string> {
  const sResult = parseSONTable.map((e) => '.' + e[0]).indexOf(path.extname(filename));

  if (sResult >= 0) {
    // found in table
    return SONParseResult.left<Object, string>(parseSONTable[sResult][1](content));
  } else {
    // not found in table
    return parseSONTable.reduce(
      (p, c) => p.trycatch(c[1]),
      SONParseResult.right<Object, string>(content)
    );
  }
}

/**
 * parsing SON file synchlonized
 *
 * @param filename file name for parsing
 * @returns parsed JSON object
 */
export function parseSONFileSync(filename: string): Object {
  const fcontent = fs.readFileSync(filename).toString();

  const result = parseSONContent(filename, fcontent);
  if (result.isRight()) {
    throw new Error(`${filename} is not parsable son file`);
  }
  return result.value(undefined);
}

/**
 * parsing SON file
 *
 * @param fname file name for parsing
 * @param cb callback for parsing result
 * @param cb.e error object on fail and undefined on success
 * @param cb.obj success object
 */
export function parseSONFile(fname: string, cb: (e: any, obj: Object) => any): void {
  fs.readFile(fname, (err: NodeJS.ErrnoException, data: Buffer) => {
    // read error
    if (err) {
      return cb(err, undefined);
    }

    try {
      const result = parseSONContent(fname, data.toString());
      if (result.isRight()) {
        // parse error
        return cb(new Error(`${fname} is not parsable son file`), undefined);
      }

      // success
      return cb(undefined, result.value(undefined));
    } catch (e) {
      // some exception
      return cb(e, undefined);
    }
  });
}
