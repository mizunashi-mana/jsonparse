# List of type parsers

There are many type parsers you can use.

## base parser

This parser is as chain root.

All objects pass through.

## boolean parser

This parser checks that the type of target object is `boolean`.

## number parser

This parser checks that the type of target object is `number`.

## string parser

This parser checks that the type of target object is `string`.

## object parser

This parser checks that the type of target object is `object`.

In this library, `array` is not included `object`. So, this parser will throw Error.  

## array parser

This parser checks the type of target object is `array` and convert each elements as element type using receive parser for elements.

# List of base parsers

There are some base parsers you can use.

## or parser

This parser tries first parser, and if it fails uses second parser.

## and parser

This parser tries first parser, and the result of first parser parses using second parser.


## map parser

This parser transforms the output of parser with the given function.

# List of extra parsers

There are some extra parsers you can use.

## custom parser

This parser can customize with parse function.

## hasProperties parser

This parser checks that `object` type target has specify properties and convert each properties using receive parsers.
