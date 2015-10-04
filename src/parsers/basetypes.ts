import {
  Parser,
  makeSuccess,
  makeFailure,
  isSuccess,
} from "../common";

export class TypeParser<T> extends Parser<Object, T> {}

export function isNumber() {
  return new TypeParser<number>((obj) => {
    if (typeof obj === "number") {
      return makeSuccess(obj);
    } else {
      return makeFailure(0);
    }
  });
}

export function isString() {
  return new TypeParser<string>((obj) => {
    if (typeof obj === "string") {
      return makeSuccess(obj);
    } else {
      return makeFailure("str");
    }
  });
}

export function isBoolean() {
  return new TypeParser<boolean>((obj) => {
    if (typeof obj === "boolean") {
      return makeSuccess(obj);
    } else {
      return makeFailure(true);
    }
  });
}

export function isArray<T>(parser: TypeParser<T>) {
  const expectValue = [getDefaultValue(parser)];

  return new TypeParser<T[]>((obj) => {
    if (obj instanceof Array) {
      const results = obj.map((e) => parser.parse(e));
      const failures = results.filter((e) => isSuccess(e));
      if (failures.length == 0) {
        return makeSuccess(results.map((e) => e.value));
      } else {
        return makeFailure(expectValue);
      }
    } else {
      return makeFailure(expectValue);
    }
  });
}

export function isObject() {
  return new TypeParser<Object>((obj) => {
    if (typeof obj === "object"
     && !(obj instanceof Array)) {
      return makeSuccess(obj);
    } else {
      return makeFailure({});
    }
  });
}

export function getDefaultValue<T>(parser: TypeParser<T>): T {
  const result = parser.parse(undefined);
  if (result.status) {
    return result.value;
  } else {
    return result.expected;
  }
}
