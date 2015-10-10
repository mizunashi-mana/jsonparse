import {ParseErrorStocker} from "./parseerr";

import {clone} from "../lib/util/util";

export enum ResultType {Success, Failure}

export type ResultFlagType = {
  isReport: boolean;
};
export type FailObjType = ParseErrorStocker;
export type SuccessObjType<S> = {
  obj: S;
  flags: ResultFlagType;
  stocker: ParseErrorStocker;
};

export function id<T>(a: T) {
  return clone(a, true);
}

export function exists<T>(a: T) {
  return a !== null && a !== undefined;
}

export function mapSuccess<S, T>(f: (s: S) => T, v: SuccessObjType<S>) {
  return {
    obj: f(v.obj),
    flags: v.flags,
    stocker: v.stocker,
  };
}

export function prresult<S>(f?: FailObjType, s?: SuccessObjType<S>) {
    if (exists(f) && exists(s)) {
        throw new TypeError("Cannot construct an ParseResult with both a success and a fail");
    }
    if (!exists(f) && !exists(s)) {
        throw new TypeError("Cannot construct an ParseResult with neither a success nor a fail");
    }
    if (exists(f) && !exists(s)) {
        return ParseResult.fail<S>(f);
    }
    if (!exists(f) && exists(s)) {
        return ParseResult.success<S>(s);
    }
}

export class ParseResult<S> {
  private t: ResultType;
  private lv: FailObjType;
  private rv: SuccessObjType<S>;

  constructor(type: ResultType, fail: FailObjType, success?: SuccessObjType<S>) {
    this.t = type;
    this.lv = fail;
    this.rv = success;
  }

  static success<S>(value: SuccessObjType<S>) {
    return new ParseResult<S>(ResultType.Success, undefined, value);
  }

  static fail<S>(value: FailObjType) {
    return new ParseResult<S>(ResultType.Failure, value);
  }

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

  isSuccess(): boolean {
    return this.t === ResultType.Success;
  }

  chain<T>(f: (r: SuccessObjType<S>) => ParseResult<T>) {
    return this.isSuccess()
      ? f(this.rv)
      : ParseResult.fail<T>(this.lv)
      ;
  }

  of<T>(t: SuccessObjType<T>) {
    return ParseResult.success<T>(t);
  }

  lift<T>(f: (r: SuccessObjType<S>) => SuccessObjType<T>) {
    return this.chain((val) => this.of<T>(f(val)));
  }

  catch(f: (l: FailObjType) => SuccessObjType<S>) {
    return ParseResult.success<S>(
      this.isSuccess()
      ? this.rv
      : f(this.lv)
    );
  }

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
      ? this.lv
      : def
      ;
  }
}
