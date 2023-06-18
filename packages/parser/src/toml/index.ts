import {
  Parser,
  seq,
  tag,
  opt,
  newline,
  alt,
  space0,
  eof,
  delimited,
  isSpace,
  isHexDigit,
  take1,
  more0,
  more1,
  isDigit19,
  isDigit,
  takeX,
  regex,
  space,
  repeat,
  map,
  value,
  mapRes,
} from "../repas";
import {
  isAllowedCommentChar,
  isUnquotedKeyChar,
  isLiteralChar,
  isDigit07,
  isDigit01,
  basicChar,
  literalChar,
} from "./char";
import { DateTime, TomlArray, TomlValue, TomlInlineTable } from "./types";

const questionMark = tag('"');
const apostrophe = tag("'");
const minus = tag("-");
const plus = tag("+");
const underscore = tag("_");
const hexPrefix = tag("0x");
const octPrefix = tag("0o");
const binPrefix = tag("0b");
const e = tag("e");
const inf = tag("inf");
const nan = tag("nan");
const decimalPoint = tag(".");
const colon = tag(":");
const hyphen = tag("-");
const arrayOpen = tag("[");
const arrayClose = tag("]");
const comma = tag(",");
const inlineTableOpen = tag("{");
const inlineTableClose = tag("}");
const equal = tag("=");
const stdTableOpen = regex(/^\[[\t ]*/);
const stdTableClose = regex(/^\[\t ]*]/);
const arrayTableOpen = regex(/^\[\[[\t ]*/);
const arrayTableClose = regex(/^[\t ]*\]\]/);
const mlBasicStringDelim = tag('"""');
const escape = tag("\\");
const mlLiteralStringDelim = tag("'''");

type StringArray = (StringArray | string)[];
const stringArrayToString = (array: StringArray): string =>
  array
    .map((item) => (Array.isArray(item) ? stringArrayToString(item) : item))
    .join("");

// Basic string
const basicString = map(
  delimited(questionMark, more0(basicChar), questionMark),
  (chars) => chars.join("")
);

// Comment
const comment = seq(
  tag("#"),
  more0((c) => isAllowedCommentChar(c)),
  alt(newline, eof)
);
const wsCommentNewline = more0(alt(take1(isSpace), seq(comment, newline)));

// Literal string
const literalString = delimited(apostrophe, more0(isLiteralChar), apostrophe);

// Quoted and dotted key
const unquotedKey = more1(isUnquotedKeyChar);
const quotedKey = alt(basicString, literalString);

const simpleKey = alt(quotedKey, unquotedKey);

const dotSep = map(seq(space0, tag("."), space0), (value) => value[1]);
const dottedKey = map(seq(simpleKey, more1(seq(dotSep, simpleKey))), (value) =>
  stringArrayToString(value)
);

// Multiline Basic String
const mlbEscapedNl = map(
  seq(escape, space0, newline, more0(alt(space, newline))),
  () => ""
);
const mlbContent = alt(basicChar, newline, mlbEscapedNl);
const mlbQuotes = repeat(questionMark, 1, 2);

const mlBasicBody = map(
  seq(more0(mlbContent), more0(seq(mlbQuotes, more1(mlbContent)))),
  (value) => stringArrayToString(value)
);
const mlBasicStringCloseDelim = map(
  repeat((char: string) => char === '"', 3, 5),
  (value: string) => value.slice(3)
);
const mlBasicString = map(
  seq(mlBasicStringDelim, opt(newline), mlBasicBody, mlBasicStringCloseDelim),
  ([, , body, closeDelim]) => body + closeDelim
);

// Multiline Literal String
const mllQuotes = repeat(apostrophe, 1, 2);
const mllContent = alt(literalChar, newline);
const mllLiteralBody = map(
  seq(more0(mllContent), opt(seq(mllQuotes, more1(mllContent)))),
  (value) => stringArrayToString(value)
);
const mlLiteralStringCloseDelim = map(
  repeat((char: string) => char === "'", 3, 5),
  (value: string) => value.slice(3)
);
const mlLiteralString = map(
  seq(
    mlLiteralStringDelim,
    opt(newline),
    mllLiteralBody,
    mlLiteralStringCloseDelim
  ),
  ([, , body, closeDelim]) => body + closeDelim
);

// String
const string = alt(mlBasicString, mlLiteralString, basicString, literalString);

// Key-Value pairs
const keyvalSep = delimited(space0, equal, space0);
const key = alt(simpleKey, dottedKey);
const keyval = map(seq(key, keyvalSep, val), ([key, , value]) => [
  key,
  value,
]) as Parser<[string, TomlValue]>;

// Boolean
const boolean = map(alt(tag("true"), tag("false")), (str) => str === "true");

// Integer
const unsignedDecInt = alt(
  seq(
    take1(isDigit19),
    more1(alt(take1(isDigit), seq(underscore, take1(isDigit))))
  ),
  more1(isHexDigit)
);
const decInt = map(seq(opt(alt(plus, minus)), unsignedDecInt), (value) =>
  parseInt(stringArrayToString(value), 10)
);

const hexInt = map(
  seq(
    hexPrefix,
    take1(isHexDigit),
    more1(alt(take1(isHexDigit), seq(underscore, take1(isHexDigit))))
  ),
  (value) => parseInt(stringArrayToString(value), 16)
);
const octInt = map(
  seq(
    octPrefix,
    take1(isDigit07),
    more1(alt(take1(isDigit07), seq(underscore, take1(isDigit07))))
  ),
  (value) => parseInt(stringArrayToString(value), 8)
);
const binInt = map(
  seq(
    binPrefix,
    take1(isDigit01),
    more1(alt(take1(isDigit01), seq(underscore, take1(isDigit01))))
  ),
  (value) => parseInt(stringArrayToString(value), 2)
);
const integer = alt(hexInt, octInt, binInt, decInt);

