import {
  BaseCustomError
} from "./lib/customerror/node-customerror";

import {
  Parser,
  mkSType,
  mkFType,
  ParseFunc,
} from "./common";

import {
  orParser,
  andParser,
  mapParser,
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
} from "./parsers/basetypes";

import {
  hasPropertiesObj,
} from "./parsers/objparsers";

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
    return new ConfigParser(mapParser(fn, this.parser));
  }

  desc(msg: string) {
    return new ConfigParser(descParser(descBuilder(msg), this.parser));
  }

  get parser(): Parser<T, U> {
    return this.innerParser;
  }

  parse(obj: T): U {
    const res = this.parser.parse(obj);
    if (res.isSuccess()) {
      return res.value(undefined);
    } else {
      throw new ConfigParseError("Illegal config!");
    }
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

export function hasProperties(
  props: [string, ConfigParser<any, any>][]
) {
  return new ConfigParser(andParser(
    isObject(),
    hasPropertiesObj(
      props.map((e) => <[string, Parser<any, any>]>[e[0], e[1].parser])
    )
  ));
}

export function custom<T, U>(fn: (
  onSuccess: mkSType<T>,
  onFailure: mkFType<T>
) => ParseFunc<T, U>) {
  return new ConfigParser(customParser(fn));
}
