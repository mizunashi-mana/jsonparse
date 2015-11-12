/// <reference path="./lib/typings.d.ts" />

import {
  BaseCustomError,
} from "./lib/customerror/node-customerror";

import {
  parseSONFileSync,
  parseSONFile,
} from "./lib/util/node-util";

import {
  Parser,
  MapperParseResult,
} from "./common";

import {
  successParser,
  failParser,
  orParser,
  orExtraParser,
  andParser,
  mapParser,
  receiveParser,
  thenCatchParser,
  catchParser,
  customParser,
  descBuilder,
  descParser,
  descFromExpectedParser,
  seq2Parser,
  bindParser,
} from "./parsers/baseparsers";

import {
  isBoolean,
  isNumber,
  isString,
  isObject,
  isArray,
  isNothing,
} from "./parsers/basetypes";

import {
  hasPropertiesObj,
} from "./parsers/objparsers";

import {
  ParseResult,
  SuccessObjType,
  mapSuccess,
} from "./parseresult/result";

import {
  ParseErrorNode,
  ParseErrorStocker,
} from "./parseresult/parseerr";

import {
  Monad,
  Functor,
  MonadPlus,
  Monoid,
  Applicative,
} from "./lib/basetypes/basetypes";

import {
  nestReporter as nestReporterInstance,
  listReporter as listReporterInstance,
  jsonReporter as jsonReporterInstance,
  customReporter as customReporterInstance,
} from "./reporter/reporters";

/**
 * Error class of ConfigParser
 */
export class ConfigParseError extends BaseCustomError {
  /**
   * @param msg error message
   */
  constructor(msg?: string) {
    super(msg);
  }
}

// Fantasy area
export interface ConfigParserMonoid<T, U> extends Monoid<U> { };
export interface ConfigParserFunctor<T, U> extends Functor<U> { };
export interface ConfigParserApplicative<T, U> extends Applicative<U> { };
export interface ConfigParserMonad<T, U> extends Monad<U> { };
export interface ConfigParserMonadPlus<T, U> extends MonadPlus<U> { };

let emptyFail: ConfigParser<any, any>;

/**
 * ConfigParserResult class including some helper methods
 *
 * @param T result type
 */
export class ConfigParserResult<T> implements Functor<T>, Applicative<T>, Monad<T> {

  /**
   * ConfigParserResult has a parseresult object.
   *
   * Actually, ConfigParserResult is a wrapper class of ParseResult.
   */
  private v: ParseResult<T>;

  /**
   * @param pr inner result
   */
  constructor(pr: ParseResult<T>) {
    this.v = pr;
  }

  /**
   * check this result is success
   *
   * @returns is this success
   */
  isSuccess(): boolean {
    return this.v.isSuccess();
  }

  /**
   * an alias of [[isSuccess]]
   *
   * @returns is this success
   */
  get status(): boolean {
    return this.isSuccess();
  }

  /**
   * report on failure using given reporter
   *
   * @param reporter a reporter (default: nest console reporter)
   * @returns this object as it is
   */
  report(reporter?: ReporterType): ConfigParserResult<T> {
    if (!this.isSuccess()) {
      const reporterF = typeof reporter === "undefined"
        ? nestReporterInstance(console.log)
        : reporter
        ;
      this.v.valueFailure(undefined).value.report(reporterF);
    }
    return this;
  }

  /**
   * except success method,
   * return converted object on success and throw error
   *
   * @param msg failure message (default: config parser error message)
   * @returns success value
   */
  except(msg?: string): T {
    if (!this.isSuccess()) {
      this.v.valueFailure(undefined).value.report((errMsg) => {
        const message = typeof msg === "undefined"
          ? errMsg
          : msg
          ;
        throw new ConfigParseError(message);
      });
    }
    return this.v.valueSuccess(undefined).value;
  }

  /**
   * an alias of [[except]]
   * if fail, throw default error
   *
   * @returns success value
   */
  get ok(): T {
    return this.except();
  }

  /**
   * convert result to success value
   *
   * @param val default value
   * @returns success value on success and default value on failure
   */
  toSuccess(val: T): T {
    return this.v.valueSuccess({value: val, flags: undefined}).value;
  }

  /**
   * convert result to error
   *
   * @param err default value
   * @returns error on failure and default value on success
   */
  toError(err: Error): Error {
    let reserr: Error = err;
    if (!this.isSuccess()) {
      this.v.valueFailure(undefined).value.report((errMsg) => {
        reserr = new ConfigParseError(errMsg);
      });
    }
    return reserr;
  }

