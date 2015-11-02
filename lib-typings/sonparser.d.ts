/// <reference path="ftypes.d.ts" />

declare module "sonparser" {
  import * as ftypes from "sonparser/ftypes";

  /**
   * Error class of ConfigParser
   */
  export interface ConfigParseError extends Error {
    /**
     * @param msg error message
     */
    new (msg?: string): ConfigParseError;
  }

  export interface ConfigParserMonoid<T, U> extends ftypes.Monoid<U> {}
  export interface ConfigParserFunctor<T, U> extends ftypes.Functor<U> {}
  export interface ConfigParserApplicative<T, U> extends ftypes.Applicative<U> {}
  export interface ConfigParserMonad<T, U> extends ftypes.Monad<U> {}
  export interface ConfigParserMonadPlus<T, U> extends ftypes.MonadPlus<U> {}

  /**
   * parser's object type on success
   */
  export interface SuccessObjType<S> {
    flags: {};
    value: S;
  }

  /**
   * Parse result class (like either)
   *
   * @param S parsed value type
   */
  export interface ParseResult<T> {
    /**
     * check this result is success
     *
     * @returns is this success
     */
    isSuccess(): boolean;
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
  ConfigParserMonadPlus<T, U> {
    /**
     * build a or parser of this
     *
     * @param parser second parser
     * @returns a or parser of this parser and arg parser
     */
    or(parser: ConfigParser<T, U>): ConfigParser<T, U>;
    /**
     * build a and parser of this
     *
     * @param parser second parser
     * @returns a and parser of this parser and arg parser
     */
    and<R>(parser: ConfigParser<U, R>): ConfigParser<T, R>;
    /**
     * build a map parser of this
     *
     * @param fn map function
     * @param fn.obj target converted object
     * @returns a map parser of this with arg function
     */
    map<R>(fn: (obj: U) => R): ConfigParser<T, R>;
    /**
     * build a map parser of this for deep developer
     *
     * @param fn map function
     * @param fn.obj target converted success inner object
     * @returns a map parser of this with arg function
     */
    innerMap<R>(fn: (obj: SuccessObjType<U>) => SuccessObjType<R>): ConfigParser<T, R>;
    /**
     * build a description parser of this
     *
     * @param msg description
     * @param exp expected type
     * @returns a description parser of this
     */
    desc(msg: string, exp?: string): ConfigParser<T, U>;
    /**
     * build a description parser of this from only expected
     *
     * @param exp expected type or types
     * @returns a description parser of this from expected
     */
    descFromExpected(exp: (string | string[])): ConfigParser<T, U>;
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
    then(onSuccess: (obj: U) => any, onFail?: (msg: string, exp?: string, act?: string) => any): ConfigParser<T, U>;
    /**
     * build a catch parser of this
     *
     * @param onFail receiver on fail
     * @param onFail.msg receive message
     * @param onFail.exp expected type
     * @param onFail.act actual type
     * @returns a catch parser of this
     */
    catch(onFail: (msg: string, exp?: string, act?: string) => any): ConfigParser<T, U>;
    /**
     * build a default parser of this
     *
     * @param def default value
     * @returns this parsed value on success and default value on fail
     */
    default(def: U): ConfigParser<T, U>;
    /**
     * build a optional parser of this
     *
     * @param def default value
     * @returns this parsed value on success and default value on fail and this value is nothing
     */
    option(def: U): ConfigParser<Object, U>;
    /**
     * build a seq parser
     *
     * @param parser second parser
     * @returns a parser returns two length array from first and second parsed value
     */
    seq2<R>(parser: ConfigParser<T, R>): ConfigParser<T, [U, R]>;
    /**
     * parse object and return parsed value on success and throw error on fail
     *
     * @param obj target object
     * @returns parsed value
     * @throws ConfigParseError failed to parse
     */
    parse(obj: T): U;
    /**
     * parse object and return parsed value with parse status
     *
     * @param obj target object
     * @returns status false on fail and parsed value with status true on success
     */
    parseWithStatus(obj: T): {
      status: boolean;
      value?: U;
    };
    /**
     * parse object and return parsed value and report failure on fail
     *
     * @param obj target object
     * @param reporter reporter function
     * @returns parsed value
     * @throws ConfigParseError failed to parse error
     */
    parseWithReporter(obj: T, reporter?: ReporterType): U;
    /**
     * Fantasy area
     */
    mempty: ConfigParser<T, U>;
    empty: ConfigParser<T, U>;
    mappend: (parser: ConfigParser<T, U>) => ConfigParser<T, U>;
    append: (parser: ConfigParser<T, U>) => ConfigParser<T, U>;
    mconcat(ps: ConfigParser<T, U>[]): ConfigParser<T, U>;
    concat: (ps: ConfigParser<T, U>[]) => ConfigParser<T, U>;
    fmap: <R>(fn: (obj: U) => R) => ConfigParser<T, R>;
    lift: <R>(fn: (obj: U) => R) => ConfigParser<T, R>;
    of<R>(val: R): ConfigParser<U, R>;
    unit: <R>(val: R) => ConfigParser<U, R>;
    ap<R>(u: ConfigParser<T, (t: U) => R>): ConfigParser<T, R>;
    bind<R>(f: (t: U) => ConfigParser<T, R>): ConfigParser<T, R>;
    chain: <R>(f: (t: U) => ConfigParser<T, R>) => ConfigParser<T, R>;
    mzero: ConfigParser<T, U>;
    zero: ConfigParser<T, U>;
    mplus: (parser: ConfigParser<T, U>) => ConfigParser<T, U>;
    plus: (parser: ConfigParser<T, U>) => ConfigParser<T, U>;
  }
  /** a parser of base of base for chain root */
  export const base: ConfigParser<Object, Object>;
  /**
   * build a success parser with value
   *
   * @param val success value
   * @returns a parser with success and given value
   */
  export function succeed<T>(val: T): ConfigParser<any, T>;
  /**
   * build a fail parser with fail info
   *
   * @param msg failure message
   * @param expected expected type
   * @returns a parser with fail and fail info
   */
  export function fail<T>(msg?: string, expected?: string): ConfigParser<any, T>;
  /** a type parser for boolean type */
  export const boolean: ConfigParser<Object, boolean>;
  /** a type parser for number type */
  export const number: ConfigParser<Object, number>;
  /** a type parser for string type */
  export const string: ConfigParser<Object, string>;
  /** a type parser for object type */
  export const object: ConfigParser<Object, Object>;
  /**
   * build a type parser for array type
   *
   * @param parser for element parsed
   * @returns a type parser for array type with custom type parser
   */
  export function array<T>(parser: ConfigParser<Object, T>): ConfigParser<Object, T[]>;
  /**
   * build a type parser for specify object type
   *
   * @param props property and custom parser list
   * @returns a type parser for specify object type with custom type parser
   */
  export function hasProperties<T>(props: [string, ConfigParser<any, any>][]): ConfigParser<Object, T>;
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
    onSuccess: (obj: U) => ParseResult<U>, onFailure: (msg?: string, exp?: string, act?: string) => ParseResult<U>
  ) => (obj: T) => ParseResult<U>): ConfigParser<T, U>;
  /**
   * parse son file with object parser
   *
   * @param fname target son file name
   * @param parser custom parser using to parse
   * @returns result of parsed
   */
  export function parseFile<T>(fname: string, parser: ConfigParser<Object, T>): T;
  /**
   * parse son file using object parser with status
   *
   * @param fname target son file name
   * @param parser custom parser using to parse
   * @returns result of parsed with status
   */
  export function parseFileWithStatus<T>(fname: string, parser: ConfigParser<Object, T>): {
    status: boolean;
    value?: T;
  };
  /**
   * reporter type
   *
   * @param ReporterType.msg failure message
   * @param ReporterType.exp expected type
   * @param ReporterType.act actual object
   * @param ReporterType.childs nodes of error
   */
  export type ReporterType = (msg: string, exp?: string, act?: string, childs?: any[]) => void;
  /**
   * any reporters
   */
  export const Reporters: {
    nestReporter: (logFunc: (msg: string) => any, depth?: number) => ReporterType;
    listReporter: (logFunc: (msg: string) => any, depth?: number) => ReporterType;
    jsonReporter: {
      (logFunc: (msg: string) => any, flags?: {
        isOneLine?: boolean;
      }, depth?: number): ReporterType;
      (logFunc: (msg: string) => any, depth?: number): ReporterType;
    };
  };
}
