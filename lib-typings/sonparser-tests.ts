/// <reference path="sonparser.d.ts" />

import * as sparse from "sonparser";
import * as events from "events";

var bool: boolean;
var num: number;
var str: string;
var strarr: string[];
var metadata: any;
var obj: Object = {};
var emitter: events.EventEmitter = new events.EventEmitter();
var err: Error = new Error();

interface objT { a: string; }

type ConfigParser<T, U> = sparse.ConfigParser<T, U>;

var baseParser: ConfigParser<Object, Object> = sparse.base;
var booleanParser: ConfigParser<Object, boolean> = sparse.boolean;
var numberParser: ConfigParser<Object, number> = sparse.number;
var stringParser: ConfigParser<Object, string> = sparse.string;
var objectParser: ConfigParser<Object, Object> = sparse.object;

var arrayParser: ConfigParser<Object, number[]> = sparse.array(numberParser);
var arrayParser2: ConfigParser<Object, number[][]> = sparse.array(sparse.array(numberParser));

var propertiesParser: ConfigParser<Object, objT> = sparse.hasProperties<objT>([
  [str, stringParser],
  [str, numberParser],
]);

var tuple1Parser: ConfigParser<Object, [boolean]> = sparse.tuple1(booleanParser);
var tuple2Parser: ConfigParser<Object, [boolean, string]> = sparse.tuple2(booleanParser, stringParser);
var tuple3Parser: ConfigParser<Object, [boolean, string, number]> = sparse.tuple3(booleanParser, stringParser, numberParser);
var tuple4Parser: ConfigParser<Object, [boolean, string, number, number[]]> = sparse.tuple4(booleanParser, stringParser, numberParser, arrayParser);
var tuple5Parser: ConfigParser<Object, [boolean, string, number, number[], objT]> = sparse.tuple5(booleanParser, stringParser, numberParser, arrayParser, propertiesParser);

var customParser: ConfigParser<number, string> = sparse.custom<number, string>(
  (success, failure) => (o) => o == num ? success(str) : failure(str, str, str)
);

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

// Monoid
var FmemptyParser: ConfigParser<Object, boolean> = booleanParser.mempty;
var FemptyParser: ConfigParser<Object, boolean> = booleanParser.empty;
var FmappendParser: ConfigParser<Object, boolean> = booleanParser.mappend(booleanParser);
var FappendParser: ConfigParser<Object, boolean> = booleanParser.append(booleanParser);
var FmconcatParser: ConfigParser<Object, boolean> = booleanParser.mconcat([booleanParser, booleanParser]);
var FconcatParser: ConfigParser<Object, boolean> = booleanParser.concat([booleanParser, booleanParser]);

// Functor
var FfmapParser: ConfigParser<Object, string> = booleanParser.fmap((o) => str);
var FliftParser: ConfigParser<Object, string> = booleanParser.lift((o) => str);
var FmapParser: ConfigParser<Object, string> = booleanParser.map((o) => str);

// Applicative
var FofParser: ConfigParser<boolean, string> = booleanParser.of(str);
var FunitParser: ConfigParser<boolean, string> = booleanParser.unit(str);
var FapParser: ConfigParser<Object, string> = booleanParser.ap(booleanParser.of((o: boolean) => str));

// Monad
var FofParserMonad: ConfigParser<boolean, string> = booleanParser.of(str);
var FunitParserMonad: ConfigParser<boolean, string> = booleanParser.unit(str);
var FbindParser: ConfigParser<Object, string> = numberParser.bind((n) => customParser);
var FchainParser: ConfigParser<Object, string> = numberParser.chain((n) => customParser);

// MonadPlus
var FmzeroParser: ConfigParser<Object, boolean> = booleanParser.mzero;
var FzeroParser: ConfigParser<Object, boolean> = booleanParser.zero;
var FmplusParser: ConfigParser<Object, boolean> = booleanParser.mplus(booleanParser);
var FplusParser: ConfigParser<Object, boolean> = booleanParser.plus(booleanParser);

var nestReporter: sparse.ReporterType = sparse.reporters.nestReporter(console.log, num);
var listReporter: sparse.ReporterType = sparse.reporters.listReporter(console.log, num);
var jsonReporter: sparse.ReporterType = sparse.reporters.jsonReporter(console.log, num);
var jsonReporter2: sparse.ReporterType = sparse.reporters.jsonReporter(console.log, {isOneLine: bool}, num);
var customReporter: sparse.ReporterType = sparse.reporters.customReporter(() => {}, emitter);

var methodParse: boolean = booleanParser.parse(obj);
var methodParseWithResult: sparse.ConfigParserResult<boolean> = booleanParser.parseWithResult(obj);
bool = methodParseWithResult.isSuccess();
bool = methodParseWithResult.status;
bool = methodParseWithResult.except(str);
bool = methodParseWithResult.ok;
bool = methodParseWithResult.toSuccess(bool);
err = methodParseWithResult.toError(err);
var resultPromise: Promise<boolean> = methodParseWithResult.toPromise();
methodParseWithResult = methodParseWithResult.report(nestReporter);
var methodParseAsync: Promise<boolean> = booleanParser.parseAsync(obj);

var funcParseFile: boolean = sparse.parseFile(str, booleanParser);
var funcParseFileWithResult: sparse.ConfigParserResult<boolean> = sparse.parseFileWithResult(str, booleanParser);
var funcParseAsync: Promise<boolean> = sparse.parseFileAsync(str, booleanParser);
