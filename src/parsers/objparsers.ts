import {
  Parser,
} from "../common";

import {ParseResult} from "../parseresult/result";

export function hasPropertiesObj<T>(
  props: [string, Parser<any, any>][]
) {
  return new Parser<{[key: string]: any}, T>((obj) => {
    const probjconcat = ParseResult.bind2((
      a: {[key: string]: any},
      b: [string, any]
    ) => {
      return ParseResult.success(a[b[0]] = b[1]);
    });
    const result = props
      .map((prop) => {
        return prop[1]
          .parse(obj[prop[0]])
          .chain((e) => ParseResult.success(<[string, any]>[prop[0], e]));
      })
      .reduce(probjconcat, <{[key: string]: any}>{});
    return <ParseResult<T>>result;
  });
}
