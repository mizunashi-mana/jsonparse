import {
  Parser,
  mapParseResult,
  MapperParseResult,
} from "../common";

import {
  ParseResult,
  ResultFlagType,
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
  res1: ParseResult<T[]>,
  res2: ParseResult<T>,
  index: number
): ParseResult<T[]> {
  return res1.caseOf(
    (l1) => res2.caseOf((l2) => ParseResult.fail<T[]>({
      value: l1.value.addChild(buildErrorChild(index, l2.value)),
      flags: l1.flags,
    }), (r2) => ParseResult.fail<T[]>(l1)),
    (r1) => res2.caseOf((l2) => ParseResult.fail<T[]>({
      value: new ParseErrorStocker(
        "failed to parse elem of array",
        "array",
        [buildErrorChild(index, l2.value)]
      ),
      flags: l2.flags,
    }), (r2) => ParseResult.success<T[]>({
      value: r1.value.concat([r2.value]),
      flags: r1.flags
    }))
  );
}

function parseArrayObj<T>(
  arr: Object[],
  parser: Parser<Object, T>,
  flags: ResultFlagType
): ParseResult<T[]> {
  const results: ParseResult<T>[] = [];
  for (const obj of arr) {
    const convObj = parser.parse({
      value: obj,
      flags: flags,
    });
    if (!convObj.isSuccess()) {
      if (!flags.isReport) {
        break;
      }
    }
    results.push(convObj);
  }
  if (results.length != arr.length) {
    return ParseResult.fail<T[]>({
      value: new ParseErrorStocker(
        "failed to parse elem of array",
        "array"
      ),
      flags: flags,
    });
  }
  return <ParseResult<T[]>>results
    .reduce(prconcat, ParseResult.success({
      value: [],
      flags: flags,
    }));
}

export function isArray<T>(parser: Parser<Object, T>) {
  return new Parser<Object, T[]>((obj) => {
    const value = obj.value;
    if (value instanceof Array) {
      const results = parseArrayObj(value, parser, obj.flags);
      return <ParseResult<T[]>>results;
    } else {
      return ParseResult.fail<T[]>({
        value: new ParseErrorStocker(
          `${JSON.stringify(obj.value)} is not 'array'`,
          "array"
        ),
        flags: obj.flags,
      });
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
