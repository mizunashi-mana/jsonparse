import {
  ParseErrorStocker,
} from '../parseresult/parseerr';

import {
  FailObjType,
  SuccessObjType,
  ParseResult,
  mapFailure,
} from '../parseresult/result';

import {
  Parser,
  makeFailure as makeFailureP,
  makeSuccess as makeSuccessP,
  mapParseResult,
  MapperParseResult,
} from '../common';

import {
  JSONstringify,
} from '../lib/util/ts-util';

/**
 * A builder of or parser using map function for failures
 *
 * @param parser1 first parser
 * @param parser2 second parser
 * @param mapFailures merge function for two failures
 * @returns a parser returns first parser value if first parser succeeded, else second parser result
 */
function innerOrParser<T, U>(
  parser1: Parser<T, U>,
  parser2: Parser<T, U>,
  mapFailures: (fail1: FailObjType, fail2: FailObjType) => FailObjType
) {
  return new Parser<T, U>((obj) => {
    const res1 = parser1.parse(obj);
    return res1.caseOf(
      (convObj1) => parser2.parse(obj).caseOf(
        (convObj2) => ParseResult.fail<U>(mapFailures(convObj1, convObj2)),
        (convObj2) => ParseResult.success(convObj2)
      ),
      (convObj1) => ParseResult.success(convObj1)
    );
  });
}

/**
 * merge two Fail Objects for or parser
 *
 * @param convObj1 first failure
 * @param convObj2 second failure
 * @returns merged failure
 */
function mergeFailuresForOr(convObj1: FailObjType, convObj2: FailObjType) {
  return mapFailure((obj1) => {
    const obj2 = convObj2.value;
    let failMsg: string;
    let expected: string;
    let actual: string;
    obj1.report((msg1, exp1, act) => {
      obj2.report((msg2, exp2) => {
        const convMsg1 = msg1[msg1.length - 1] === '.' ? msg1 : msg1 + '.';
        const convMsg2 = msg2[msg2.length - 1] === '.' ? msg2 : msg2 + '.';
        failMsg = `${convMsg1} And, ${convMsg2}`;
        expected = `${exp1} | ${exp2}`;
        actual = act;
      });
    });
    return new ParseErrorStocker(failMsg, expected, actual);
  }, convObj1);
}

/**
 * A builder of or parser
 *
 * @param parser1 first parser
 * @param parser2 second parser
 * @returns a parser returns first parser value if first parser succeeded, else second parser result
 */
export function orParser<T, U>(parser1: Parser<T, U>, parser2: Parser<T, U>) {
  return innerOrParser(parser1, parser2, mergeFailuresForOr);
}

/**
 * A builder of or parser with first parser description
 *
 * @param parser1 first parser
 * @param parser2 second parser
 * @returns
 *   a parser returns first parser value if first parser succeeded,
 *   else second parser result with first parser description
 */
export function orExtraParser<T, U>(parser1: Parser<T, U>, parser2: Parser<T, U>) {
  return innerOrParser(parser1, parser2, (f1, f2) => f1);
}

/**
 * A builder of and parser
 *
 * @param parser1 first parser
 * @param parser2 second parser
 * @returns a parser returns map each parsers result value
 */
export function andParser<T1, T2, T3>(parser1: Parser<T1, T2>, parser2: Parser<T2, T3>) {
  return new Parser<T1, T3>(
    (obj) => parser1
      .parse(obj)
      .chain((val) => parser2.parse(val))
  );
}

/**
 * A builder of description for parser result
 *
 * @param msg failure message
 * @param expected expected type
 * @returns description object of failure
 */
export function descBuilder(msg: string, expected?: string): {
  msg: string,
  expected?: string,
} {
  return {
    msg: msg,
    expected: expected,
  };
};

/**
 * A builder of description parser
 *
 * @param fail description object of failure
 * @param fail.msg failure message
 * @param fail.expected expected type
 * @param parser target parser
 * @returns a parser with new description
 */
export function descParser<T, U>(fail: {
  msg: string;
  expected?: string;
}, parser: Parser<T, U>) {
  return new Parser<T, U>((obj) => {
    const res = parser.parse(obj);
    return res.caseOf(
      (l) => ParseResult.fail<U>(
        mapFailure((s) => s.desc(fail.msg, fail.expected), l)
      ),
      (r) => ParseResult.success(r)
    );
  });
}

/**
 * Create usual message for [[descFromExpectedParser]] from actual and expected
 *
 * @param obj actual object
 * @param expected expected types
 * @returns message from actual and expected
 */
function createMsgFromExpected<T>(obj: SuccessObjType<T>, expected: string[]) {
  const objStr = JSONstringify(obj.value);

  const subExps = expected.slice(0, expected.length - 1);
  const expsStr = subExps.length === 0
    ? `'${expected[0]}'`
    : `'${subExps.join("', '")}' or '${expected[expected.length - 1]}'`
    ;
  return subExps.length === 0
    ? `${objStr} is not ${expsStr}`
    : `${objStr} is neither ${expsStr}`
    ;
}

