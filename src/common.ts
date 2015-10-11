import {
  ParseErrorStocker
} from "./parseresult/parseerr";

import {
  ParseResult,
  SuccessObjType,
} from "./parseresult/result2";

export type ParseFunc<T, U> = (obj: SuccessObjType<T>) => ParseResult<U>;

export function makeSuccess<T, U>(obj: SuccessObjType<T>, convObj: U) {
  return ParseResult.success<U>({
    value: convObj,
    flags: obj.flags,
  });
}

export function makeFailure<T, U>(obj: SuccessObjType<T>, msg: string, exp?: string) {
  return ParseResult.fail<U>(new ParseErrorStocker(msg, exp));
}

export type MapperParseResult<T, U> = (obj: T) => ParseResult<U>;
export function mapParseResult<T, U>(f: (
  mkS: (convObj: U) => ParseResult<U>,
  mkF: (msg: string, exp?: string) => ParseResult<U>
) => MapperParseResult<T, U>): ParseFunc<T, U> {
  return (obj) => f(
    (convObj: U) => makeSuccess<T, U>(obj, convObj),
    (msg: string, exp?: string) => makeFailure<T, U>(obj, msg, exp)
  )(obj.value);
}

export class Parser<T, U> {
  private action: ParseFunc<T, U>;
  constructor(fn: ParseFunc<T, U>) {
    this.action = fn;
  }
  parse(obj: SuccessObjType<T>): ParseResult<U> {
    return this.action(obj);
  }
}
