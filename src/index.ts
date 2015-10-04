export {
  Parser,
  Parser as default,
} from "./common";

export {
  orParser as or,
  successParser as success,
  failParser as fail,
  customParser as custom,
} from "./parsers/baseparsers";

export {
  isBoolean,
  isNumber,
  isString,
  isObject,
  isArray,
} from "./parsers/basetypes";

export {
  hasPropertiesObj,
} from "./parsers/objparsers";
