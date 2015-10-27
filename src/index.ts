import {
  BaseCustomError
} from "./lib/customerror/node-customerror";

import {
  parseSONFileSync
} from "./lib/util/node-util";

import {
  Parser,
  MapperParseResult,
} from "./common";

import {
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
} from "./parseresult/result";

import {
  ParseErrorNode,
  ParseErrorStocker,
} from "./parseresult/parseerr";

import {
  nestReporter,
  listReporter,
  jsonReporter,
} from "./reporter/node-reporters";

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

/**
 * ConfigParser class including some helper methods
 *
 * @param T in object type
 * @param U out object type
 */
export class ConfigParser<T, U> {
  /**
   * ConfigParser have parser object
   *
   * ConfigParser is a wrapper class of Parser class
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
   * @returns status false on fail and parsed value with status true on success
   */
  parseWithStatus(obj: T): {
    status: boolean;
    value?: U
  } {
    const res = this.parser.parse({
      value: obj,
      flags: {
        isReport: false,
      },
    });
    return {
      status: res.isSuccess(),
      value: res.valueSuccess({
        value: undefined,
        flags: undefined,
      }).value,
    };
  }

  /**
   * parse object and return parsed value and report failure on fail
   *
   * @param obj target object
   * @param reporter reporter function
   * @returns parsed value
   * @throws ConfigParseError failed to parse error
   */
  parseWithReporter(
    obj: T,
    reporter?: ReporterType
  ): U {
    const reporterF = typeof reporter === "undefined" ? nestReporter(console.log) : reporter;
    const res = this.parser.parse({
      value: obj,
      flags: {
        isReport: true,
      },
    });
    if (res.isSuccess()) {
      return res.valueSuccess(undefined).value;
    } else {
      res.valueFailure(undefined).value.report((msg, exp, act, childs) => {
        reporterF(msg, exp, act, childs);
        throw new ConfigParseError(msg);
      });
    }
  }

}

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
export const base = new ConfigParser(customParser<Object, Object>((obj) => obj));

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
export function parseFileWithStatus<T>(fname: string, parser: ConfigParser<Object, T>): {
  status: boolean;
  value?: T
} {
  try {
    const obj = parseSONFileSync(fname);
    return parser.parseWithStatus(obj);
  } catch (e) {
    return {
      status: false,
    };
  }
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
export const Reporters = {
  /** a reporter with nested show */
  nestReporter,
  /** a reporter with listed show */
  listReporter,
  /** a reporter with json show */
  jsonReporter,
  ParseErrorStocker,
};
