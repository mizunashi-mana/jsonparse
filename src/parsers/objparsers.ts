import {
  Parser,
  ParseResult,
  makeSuccess,
  makeFailure,
  isSuccess,
} from "../common";

export function hasPropertiesObj<T>(
  props: [string, Parser<any, any>][]
) {
  return new Parser<{[key: string]: any}, T>((obj) => {
    const result: {[key: string]: any} = {};
    const fails: ParseResult<any>[] = [];
    props.forEach((prop) => {
      const pres = prop[1].parse(obj[prop[0]]);
      if (isSuccess(pres)) {
        result[prop[0]] = pres.value;
      } else {
        fails.push(pres);
      }
    });
    if (fails.length == 0) {
      return makeSuccess(<T>result);
    } else {
      return makeFailure(<T>{});
    }
  });
}
