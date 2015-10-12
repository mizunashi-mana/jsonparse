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
  andParser,
  mapParser,
  receiveParser,
  thenCatchParser,
  catchParser,
  customParser,
  descBuilder,
  descParser,
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

export class ConfigParseError extends BaseCustomError {
  constructor(msg: string) {
    super(msg);
  }
}

export class ConfigParser<T, U> {
  private innerParser: Parser<T, U>;

  constructor(p: Parser<T, U>) {
    this.innerParser = p;
  }

  or(parser: ConfigParser<T, U>) {
    return new ConfigParser(orParser(
      this.parser,
      parser.parser
    ));
  }

  and<R>(parser: ConfigParser<U, R>) {
    return new ConfigParser(andParser(
      this.parser,
      parser.parser
    ));
  }

  map<R>(fn: (obj: U) => R) {
    return new ConfigParser(mapParser(
      (innerObj) => <SuccessObjType<R>>{
        value: fn(innerObj.value),
        flags: innerObj.flags,
      },
      this.parser
    ));
  }

  innerMap<R>(fn: (obj: SuccessObjType<U>) => SuccessObjType<R>) {
    return new ConfigParser(mapParser(fn, this.parser));
  }

  desc(msg: string, exp?: string) {
    return new ConfigParser(descParser(descBuilder(msg, exp), this.parser));
  }

  then(
    onSuccess: (obj: U) => any,
    onFail?: (msg: string, exp?: string) => any
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

  catch(onFail: () => any) {
    return new ConfigParser(thenCatchParser(onFail, this.parser));
  }

  default(def: U) {
    return new ConfigParser(catchParser(
      (obj) => ({
        value: def,
        flags: obj.flags,
      }),
      this.parser
    ));
  }

  option(def: U) {
    return this.or(new ConfigParser<T, U>(isNothing(def)));
  }

  get parser(): Parser<T, U> {
    return this.innerParser;
  }

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
      throw new ConfigParseError("Illegal config!");
    }
  }

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

}

function buildConfigParserF<T, U>(pf: () => Parser<T, U>) {
  return new ConfigParser<T, U>(pf());
}

export const base = new ConfigParser(customParser<Object, Object>((obj) => obj));

export const boolean = buildConfigParserF(isBoolean);
export const number = buildConfigParserF(isNumber);
export const string = buildConfigParserF(isString);
export const object = buildConfigParserF(isObject);

export function array<T>(parser: ConfigParser<Object, T>) {
  return new ConfigParser(isArray(parser.parser));
}

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

export function custom<T, U>(fn: (
  onSuccess: (obj: U) => ParseResult<U>,
  onFailure: (msg: string, exp?: string) => ParseResult<U>
) => MapperParseResult<T, U>) {
  return new ConfigParser(customParser(fn));
}

export function parseFile<T>(fname: string, parser: ConfigParser<Object, T>): T {
  const obj = parseSONFileSync(fname);
  return parser.parse(obj);
}

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
