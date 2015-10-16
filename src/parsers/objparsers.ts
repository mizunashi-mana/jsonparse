import {
  Parser,
} from "../common";

import {clone} from "../lib/util/util";

import {
  ParseResult,
  ResultFlagType,
} from "../parseresult/result";

import {ParseErrorStocker} from "../parseresult/parseerr";

function probjconcat(
  pnames: string[]
): (
  res1: ParseResult<{[key: string]: any}>,
  res2: ParseResult<[string, any]>,
  index: number
) => ParseResult<{[key: string]: any}> {
  return (
    res1: ParseResult<{[key: string]: any}>,
    res2: ParseResult<[string, any]>,
    index: number
  ) => res1.caseOf(
    (l1) => res2.caseOf((l2) => ParseResult.fail<{[key: string]: any}>({
      value: l1.value.addChild(pnames[index], l2.value),
      flags: l1.flags,
    }), (r2) => ParseResult.fail<{[key: string]: any}>(l1)),
    (r1) => res2.caseOf((l2) => ParseResult.fail<{[key: string]: any}>({
      value: new ParseErrorStocker(
        "failed to parse elem of 'object'",
        "object",
        <[string, ParseErrorStocker][]>[[pnames[index], l2.value]]
      ),
      flags: l2.flags,
    }), (r2) => {
      const result = clone(r1.value);
      result[r2.value[0]] = r2.value[1];
      return ParseResult.success<{[key: string]: any}>({
        value: result,
        flags: r1.flags
      });
    })
  );
}

function parsePropertiesObj<T>(
  obj: {[key: string]: any},
  props: [string, Parser<Object, any>][],
  flags: ResultFlagType
): ParseResult<T> {
  const results: ParseResult<[string, Parser<Object, any>]>[] = [];

  let i: number;
  for (i = 0; i < props.length; i++) {
    const convObj = props[i][1]
      .parse({
        value: obj[props[i][0]],
        flags: flags,
      })
      .chain((e) => ParseResult.success({
        value: <[string, any]>[props[i][0], e.value],
        flags: flags,
      }));
    if (!convObj.isSuccess()) {
      if (!flags.isReport) {
        break;
      }
    }
    results.push(convObj);
  }

  if (results.length != props.length) {
    return ParseResult.fail<T>({
      value: new ParseErrorStocker(
        "failed to parse property of 'object'",
        "object"
      ),
      flags: flags,
    });
  }
  return <ParseResult<T>>results
    .reduce(probjconcat(
      props.map((e) => e[0])
    ), ParseResult.success({
      value: <{[key: string]: any}>{},
      flags: flags,
    }));
}

export function hasPropertiesObj<T>(
  props: [string, Parser<Object, any>][]
) {
  return new Parser<Object, T>((obj) => {
    const result = parsePropertiesObj(obj.value, props, obj.flags);
    return <ParseResult<T>>result;
  });
}