  /**
   * convert result to other by casing
   *
   * @param onSuccess convert success value function
   * @param onSuccess.obj success result value
   * @param onFailure convert error function
   * @param onFailure.err convert error
   * @returns convert success on success and error on failure
   */
  caseOf<R>(onSuccess: (obj: T) => R, onFailure: (err: ConfigParseError) => R): R {
    return this.v.caseOf(
      (obj) => {
        let msg: string;
        obj.value.report((errMsg) => {
          msg = errMsg;
        });
        return onFailure(new ConfigParseError(msg));
      },
      (obj) => onSuccess(obj.value)
    );
  }

  /**
   * convert result to promise
   *
   * @returns a promise return converted value
   */
  toPromise() {
    return new Promise<T>((resolve, reject) => {
      this.caseOf(
        (convObj) => resolve(convObj),
        (err) => reject(err)
      );
    });
  }

  /**
   * Fantasy area
   */

  // functor
  map<R>(fn: (obj: T) => R): ConfigParserResult<R> {
    return new ConfigParserResult<R>(this.v.lift((obj) => mapSuccess(fn, obj)));
  }
  fmap = this.map;
  lift = this.fmap;

  // applicative
  of<R>(val: R): ConfigParserResult<R> {
    return new ConfigParserResult<R>(this.v.lift((obj) => mapSuccess((inObj) => val, obj)));
  };
  unit = this.of;

  ap<R>(u: ConfigParserResult<(t: T) => R>): ConfigParserResult<R> {
    return u.chain<R>((fn) => this.map(fn));
  };

  // monad
  bind<R>(f: (t: T) => ConfigParserResult<R>): ConfigParserResult<R> {
    return this.v.caseOf(
      (obj) => new ConfigParserResult(ParseResult.fail<R>(obj)),
      (obj) => f(obj.value)
    );
  }
  chain = this.bind;
}

/**
 * ConfigParser class including some helper methods
 *
 * @param T in object type
 * @param U out object type
 */