/**
 * A builder of description parser from expected
 *
 * @param expected expected type or types
 * @param parser target parser
 * @returns a parser with new description from expected
 */
export function descFromExpectedParser<T, U>(expected: (string|string[]), parser: Parser<T, U>) {
  const exps = typeof expected === 'string' ? [expected] : expected;
  const expsStr = exps.join(' | ');
  return new Parser<T, U>((obj) => {
    const msg = createMsgFromExpected(obj, exps);
    const res = parser.parse(obj);
    return res.caseOf(
      (l) => ParseResult.fail<U>(
        mapFailure((s) => s.desc(msg, expsStr), l)
      ),
      (r) => ParseResult.success(r)
    );
  });
}

/**
 * A builder of parse event receive parser
 *
 * The value returned by receiver is throw away and no effect.
 *
 * @param onSuccess receiver on success
 * @param onSuccess.obj receive success object
 * @param onFailure receiver on fail
 * @param onFailure.obj receive fail object
 * @param parser target parser
 * @returns a parser call receiver on parse
 */
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

/**
 * A builder of parse failed event receive parser
 *
 * A value of receiver's return is throw away and no effect.
 *
 * @param onFail receiver on fail
 * @param onFail.obj receive failure object
 * @param parser target parser
 * @returns a parser call receiver on fail
 */
export function thenCatchParser<T, U>(
  onFail: (obj: FailObjType) => any,
  parser: Parser<T, U>
) {
  return receiveParser((obj) => obj, onFail, parser);
}

/**
 * A builder of catch parser
 *
 * @param onFail catch function on fail
 * @param onFail.obj receive failure object
 * @param parser target parser
 * @returns a parser catch failure and convert success
 */
export function catchParser<T, U>(
  onFail: (obj: FailObjType) => SuccessObjType<U>,
  parser: Parser<T, U>
) {
  return new Parser<T, U>(
    (obj) => parser.parse(obj).catch(onFail)
  );
}

/**
 * A builder of map parser
 *
 * @param fn map function of success value
 * @param fn.obj receive success object
 * @param parser target parser
 * @returns a parser convert result on fail with map function
 */
export function mapParser<T1, T2, T3>(
  fn: (obj: SuccessObjType<T2>) => SuccessObjType<T3>,
  parser: Parser<T1, T2>
) {
  return new Parser<T1, T3>(
    (obj) => parser.parse(obj).lift(fn)
  );
}

/**
 * A builder of fail parser
 *
 * @param msg failure message
 * @param exp expected type
 * @returns a parser this result is fail
 */
export function failParser<T>(msg: string, exp?: string) {
  return new Parser<any, T>(
    (obj) => makeFailureP<any, T>(obj, msg, exp)
  );
}

/**
 * A builder of success parser
 *
 * @param value success value
 * @returns a parser this result is success
 */
export function successParser<T>(value: T) {
  return new Parser<any, T>(
    (obj) => makeSuccessP(obj, value)
  );
}

/**
 * A builder of seq2 parser
 *
 * @param parser1 first parser
 * @param parser2 second parser
 * @returns a parser this result is two length array from first and second parsed
 */
export function seq2Parser<T, U1, U2>(parser1: Parser<T, U1>, parser2: Parser<T, U2>): Parser<T, [U1, U2]> {
  const seqFunc = ParseResult.bind2(
    (obj1: SuccessObjType<U1>, obj2: SuccessObjType<U2>) => makeSuccessP(obj1, <[U1, U2]>[obj1.value, obj2.value])
  );
  return new Parser<T, [U1, U2]>((obj) => {
    const res1 = parser1.parse(obj);
    return res1.chain((convObj) => seqFunc(res1, parser2.parse(obj)));
  });
}

/**
 * A builder of bind parser
 *
 * @param f bind function
 * @param f.convObj converted object
 * @param parser target parser
 * @returns binded parser with given function
 */
export function bindParser<T, U1, U2>(
  f: (convObj: SuccessObjType<U1>) => ParseResult<U2>,
  parser: Parser<T, U1>
): Parser<T, U2> {
  return new Parser<T, U2>(
    (obj) => parser.parse(obj).chain(f)
  );
}

/**
 * A builder of custom parser
 *
 * @param f builder of custom function for parser
 * @param f.mkS make success function
 * @param f.mkS.convObj success value of result
 * @param f.mkF make failure function
 * @param f.mkF.msg failure message
 * @param f.mkF.exp expected type
 * @returns custom parser with custom function
 */
export function customParser<T, U>(
  f: (
    mkS: (convObj: U) => ParseResult<U>,
    mkF: (msg?: string, exp?: string, act?: string) => ParseResult<U>
  ) => MapperParseResult<T, U>
): Parser<T, U> {
  const parseF = mapParseResult<T, U>(f);
  return new Parser(parseF);
}
