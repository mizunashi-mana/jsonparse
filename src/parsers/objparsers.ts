import {
  Parser,
  makeSuccess as makeSuccessP,
  makeFailure as makeFailureP,
} from "../common";

import {clone} from "../lib/util/util";

import {
  ParseResult,
  SuccessObjType,
} from "../parseresult/result";

import {
  ParseErrorStocker
} from "../parseresult/parseerr";

function probjconcat(
  pnames: string[],
  sObj: SuccessObjType<Object>
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
      flags: sObj.flags,
    }), (r2) => ParseResult.fail<{[key: string]: any}>(l1)),
    (r1) => res2.caseOf((l2) => makeFailureP<Object, {[key: string]: any}>(
      sObj,
      "failed to parse elem of 'object'", "object",
      <[string, ParseErrorStocker][]>[[pnames[index], l2.value]]
    ), (r2) => {
      const result = clone(r1.value);
      result[r2.value[0]] = r2.value[1];
      return makeSuccessP(sObj, result);
    })
  );
}

function parsePropertiesObj<T>(
  obj: {[key: string]: any},
  props: [string, Parser<Object, any>][],
  sObj: SuccessObjType<Object>
): ParseResult<T> {
  const results: ParseResult<[string, Parser<Object, any>]>[] = [];

  let i: number;
  for (i = 0; i < props.length; i++) {
    const convObj = props[i][1]
      .parse({
        value: obj[props[i][0]],
        flags: sObj.flags,
      })
      .chain((e) => makeSuccessP(
        sObj,
        <[string, any]>[props[i][0], e.value]
      ));
    if (!convObj.isSuccess()) {
      if (!sObj.flags.isReport) {
        break;
      }
    }
    results.push(convObj);
  }

  if (results.length != props.length) {
    return makeFailureP<Object, T>(
      sObj,
      "failed to parse property of 'object'",
      "object"
    );
  }
  return <ParseResult<T>>results
    .reduce(
      probjconcat(props.map((e) => e[0]), sObj),
      makeSuccessP(sObj, <{[key: string]: any}>{})
    );
}

export function hasPropertiesObj<T>(
  props: [string, Parser<Object, any>][]
) {
  return new Parser<Object, T>((obj) => {
    const result = parsePropertiesObj(obj.value, props, obj);
    return <ParseResult<T>>result;
  });
}
