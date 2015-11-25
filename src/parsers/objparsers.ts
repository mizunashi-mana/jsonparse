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
  mapSuccess,
} from "../parseresult/result";

import {
  ParseErrorStocker,
  ParseErrorNode,
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
    (l1) => res2.caseOf(
      (l2) => ParseResult.fail<{[key: string]: any}>(
        mapFailure((s) => s.addChild(pnames[index], l2.value), l1)
      ),
      (r2) => ParseResult.fail<{[key: string]: any}>(l1)
    ),
    (r1) => res2.caseOf(
      (l2) => makeFailureP<Object, {[key: string]: any}>(
        sObj,
        "failed to parse elem of 'object'",
        "object",
        <[string, ParseErrorStocker][]>[[pnames[index], l2.value]]
      ),
      (r2) => {
        const result = clone(r1.value);
        result[r2.value[0]] = r2.value[1];
        return makeSuccessP(sObj, result);
      }
    )
  );
}

/**
 * wrapper of mapSuccess
 *
 * @param sObj source success object
 * @param obj success value
 * @returns a success object with given value
 */
function makeSuccessObject<T, U>(sObj: SuccessObjType<T>, obj: U) {
  return mapSuccess((s) => obj, sObj);
}

/**
 * for escape function refer scope problem
 *
 * @param propname property name
 * @param res target result
 * @returns a result with property name and result value
 */
function addPropnameOnResult<T>(propname: string, res: ParseResult<T>) {
  return res.lift(
    (e) => mapSuccess((obj) => <[string, T]>[propname, obj], e)
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

  for (const prop of props) {
    const convObj = prop[1]
      .parse(
        makeSuccessObject(sObj, obj[prop[0]])
      );
    if (!convObj.isSuccess() && !sObj.flags.isReport) {
      break;
    }
    results.push(addPropnameOnResult(prop[0], convObj));
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
  return new Parser<Object, T>(
    (obj) => parsePropertiesObj<T>(obj.value, props, obj)
  );
}

/**
 * create error node of array from index
 *
 * @param i index of array
 * @param fl error value in array
 * @returns error node of array
 */
function buildErrorChild(i: number, fl: ParseErrorStocker) {
  return <ParseErrorNode>[`[${i}]`, fl];
}

type TupleResultConcat = (
  res1: [string[], ParseResult<any[]>],
  res2: ParseResult<any>,
  index: number
) => [string[], ParseResult<any[]>];

/**
 * A builder of concat function of array parse results
 *
 * @param sObj target success object
 * @returns concat function of array parse results
 */
function prtconcat(
  sObj: SuccessObjType<Object>
): TupleResultConcat {
  return (
    res1: [string[], ParseResult<any[]>],
    res2: ParseResult<any>,
    index: number
  ) => {
    const result1 = res1[0].concat(res2.caseOf(
      (f) => {
        let expected = "";
        f.value.report((msg, exp) => expected = exp);
        return expected;
      },
      (s) => (<string>s.value.constructor.name).toLowerCase()
    ));
    const result2 = res1[1].caseOf(
      (l1) => res2.caseOf(
        (l2) => ParseResult.fail<any[]>(
          mapFailure((s) => s.addChild(buildErrorChild(index, l2.value)), l1)
        ),
        (r2) => ParseResult.fail<any[]>(l1)
      ),
      (r1) => res2.caseOf(
        (l2) => makeFailureP<Object, any[]>(
          sObj,
          "unknown",
          "unknown",
          [buildErrorChild(index, l2.value)]
        ),
        (r2) => makeSuccessP(sObj, r1.value.concat([r2.value]))
      )
    );
    return <[string[], ParseResult<any[]>]>[result1, result2];
  };
}

export function parseTupleObject<T>(
  n: number,
  parsers: Parser<Object, any>[]
) {
  return (obj: SuccessObjType<Object>) => {
    const value = obj.value;
    const results: ParseResult<any>[] = [];

    if (value instanceof Array) {
      if (value.length == n) {
        for (let i = 0; i < n; i++) {
          const result = parsers[i].parse(
            makeSuccessObject(obj, value[i])
          );
          if (!result.isSuccess() && !obj.flags.isReport) {
            break;
          }
          results.push(result);
        }
        if (results.length != n) {
          return makeFailureP<Object, T>(obj, `failed to parse elem of 'tuple${n}'`, `tuple${n}`);
        }
        const prresult2 = results.reduce(
          prtconcat(obj),
          <[string[], ParseResult<any[]>]>[[], makeSuccessP(obj, <any[]>[])]
        );
        const expected = `[${prresult2[0].join(", ")}]`;
        return prresult2[1].caseOf(
          (f) => ParseResult.fail<T>(mapFailure((fv) => fv.desc(
            `failed to parse elem of '${expected}'`,
            expected
          ), f)),
          (s) => ParseResult.success(mapSuccess((sv) => <T><any>sv, s))
        );
      }
      return makeFailureP<Object, T>(
        obj, `${JSON.stringify(value)} is not 'tuple${n}'`, `tuple${n}`
      );
    }
    return makeFailureP<Object, T>(
      obj, `${JSON.stringify(value)} is not 'array'`, "array"
    );
  };
}

/**
 * A builder of array type parser
 *
 * @param parser for parsing elements
 * @returns array type parser
 */
export function isTuple1<T>(parser: Parser<Object, T>) {
  return new Parser<Object, [T]>(
    parseTupleObject<[T]>(1, [parser])
  );
}

export function isTuple2<T1, T2>(
  parser1: Parser<Object, T1>,
  parser2: Parser<Object, T2>
) {
  return new Parser<Object, [T1, T2]>(
    parseTupleObject<[T1, T2]>(2, [parser1, parser2])
  );
}

export function isTuple3<T1, T2, T3>(
  parser1: Parser<Object, T1>,
  parser2: Parser<Object, T2>,
  parser3: Parser<Object, T3>
) {
  return new Parser<Object, [T1, T2, T3]>(
    parseTupleObject<[T1, T2, T3]>(3, [parser1, parser2, parser3])
  );
}

export function isTuple4<T1, T2, T3, T4>(
  parser1: Parser<Object, T1>,
  parser2: Parser<Object, T2>,
  parser3: Parser<Object, T3>,
  parser4: Parser<Object, T4>
) {
  return new Parser<Object, [T1, T2, T3, T4]>(
    parseTupleObject<[T1, T2, T3, T4]>(4, [parser1, parser2, parser3, parser4])
  );
}

export function isTuple5<T1, T2, T3, T4, T5>(
  parser1: Parser<Object, T1>,
  parser2: Parser<Object, T2>,
  parser3: Parser<Object, T3>,
  parser4: Parser<Object, T4>,
  parser5: Parser<Object, T5>
) {
  return new Parser<Object, [T1, T2, T3, T4, T5]>(
    parseTupleObject<[T1, T2, T3, T4, T5]>(5, [parser1, parser2, parser3, parser4, parser5])
  );
}
