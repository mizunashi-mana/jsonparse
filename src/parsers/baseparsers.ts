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
    onSuccess: mkSType<T>,
    onFailure: mkFType<T>
  ) => ParseFunc<T, U>
) {
  const parseF = fn(makeSuccess, makeFailure);
  return new Parser<T, U>(parseF);
}
