import {ParseResult} from "./parseresult/result";

export const makeSuccess = ParseResult.success;
export const makeFailure = ParseResult.fail;

export type mkSType<T> = (val: T) => ParseResult<T>;
export type mkFType<T> = () => ParseResult<T>;

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
