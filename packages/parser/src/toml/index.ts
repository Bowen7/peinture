import {
  seq,
  tag,
  opt,
  newline,
  alt,
  space0,
  peek,
  eof,
  msg,
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
} from "../repas";
import {
  isAllowedCommentChar,
  isUnquotedKeyChar,
  isLiteralChar,
  isDigit07,
  isDigit01,
  basicChar,
} from "./char";

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

// Basic string
const basicString = delimited(questionMark, more0(basicChar), questionMark);

// Comment
const comment = seq(
  tag("#"),
  more0((c) => isAllowedCommentChar(c)),
  msg(peek(alt(newline, eof)), "expect end of line")
);
const wsCommentNewline = more0(alt(take1(isSpace), seq(comment, newline)));

// Literal string
const literalString = delimited(apostrophe, more0(isLiteralChar), apostrophe);

// Quoted and dotted key
const unquotedKey = more1(isUnquotedKeyChar);
const quotedKey = alt(basicString, literalString);

const simpleKey = alt(quotedKey, unquotedKey);

const dotSep = seq(space0, tag("."), space0);
const dottedKey = seq(simpleKey, more1(seq(dotSep, simpleKey)));

// Multiline Basic String
const mlbEscapedNl = seq(escape, space0, newline, more0(alt(space, newline)));
const mlbContent = alt(basicChar, newline, mlbEscapedNl);
const mlbEscapedNl = repeat(questionMark, 1, 2);

// Key-Value pairs
const keyvalSep = delimited(space0, equal, space0);
const key = alt(simpleKey, dottedKey);
const keyval = seq(key, keyvalSep, val);

// Boolean
const boolean = alt(tag("true"), tag("false"));

// Integer
const unsignedDecInt = alt(
  seq(
    take1(isDigit19),
    more1(alt(take1(isDigit), seq(underscore, take1(isDigit))))
  ),
  more1(isHexDigit)
);
const decInt = seq(opt(alt(plus, minus)), unsignedDecInt);

const hexInt = seq(
  hexPrefix,
  take1(isHexDigit),
  more1(alt(take1(isHexDigit), seq(underscore, take1(isHexDigit))))
);
const octInt = seq(
  octPrefix,
  take1(isDigit07),
  more1(alt(take1(isDigit07), seq(underscore, take1(isDigit07))))
);
const binInt = seq(
  binPrefix,
  take1(isDigit01),
  more1(alt(take1(isDigit01), seq(underscore, take1(isDigit01))))
);
const integer = alt(hexInt, octInt, binInt, decInt);

// Float
const floatIntPart = decInt;
const zeroPrefixableInt = seq(
  take1(isDigit),
  more0(alt(take1(isDigit), seq(underscore, take1(isDigit))))
);
const floatExpPart = seq(opt(alt(plus, minus)), unsignedDecInt);
const exp = seq(e, floatExpPart);
const frac = seq(decimalPoint, zeroPrefixableInt);

const specialFloat = seq(opt(alt(plus, minus)), alt(inf, nan));

const float = alt(
  specialFloat,
  seq(floatIntPart, alt(exp, seq(frac, opt(exp))))
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
const fullDateTime = seq(fullDate, timeDelim, fullTime);
const localDateTime = seq(fullDate, timeDelim, partialTime);
const localDate = fullDate;
const localTime = partialTime;
const dateTime = alt(fullDateTime, localDateTime, localDate, localTime);

// Array
const arrayValue = seq(wsCommentNewline, val, wsCommentNewline);
const arrayValues = seq(
  seq(arrayValue, more0(seq(comma, arrayValue))),
  opt(comma)
);
const array = seq(arrayOpen, opt(arrayValues), wsCommentNewline, arrayClose);

// Standard Table
const stdTable = seq(stdTableOpen, key, stdTableClose);

// Inline Table
const inlineTableKeyval = seq(wsCommentNewline, keyval, wsCommentNewline);
const inlineTableKeyvals = seq(
  seq(inlineTableKeyval, more0(seq(comma, inlineTableKeyval))),
  opt(comma)
);
const inlineTable = seq(
  inlineTableOpen,
  opt(inlineTableKeyvals),
  wsCommentNewline,
  inlineTableClose
);

// Array Table
const arrayTable = seq(arrayTableOpen, key, arrayTableClose);

// Table
const table = alt(stdTable, arrayTable);

// TODO: more types
function val(input: string) {
  return alt(boolean, float, integer, dateTime, array, inlineTable)(input);
}
