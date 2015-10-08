import {
  Parser,
  ParseFunc,
  mkSType,
  mkFType,
  makeSuccess,
  makeFailure,
} from "../common";

export function orParser<T, U>(parser1: Parser<T, U>, parser2: Parser<T, U>) {
  return new Parser<T, U>((obj) => {
    const res1 = parser1.parse(obj);
    if (res1.isSuccess()) {
      return res1;
    } else {
      return parser2.parse(obj);
    }
  });
}

export function andParser<T1, T2, T3>(parser1: Parser<T1, T2>, parser2: Parser<T2, T3>) {
  return new Parser<T1, T3>((obj) => {
    return parser1
      .parse(obj)
      .chain((val) => parser2.parse(val));
  });
}

export function descBuilder(msg: string, expected?: string, failF?: (msg: string, expected?: string) => any) {
  return {
    msg: msg,
    expected: expected,
    handle: failF,
  };
}

export function descParser<T, U>(fail: {
  msg: string;
  expected?: string;
  handle?: (msg: string, expected?: string) => any;
}, parser: Parser<T, U>) {
  return new Parser<T, U>((obj) => {
    const res = parser.parse(obj);
    if (typeof fail.handle !== "undefined" && !res.isSuccess()) {
      fail.handle(fail.msg, fail.expected);
    }
    return res;
  });
}

export function receiveParser<T, U>(onSuccess: (obj: U) => any, onFail: () => any, parser: Parser<T, U>) {
  return new Parser<T, U>((obj) => {
    const res = parser.parse(obj);
    res.lift(onSuccess);
    if (!res.isSuccess()) {
      onFail();
    }
    return res;
  });
}

export function catchParser<T, U>(onFail: () => any, parser: Parser<T, U>) {
  return receiveParser((obj) => obj, onFail, parser);
}

export function mapParser<T1, T2, T3>(fn: (obj: T2) => T3, parser: Parser<T1, T2>) {
  return new Parser<T1, T3>((obj) => {
    return parser
      .parse(obj)
      .lift(fn);
  });
}

export function setDefaultParser<T, U>(def: U, parser: Parser<T, U>) {
  return new Parser<T, U>((obj) => {
    const res = parser.parse(obj);
    return res.catch(def);
  });
}

export function failParser<T>() {
  return new Parser<any, T>((obj) => {
    return makeFailure<T>();
  });
}

export function successParser<T>(value: T) {
  return new Parser<any, T>((obj) => {
    return makeSuccess<T>(value);
  });
}

export function customParser<T, U>(
  fn: (
    onSuccess: mkSType<U>,
    onFailure: mkFType<U>
  ) => ParseFunc<T, U>
) {
  const parseF = fn(makeSuccess, makeFailure);
  return new Parser<T, U>(parseF);
}
