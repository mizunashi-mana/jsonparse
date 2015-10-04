import {
  Parser,
  ParseFunc,
  makeSuccess,
  makeFailure,
  isSuccess,
} from "../common";

export function orParser<T, U>(parser1: Parser<T, U>, parser2: Parser<T, U>) {
  return new Parser<T, U>((obj) => {
    const res1 = parser1.parse(obj);
    if (isSuccess(res1)) {
      return res1;
    } else {
      return parser2.parse(obj);
    }
  });
}

export function failParser<T>(expected: T) {
  return new Parser<any, T>((obj) => {
    return makeFailure(expected);
  });
}

export function successParser<T>(value: T) {
  return new Parser<any, T>((obj) => {
    return makeSuccess(value);
  });
}

export function customParser<T, U>(fn: (mkS: typeof makeSuccess, mkF: typeof makeFailure) => ParseFunc<T, U>) {
  const parseF = fn(makeSuccess, makeFailure);
  return new Parser<T, U>(parseF);
}