export class ConfigParser<T, U> implements
  ConfigParserMonoid<T, U>, ConfigParserFunctor<T, U>,
  ConfigParserApplicative<T, U>, ConfigParserMonad<T, U>,
  ConfigParserMonadPlus<T, U>
{
  /**
   * ConfigParser has a parser object.
   *
   * Actually, ConfigParser is a wrapper class of Parser.
   */
  private innerParser: Parser<T, U>;

  /**
   * @param p inner parser
   */
  constructor(p: Parser<T, U>) {
    this.innerParser = p;
  }

  /**
   * build a or parser of this
   *
   * @param parser second parser
   * @returns a or parser of this parser and arg parser
   */
  or(parser: ConfigParser<T, U>) {
    return new ConfigParser(orParser(
      this.parser,
      parser.parser
    ));
  }

  /**
   * build a and parser of this
   *
   * @param parser second parser
   * @returns a and parser of this parser and arg parser
   */
  and<R>(parser: ConfigParser<U, R>) {
    return new ConfigParser(andParser(
      this.parser,
      parser.parser
    ));
  }

  /**
   * build a map parser of this
   *
   * @param fn map function
   * @param fn.obj target converted object
   * @returns a map parser of this with arg function
   */
  map<R>(fn: (obj: U) => R) {
    return new ConfigParser(mapParser(
      (innerObj) => <SuccessObjType<R>>{
        value: fn(innerObj.value),
        flags: innerObj.flags,
      },
      this.parser
    ));
  }

  /**
   * build a map parser of this for deep developer
   *
   * @param fn map function
   * @param fn.obj target converted success inner object
   * @returns a map parser of this with arg function
   */
  innerMap<R>(fn: (obj: SuccessObjType<U>) => SuccessObjType<R>) {
    return new ConfigParser(mapParser(fn, this.parser));
  }

  /**
   * build a description parser of this
   *
   * @param msg description
   * @param exp expected type
   * @returns a description parser of this
   */
  desc(msg: string, exp?: string) {
    return new ConfigParser(descParser(descBuilder(msg, exp), this.parser));
  }

  /**
   * build a description parser of this from only expected
   *
   * @param exp expected type or types
   * @returns a description parser of this from expected
   */
  descFromExpected(exp: (string|string[])) {
    return new ConfigParser(descFromExpectedParser(exp, this.parser));
  }

  /**
   * build a receive parser of this
   *
   * @param onSuccess receiver on success
   * @param onSuccess.obj receive success object
   * @param onFail receiver on fail
   * @param onFail.msg receive message
   * @param onFail.exp expected type
   * @param onFail.act actual type
   * @returns a receive parser of this
   */
  then(
    onSuccess: (obj: U) => any,
    onFail?: (msg: string, exp?: string, act?: string) => any
  ) {
    const onFailure = typeof onFail === "undefined"
      ? () => { return; }
      : onFail
      ;
    return new ConfigParser(receiveParser(
      (innerObj) => onSuccess(innerObj.value),
      (innerObj) => innerObj.value.report(onFailure),
      this.parser
    ));
  }

  /**
   * build a catch parser of this
   *
   * @param onFail receiver on fail
   * @param onFail.msg receive message
   * @param onFail.exp expected type
   * @param onFail.act actual type
   * @returns a catch parser of this
   */
  catch(onFail: (msg: string, exp?: string, act?: string) => any) {
    return new ConfigParser(thenCatchParser((innerObj) => innerObj.value.report(onFail), this.parser));
  }

  /**
   * build a default parser of this
   *
   * @param def default value
   * @returns this parsed value on success and default value on fail
   */
  default(def: U) {
    return new ConfigParser(catchParser(
      (obj) => ({
        value: def,
        flags: obj.flags,
      }),
      this.parser
    ));
  }

  /**
   * build a optional parser of this
   *
   * @param def default value
   * @returns this parsed value on success and default value on fail and this value is nothing
   */
  option(def: U) {
    return new ConfigParser(orExtraParser(
      this.parser,
      isNothing(def)
    ));
  }

  /**
   * build a seq parser
   *
   * @param parser second parser
   * @returns a parser returns two length array from first and second parsed value
   */
  seq2<R>(parser: ConfigParser<T, R>): ConfigParser<T, [U, R]> {
    return new ConfigParser(seq2Parser(this.parser, parser.parser));
  }

  /**
   * this is for developer getter
   *
   * you should not use this property
   *
   * @returns this inner parser instance
   */
  get parser(): Parser<T, U> {
    return this.innerParser;
  }

  /**
   * parse object and return parsed value on success and throw error on fail
   *
   * @param obj target object
   * @returns parsed value
   * @throws ConfigParseError failed to parse
   */
  parse(obj: T): U {
    const res = this.parser.parse({
      value: obj,
      flags: {
        isReport: false,
      },
    });
    if (res.isSuccess()) {
      return res.valueSuccess(undefined).value;
    } else {
      res.valueFailure(undefined).value.report((msg: string) => {
        throw new ConfigParseError(msg);
      });
    }
  }

  /**
   * parse object and return parsed value with parse status
   *
   * @param obj target object
   * @returns result object ([[ConfigParserResult]])
   */
  parseWithResult(obj: T): ConfigParserResult<U> {
    const res = this.parser.parse({
      value: obj,
      flags: {
        isReport: true,
      },
    });
    return new ConfigParserResult(res);
  }

  /**
   * parse object and return parsed value on promise
   *
   * @param obj target object
   * @returns a promise returning parsed value on success and error on fail
   */
  parseAsync(obj: T): Promise<U> {
    return new Promise<U>((resolve, reject) => {
      const res = this.parseWithResult(obj);
      res.caseOf(
        (convObj) => resolve(convObj),
        (err) => reject(err)
      );
    });
  }

  /**
   * Fantasy area
   */

  // Monoid
  get mempty() {
    return <ConfigParser<T, U>>emptyFail;
  };
  empty = this.mempty;

  mappend = this.or;
  append = this.mappend;

  mconcat(ps: ConfigParser<T, U>[]): ConfigParser<T, U> {
    return ps.reduce((a, b) => a.mappend(b), this);
  }
  concat = this.mconcat;

  // Functor
  fmap = this.map;
  lift = this.fmap;

  // Applicative
  of<R>(val: R) {
    return <ConfigParser<U, R>>succeed(val);
  };
  unit = this.of;

  ap<R>(u: ConfigParser<T, (t: U) => R>): ConfigParser<T, R> {
    return u.seq2(this).map((obj) => obj[0](obj[1]));
  }

  // Monad
  // of <- using Applicative

  bind<R>(f: (t: U) => ConfigParser<T, R>): ConfigParser<T, R> {
    return new ConfigParser(bindParser(
      (obj) => f(obj.value[0]).parser.parse(mapSuccess((inObj) => inObj[1], obj)),
      this.seq2(custom<T, T>((mkS, mkF) => (obj) => mkS(obj))).parser
    ));
  }
  chain = this.bind;

  // MonadPlus
  mzero = this.mempty;
  zero = this.mzero;

  mplus = this.mappend;
  plus = this.mplus;
}

// keep the fail instance
emptyFail = fail("empty");

