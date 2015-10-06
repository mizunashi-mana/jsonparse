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

function buildConfigParserF<T, U>(pf: () => Parser<T, U>) {
  return new ConfigParser<T, U>(pf());
}

export function buildParserBase() {
  return new ConfigParser(
    customParser<Object, Object>((obj) => obj)
  );
}

export function boolean() {
  return buildConfigParserF(isBoolean);
}

export function number() {
  return buildConfigParserF(isNumber);
}

export function string() {
  return buildConfigParserF(isString);
}

export function array<T>(parser: ConfigParser<Object, T>) {
  return new ConfigParser(isArray(parser.parser));
}

export function object() {
  return buildConfigParserF(isObject);
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
      throw new Error("Illegal config!");
    }
  }
}
