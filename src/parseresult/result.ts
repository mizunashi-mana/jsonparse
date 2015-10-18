import {ParseErrorStocker} from "./parseerr";

import {id} from "../lib/util/ts-util";

/**
 * Result types
 */
export enum ResultType {Success, Failure}

export type ResultFlagType = {
  /**
   * is this parser reporting finally?
   */
  isReport: boolean;
};

export interface BaseObjType {
  flags: ResultFlagType;
}

/**
 * parser's object type on fail
 */
export interface FailObjType extends BaseObjType {
  value:  ParseErrorStocker;
}

/**
 * parser's object type on success
 */
export interface SuccessObjType<S> extends BaseObjType {
  value: S;
}

export function mapSuccess<S, T>(f: (s: S) => T, v: SuccessObjType<S>) {
  return {
    value: f(v.value),
    flags: v.flags,
  };
}

export function mapFailure(f: (s: ParseErrorStocker) => ParseErrorStocker, v: FailObjType) {
  return {
    value: f(v.value),
    flags: v.flags,
  };
}

/**
 * Parse result class (like either)
 *
 * @param S parsed value type
 */
export class ParseResult<S> {
  private t: ResultType;
  private lv: FailObjType;
  private rv: SuccessObjType<S>;

  constructor(type: ResultType, fail: FailObjType, success?: SuccessObjType<S>) {
    this.t = type;
    this.lv = fail;
    this.rv = success;
  }

  /**
   * create success result
   *
   * @param value of success
   * @returns success parse result
   */
  static success<S>(value: SuccessObjType<S>) {
    return new ParseResult<S>(ResultType.Success, undefined, value);
  }

  /**
   * create fail result
   *
   * @param value of fail
   * @returns fail parse result
   */
  static fail<S>(value: FailObjType) {
    return new ParseResult<S>(ResultType.Failure, value);
  }

  /**
   * create function merging two result value
   *
   * @param f merge function
   * @returns safe function merging two result value
   */
  static bind2<T1, T2, T3>(
    f: (arg1: SuccessObjType<T1>, arg2: SuccessObjType<T2>) => ParseResult<T3>
  ) {
    return (
      res1: ParseResult<T1>,
      res2: ParseResult<T2>
    ) => {
      return res1.chain<T3>((val1) => {
        return res2.chain<T3>((val2) => {
          return f(val1, val2);
        });
      });
    };
  }

  /**
   * check this result is success
   *
   * @returns is this success
   */
  isSuccess(): boolean {
    return this.t === ResultType.Success;
  }

  /**
   * bind result
   *
   * @param f bind function
   * @returns fail on fail and bind value on success
   */
  chain<T>(f: (r: SuccessObjType<S>) => ParseResult<T>) {
    return this.isSuccess()
      ? f(this.rv)
      : ParseResult.fail<T>(this.lv)
      ;
  }

  /**
   * unit result
   *
   * @param t unit value
   * @returns success include unit value
   */
  of<T>(t: SuccessObjType<T>) {
    return ParseResult.success<T>(t);
  }

  /**
   * fmap result
   *
   * @param f map function
   * @returns fail on fail and map value on success
   */
  lift<T>(f: (r: SuccessObjType<S>) => SuccessObjType<T>) {
    return this.chain((val) => this.of<T>(f(val)));
  }

  /**
   * convert fail to success
   * My sad is not existing pattern match...
   *
   * @param f catch function
   * @returns this value on success and converted success value on fail
   */
  catch(f: (l: FailObjType) => SuccessObjType<S>) {
    return ParseResult.success<S>(
      this.isSuccess()
      ? this.rv
      : f(this.lv)
    );
  }

  /**
   * no comment
   */
  caseOf<T>(
    fl: (l: FailObjType) => T,
    fr: (r: SuccessObjType<S>) => T
  ): T {
    return this.isSuccess()
      ? fr(this.rv)
      : fl(this.lv)
      ;
  }

  /**
   * clone this object
   */
  clone() {
    return this.isSuccess()
      ? ParseResult.success<S>(id(this.rv))
      : ParseResult.fail<S>(id(this.lv))
      ;
  }

  valueSuccess(def: SuccessObjType<S>): SuccessObjType<S> {
    return this.isSuccess()
      ? this.rv
      : def
      ;
  }

  valueFailure(def: FailObjType): FailObjType {
    return this.isSuccess()
      ? def
      : this.lv
      ;
  }
}