// Float
const floatIntPart = decInt;
const zeroPrefixableInt = seq(
  take1(isDigit),
  more0(alt(take1(isDigit), seq(value(underscore, ""), take1(isDigit))))
);
const floatExpPart = seq(opt(alt(plus, minus)), unsignedDecInt);
const exp = seq(e, floatExpPart);
const frac = seq(decimalPoint, zeroPrefixableInt);

const floatMap = {
  inf: Infinity,
  "+inf": Infinity,
  "-inf": -Infinity,
  nan: NaN,
  "+nan": NaN,
  "-nan": NaN,
};
const specialFloat = map(
  seq(opt(alt(plus, minus)), alt(inf, nan)),
  (value): number => {
    const str = stringArrayToString(value);
    return floatMap[str];
  }
);

const float = alt(
  specialFloat,
  map(seq(floatIntPart, alt(exp, seq(frac, opt(exp)))), ([int, decimal]) =>
    parseFloat(stringArrayToString([int.toString(), decimal]))
  )
);

// Date
const dateFullYear = takeX(isDigit, 4);
const dateMonth = takeX(isDigit, 2);
const dateMDay = takeX(isDigit, 2);
const timeDelim = take1(
  (char) => char === "t" || char === "T" || isSpace(char)
);
const timeHour = takeX(isDigit, 2);
const timeMinute = takeX(isDigit, 2);
const timeSecond = takeX(isDigit, 2);
const timeSecFrac = seq(decimalPoint, more1(isDigit));
const timeNumOffset = seq(
  take1((char) => char === "+" || char === "-"),
  timeHour,
  colon,
  timeMinute
);
const timeOffset = alt(timeNumOffset, tag("Z"));
const partialTime = seq(
  timeHour,
  colon,
  timeMinute,
  opt(seq(colon, timeSecond, opt(timeSecFrac)))
);
const fullDate = seq(dateFullYear, hyphen, dateMonth, hyphen, dateMDay);
const fullTime = seq(partialTime, timeOffset);
const fullDateTime = map(seq(fullDate, timeDelim, fullTime), (value) => ({
  type: "datetime",
  value: stringArrayToString(value),
}));
const localDateTime = map(seq(fullDate, timeDelim, partialTime), (value) => ({
  type: "datetime-local",
  value: stringArrayToString(value),
}));
const localDate = map(fullDate, (value) => ({
  type: "date-local",
  value: stringArrayToString(value),
}));
const localTime = map(partialTime, (value) => ({
  type: "time-local",
  value: stringArrayToString(value),
}));
const dateTime = alt(
  fullDateTime,
  localDateTime,
  localDate,
  localTime
) as Parser<DateTime>;

// Array
const arrayValue = seq(wsCommentNewline, val, wsCommentNewline);
const arrayValues = map(
  seq(
    map(
      seq(arrayValue, more0(map(seq(comma, arrayValue), ([, value]) => value))),
      ([value, values]) => [value, ...values]
    ),
    opt(comma)
  ),
  (value) => value[0]
);
const array = map(
  seq(arrayOpen, opt(arrayValues), wsCommentNewline, arrayClose),
  (value) => value[0] || []
) as Parser<TomlArray>;

// Standard Table
const stdTable = seq(stdTableOpen, key, stdTableClose);

// Inline Table
const inlineTableKeyval = map(
  seq(wsCommentNewline, keyval, wsCommentNewline),
  (value) => value[1]
);
const inlineTableKeyvals = map(
  seq(
    seq(
      inlineTableKeyval,
      more0(map(seq(comma, inlineTableKeyval), (value) => value[1]))
    ),
    opt(comma)
  ),
  ([[value, values]]) => [value, ...values]
);

const setTable = (table: TomlInlineTable, key: string, value: TomlValue) => {
  const paths = key.split(".");
  const cur = table;
  const len = paths.length;
  paths.forEach((path, index) => {
    if (index === len - 1) {
      cur[path] = value;
    } else if (path in cur) {
    }
  });
};

const inlineTable = mapRes(
  seq(
    inlineTableOpen,
    opt(inlineTableKeyvals),
    wsCommentNewline,
    inlineTableClose
  ),
  (result) => {
    if (result.ok) {
      const [, keyvals] = result.value;
      const table: TomlInlineTable = {};
      for (const [key, value] of keyvals) {
        const paths = key.split(".");
        const len = paths.length;
        let cur = table;
        for (let i = 0; i < len; i++) {
          const path = paths[i];
          if (i === len - 1) {
            cur[path] = value;
          } else if (path in cur) {
            // TODO: duplicate key
            cur = cur[path] as TomlInlineTable;
          } else {
            cur[path] = {};
            cur = cur[path] as TomlInlineTable;
          }
        }
        table[key] = value;
      }
      return { ...result, value: table };
    }
    return result;
  }
);

// Array Table
const arrayTable = seq(arrayTableOpen, key, arrayTableClose);

// Table
const table = alt(stdTable, arrayTable);

function val(input: string) {
  return alt(
    string,
    boolean,
    array,
    inlineTable,
    dateTime,
    float,
    integer
  )(input);
}

const expression = alt(
  seq(space0, opt(comment)),
  seq(space0, keyval, space0, opt(comment)),
  seq(space0, table, space0, opt(comment))
);

export const toml = seq(expression, more0(expression));
