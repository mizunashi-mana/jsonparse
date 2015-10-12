import {
  FailObjType,
  SuccessObjType,
  ParseResult,
} from "../parseresult/result";

import {
  ParseErrorStocker
} from "../parseresult/parseerr";

import {
  Parser,
  mapParseResult,
  MapperParseResult,
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

export function descBuilder(msg: string, expected?: string): {
  msg: string,
  expected?: string,
} {
  return {
    msg: msg,
    expected: expected,
  };
};

export function descParser<T, U>(fail: {
  msg: string;
  expected?: string;
}, parser: Parser<T, U>) {
  return new Parser<T, U>((obj) => {
    const res = parser.parse(obj);
    return res.caseOf((l) => ParseResult.fail<U>({
      value: l.value.desc(fail.msg, fail.expected),
      flags: l.flags,
    }), (r) => ParseResult.success(r));
  });
}

function createMsgFromExpected(obj: Object, expected: string[]) {
  const objStr = JSON.stringify(obj);

  const subExps = expected.slice(0, expected.length - 1);
  const expsStr = subExps.length == 0
    ? expected[0]
    : `${subExps.join(", ")} or ${expected[expected.length - 1]}`
    ;
  return subExps.length == 0
    ? `${objStr} is not ${expsStr}`
    : `${objStr} is neither ${expsStr}`
    ;
}
export function descFromExpectedParser<T, U>(expected: (string|string[]), parser: Parser<T, U>) {
  const exps = typeof expected === "string" ? [expected] : expected;
  const expsStr = exps.join(" | ");
  return new Parser<T, U>((obj) => {
    const msg = createMsgFromExpected(obj, exps);
    const res = parser.parse(obj);
    return res.caseOf((l) => ParseResult.fail<U>({
      value: l.value.desc(msg, expsStr),
      flags: l.flags,
    }), (r) => ParseResult.success(r));
  });
}

export function receiveParser<T, U>(
  onSuccess: (obj: SuccessObjType<U>) => any,
  onFailure: (obj: FailObjType) => any,
  parser: Parser<T, U>
) {
  return new Parser<T, U>((obj) => {
    const res = parser.parse(obj);
    res.caseOf(onFailure, onSuccess);
    return res;
  });
}

export function thenCatchParser<T, U>(
  onFail: (obj: FailObjType) => any,
  parser: Parser<T, U>
) {
  return receiveParser((obj) => obj, onFail, parser);
}

export function catchParser<T, U>(
  onFail: (obj: FailObjType) => SuccessObjType<U>,
  parser: Parser<T, U>
) {
  return new Parser<T, U>((obj) => {
    const res = parser.parse(obj);
    return res.caseOf(
      (err) => ParseResult.success(onFail(err)),
      (convObj) => ParseResult.success(convObj)
    );
  });
}

export function mapParser<T1, T2, T3>(
  fn: (obj: SuccessObjType<T2>) => SuccessObjType<T3>,
  parser: Parser<T1, T2>
) {
  return new Parser<T1, T3>((obj) => {
    return parser
      .parse(obj)
      .lift(fn);
  });
}

export function failParser<T>(msg: string, exp?: string) {
  return new Parser<any, T>((obj) => {
    return ParseResult.fail<T>({
      value: new ParseErrorStocker(msg, exp),
      flags: obj.flags,
    });
  });
}

export function successParser<T>(value: T) {
  return new Parser<any, T>((obj) => {
    return ParseResult.success<T>({
      value: value,
      flags: obj.flags,
    });
  });
}

export function customParser<T, U>(
  f: (
    mkS: (convObj: U) => ParseResult<U>,
    mkF: (msg?: string, exp?: string) => ParseResult<U>
  ) => MapperParseResult<T, U>
): Parser<T, U> {
  const parseF = mapParseResult<T, U>(f);
  return new Parser(parseF);
}
