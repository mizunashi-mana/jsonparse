import {
  Parser,
  makeSuccess,
  makeFailure,
} from "../common";

import {ParseResult} from "../parseresult/result";

export class TypeParser<T> extends Parser<Object, T> {}

export function isNumber() {
  return new TypeParser<number>((obj) => {
    if (typeof obj === "number") {
      return makeSuccess<number>(obj);
    } else {
      return makeFailure<number>();
    }
  });
}

export function isString() {
  return new TypeParser<string>((obj) => {
    if (typeof obj === "string") {
      return makeSuccess<string>(obj);
    } else {
      return makeFailure<string>();
    }
  });
}

export function isBoolean() {
  return new TypeParser<boolean>((obj) => {
    if (typeof obj === "boolean") {
      return makeSuccess<boolean>(obj);
    } else {
      return makeFailure<boolean>();
    }
  });
}

export function isArray<T>(parser: TypeParser<T>) {
  return new TypeParser<T[]>((obj) => {
    if (obj instanceof Array) {
      const prconcat = ParseResult.bind2((a: T[], b: T) => {
        return ParseResult.success(a.concat([b]));
      });
      const results = obj
        .map((e) => parser.parse(e))
        .reduce(prconcat, makeSuccess(<T[]>[]));
      return results;
    } else {
      return makeFailure<T[]>();
    }
  });
}

export function isObject() {
  return new TypeParser<Object>((obj) => {
    if (typeof obj === "object"
     && !(obj instanceof Array)) {
      return makeSuccess<Object>(obj);
    } else {
      return makeFailure<Object>();
    }
  });
}

export function isNothing<T>(value: T) {
  return new TypeParser<T>((obj) => {
    if (typeof obj === "undefined" || obj === null) {
      return makeSuccess<T>(value);
    } else {
      return makeFailure<T>();
    }
  });
}
