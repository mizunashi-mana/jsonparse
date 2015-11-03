import {
  Parser,
  makeSuccess as makeSuccessP,
  makeFailure as makeFailureP,
} from "../common";

import {clone} from "../lib/util/util";

import {
  ParseResult,
  SuccessObjType,
  mapFailure,
} from "../parseresult/result";

import {
  ParseErrorStocker
} from "../parseresult/parseerr";

/**
 * A concat function of object parse results
 *
 * @param ObjectResultConcat.res1 previous returned last function
 * @param ObjectResultConcat.res2 current parsed result
 * @param ObjectResultConcat.index current index
 */
type ObjectResultConcat = (
  res1: ParseResult<{[key: string]: any}>,
  res2: ParseResult<[string, any]>,
  index: number
) => ParseResult<{[key: string]: any}>;

/**
 * A builder of concat function of object parse results
 *
 * @param pnames property names for report error
 * @param sObj target success object
 * @returns concat function of object parse results
 */
function probjconcat(
  pnames: string[],
  sObj: SuccessObjType<Object>
): ObjectResultConcat {
  return (
    res1: ParseResult<{[key: string]: any}>,
    res2: ParseResult<[string, any]>,
    index: number
  ) => res1.caseOf(
    (l1) => res2.caseOf((l2) => ParseResult.fail<{[key: string]: any}>(
      mapFailure((s) => s.addChild(pnames[index], l2.value), l1)
    ), (r2) => ParseResult.fail<{[key: string]: any}>(l1)),
    (r1) => res2.caseOf((l2) => makeFailureP<Object, {[key: string]: any}>(
      sObj,
      "failed to parse elem of 'object'",
      "object",
      <[string, ParseErrorStocker][]>[[pnames[index], l2.value]]
    ), (r2) => {
      const result = clone(r1.value);
      result[r2.value[0]] = r2.value[1];
      return makeSuccessP(sObj, result);
    })
  );
}

/**
 * A type parse function of object has the properties
 *
 * @param obj target object with type safe
 * @param parser a parser for parsing each elements of object
 * @param sObj target success object
 * @returns result of object
 */
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

/**
 * A build of type parser of object has specify properties
 *
 * @param props property list
 * @returns result of check has properties
 */
export function hasPropertiesObj<T>(
  props: [string, Parser<Object, any>][]
) {
  return new Parser<Object, T>((obj) => {
    const result = parsePropertiesObj(obj.value, props, obj);
    return <ParseResult<T>>result;
  });
}