/**
 * helper function for type parser
 *
 * @param pf type parser builder
 * @returns config parser include target parser
 */
function buildConfigParserF<T, U>(pf: () => Parser<T, U>) {
  return new ConfigParser<T, U>(pf());
}

/** a parser of base of base for chain root */
export const base = new ConfigParser(customParser<Object, Object>((mkS, mkF) => (obj) => mkS(obj)));

/**
 * build a success parser with value
 *
 * @param val success value
 * @returns a parser with success and given value
 */
export function succeed<T>(val: T) {
  return new ConfigParser(successParser(val));
}

/**
 * build a fail parser with fail info
 *
 * @param msg failure message
 * @param expected expected type
 * @returns a parser with fail and fail info
 */
export function fail<T>(msg?: string, expected?: string) {
  return new ConfigParser(failParser<T>(msg, expected));
}

/** a type parser for boolean type */
export const boolean = buildConfigParserF(isBoolean);
/** a type parser for number type */
export const number = buildConfigParserF(isNumber);
/** a type parser for string type */
export const string = buildConfigParserF(isString);
/** a type parser for object type */
export const object = buildConfigParserF(isObject);

/**
 * build a type parser for array type
 *
 * @param parser for element parsed
 * @returns a type parser for array type with custom type parser
 */
export function array<T>(parser: ConfigParser<Object, T>) {
  return new ConfigParser(isArray(parser.parser));
}

/**
 * build a type parser for specify object type
 *
 * @param props property and custom parser list
 * @returns a type parser for specify object type with custom type parser
 */
export function hasProperties<T>(
  props: [string, ConfigParser<any, any>][]
) {
  return new ConfigParser(andParser(
    isObject(),
    hasPropertiesObj<T>(
      props.map((e) => <[string, Parser<any, any>]>[e[0], e[1].parser])
    )
  ));
}

/**
 * build a custom parser with custom parse function
 *
 * @param fn custom parse function
 * @param fn.onSuccess make success function
 * @param fn.onSuccess.obj parsed success value
 * @param fn.onFailure make failure function
 * @param fn.onFailure.msg failure message
 * @param fn.onFailure.exp expected type
 * @param fn.onFailure.act actual object
 * @returns a parser with custom parse function
 */
export function custom<T, U>(fn: (
  onSuccess: (obj: U) => ParseResult<U>,
  onFailure: (msg?: string, exp?: string, act?: string) => ParseResult<U>
) => MapperParseResult<T, U>) {
  return new ConfigParser(customParser(fn));
}

/**
 * parse son file with object parser
 *
 * @param fname target son file name
 * @param parser custom parser using to parse
 * @returns result of parsed
 */
export function parseFile<T>(fname: string, parser: ConfigParser<Object, T>): T {
  const obj = parseSONFileSync(fname);
  return parser.parse(obj);
}

/**
 * parse son file using object parser with status
 *
 * @param fname target son file name
 * @param parser custom parser using to parse
 * @returns result of parsed with status
 */
export function parseFileWithResult<T>(
  fname: string,
  parser: ConfigParser<Object, T>
): ConfigParserResult<T> {
  let obj: Object;
  try {
    obj = parseSONFileSync(fname);
  } catch (e) {
    return new ConfigParserResult(ParseResult.fail<T>({
      value: new ParseErrorStocker(<string>e.message),
      flags: {
        isReport: true,
      },
    }));
  }
  return parser.parseWithResult(obj);
}

/**
 * parse son file using object parser on promise
 *
 * @param fname target son file name
 * @param parser custom parser using to parse
 * @returns a promise parsing son file using given parser
 */
export function parseFileAsync<T>(fname: string, parser: ConfigParser<Object, T>): Promise<T> {
  return new Promise<Object>((resolve, reject) => {
    parseSONFile(fname, (err, result) => {
      if (err !== undefined) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  }).then((obj) => parser.parseAsync(obj));
}

/**
 * reporter type
 *
 * @param ReporterType.msg failure message
 * @param ReporterType.exp expected type
 * @param ReporterType.act actual object
 * @param ReporterType.childs nodes of error
 */
export type ReporterType = (msg: string, exp?: string, act?: string, childs?: ParseErrorNode[]) => void;

/**
 * any reporters
 */
export namespace reporters {
  /** a reporter with nested show */
  export const nestReporter = nestReporterInstance;

  /** a reporter with listed show */
  export const listReporter = listReporterInstance;

  /** a reporter with json show */
  export const jsonReporter = jsonReporterInstance;

  /** a reporter customize with given function */
  export const customReporter = customReporterInstance;
};
