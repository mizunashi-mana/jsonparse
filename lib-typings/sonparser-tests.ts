/// <reference path="sonparser.d.ts" />

import * as sparse from "sonparser";

var bool: boolean;
var num: number;
var str: string;
var strarr: string[];
var metadata: any;
var obj: Object = {};

interface objT { a: string; }

type ConfigParser<T, U> = sparse.ConfigParser<T, U>;

var baseParser: ConfigParser<Object, Object> = sparse.base;
var booleanParser: ConfigParser<Object, boolean> = sparse.boolean;
var numberParser: ConfigParser<Object, number> = sparse.number;
var stringParser: ConfigParser<Object, string> = sparse.string;
var baseParser: ConfigParser<Object, Object> = sparse.object;

var arrayParser: ConfigParser<Object, number[]> = sparse.array(numberParser);
var arrayParser2: ConfigParser<Object, number[][]> = sparse.array(sparse.array(numberParser));

var customParser: ConfigParser<number, string> = sparse.custom<number, string>(
  (success, failure) => (o: number) => o == num ? success(str) : failure(str, str)
);

var propertiesParser: ConfigParser<Object, objT> = sparse.hasProperties<objT>([
  [str, stringParser],
  [str, numberParser],
]);

var failParser: ConfigParser<string, number> = sparse.fail<number>(str, str);
var succeedParser: ConfigParser<string, number> = sparse.succeed(num);

var andParser: ConfigParser<Object, string> = numberParser.and(customParser);
var orParser: ConfigParser<Object, string> = stringParser.or(stringParser);
var mapParser: ConfigParser<Object, string> = numberParser.map((n) => str);
var defaultParser: ConfigParser<Object, boolean> = booleanParser.default(true);
var optionParser: ConfigParser<Object, boolean> = booleanParser.option(true);
var descParser: ConfigParser<Object, boolean> = booleanParser.desc(str, str);
var descFromExpectedParser: ConfigParser<Object, boolean> = booleanParser.descFromExpected(str);
var descFromExpectedParser2: ConfigParser<Object, boolean> = booleanParser.descFromExpected(strarr);
var thenParser: ConfigParser<Object, boolean> = booleanParser.then((o: boolean) => {}, (m: string, e: string, a: string) => {});
var catchParser: ConfigParser<Object, boolean> = booleanParser.catch((m: string, e: string, a: string) => {});

var seq2Parser: ConfigParser<Object, [boolean, string]> = booleanParser.seq2(stringParser);
var innerMapParser: ConfigParser<Object, string> = booleanParser.innerMap((obj) => {flags: obj.flags, value: str});
