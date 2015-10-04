/// <reference path="./lib/typings.d.ts" />

export interface ParseResult<T> {
  status: boolean;
  value?: T;
  expected?: T;
}

export function makeSuccess<T>(val: T): ParseResult<T> {
  return {
    status: true,
    value: val,
  };
}

export function makeFailure<T>(exp: T): ParseResult<T> {
  return {
    status: false,
    expected: exp,
  };
}

export function isSuccess(res: ParseResult<any>): boolean {
  return res.status;
}

export type ParseFunc<T, U> = (obj: T) => ParseResult<U>;

export class Parser<T, U> {
  private action: ParseFunc<T, U>;
  constructor(fn: ParseFunc<T, U>) {
    this.action = fn;
  }
  parse(obj: T): ParseResult<U> {
    return this.action(obj);
  }
}
