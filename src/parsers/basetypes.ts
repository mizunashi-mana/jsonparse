import {
  Parser,
  makeFailure as makeFailureP,
  makeSuccess as makeSuccessP,
  mapParseResult,
  MapperParseResult,
} from "../common";

import {
  ParseResult,
  SuccessObjType,
  mapFailure,
} from "../parseresult/result";

import {
  ParseErrorStocker
} from "../parseresult/parseerr";

import {
  descFromExpectedParser
} from "./baseparsers";

function buildTypeParser<T>(f: (
    mkS: (convObj: T) => ParseResult<T>,
    mkF: () => ParseResult<T>
  ) => MapperParseResult<Object, T>,
  expected: string | string[]
): Parser<Object, T> {
  const innerParser = new Parser(mapParseResult<Object, T>(f));
  return descFromExpectedParser(expected, innerParser);
}

export function isNumber() {
  return buildTypeParser<number>((makeSuccess, makeFailure) => {
    return (obj) => {
      if (typeof obj === "number") {
        return makeSuccess(obj);
      } else {
        return makeFailure();
      }
    };
  }, "number");
}

export function isString() {
  return buildTypeParser<string>((makeSuccess, makeFailure) => {
    return (obj) => {
      if (typeof obj === "string") {
        return makeSuccess(obj);
      } else {
        return makeFailure();
      }
    };
  }, "string");
}

export function isBoolean() {
  return buildTypeParser<boolean>((makeSuccess, makeFailure) => {
    return (obj) => {
      if (typeof obj === "boolean") {
        return makeSuccess(obj);
      } else {
        return makeFailure();
      }
    };
  }, "boolean");
}

function buildErrorChild(i: number, fl: ParseErrorStocker) {
  return <[string, ParseErrorStocker]>[`[${i}]`, fl];
}

function prconcat<T>(
  sObj: SuccessObjType<Object>
): (
  res1: ParseResult<T[]>,
  res2: ParseResult<T>,
  index: number
) => ParseResult<T[]> {
  return (
    res1: ParseResult<T[]>,
    res2: ParseResult<T>,
    index: number
  ) => res1.caseOf(
    (l1) => res2.caseOf((l2) => ParseResult.fail<T[]>(
      mapFailure((s) => s.addChild(buildErrorChild(index, l2.value)), l1)
    ), (r2) => ParseResult.fail<T[]>(l1)),
    (r1) => res2.caseOf((l2) => makeFailureP<Object, T[]>(
      sObj,
      "failed to parse elem of 'array'", "array",
      [buildErrorChild(index, l2.value)]
    ), (r2) => makeSuccessP(sObj, r1.value.concat([r2.value])))
  );
}

function parseArrayObj<T>(
  arr: Object[],
  parser: Parser<Object, T>,
  sObj: SuccessObjType<Object>
): ParseResult<T[]> {
  const results: ParseResult<T>[] = [];
  for (const obj of arr) {
    const convObj = parser.parse({
      value: obj,
      flags: sObj.flags,
    });
    if (!convObj.isSuccess()) {
      if (!sObj.flags.isReport) {
        break;
      }
    }
    results.push(convObj);
  }
  if (results.length != arr.length) {
    return makeFailureP<Object, T[]>(sObj, "failed to parse elem of 'array'", "array");
  }
  return <ParseResult<T[]>>results
    .reduce(prconcat(sObj), makeSuccessP(sObj, <T[]>[]));
}

export function isArray<T>(parser: Parser<Object, T>) {
  return new Parser<Object, T[]>((obj) => {
    const value = obj.value;
    if (value instanceof Array) {
      const results = parseArrayObj(value, parser, obj);
      return <ParseResult<T[]>>results;
    } else {
      return makeFailureP<Object, T[]>(obj, `${JSON.stringify(obj.value)} is not 'array'`, "array");
    }
  });
}

export function isObject() {
  return buildTypeParser<Object>((makeSuccess, makeFailure) => {
    return (obj) => {
      if (typeof obj === "object" && !(obj instanceof Array)) {
        return makeSuccess(obj);
      } else {
        return makeFailure();
      }
    };
  }, "object");
}

export function isNothing<T>(value: T) {
  return buildTypeParser<T>((makeSuccess, makeFailure) => {
    return (obj) => {
      if (typeof obj === "undefined" || obj === null) {
        return makeSuccess(value);
      } else {
        return makeFailure();
      }
    };
  }, ["undefined", "null"]);
}
