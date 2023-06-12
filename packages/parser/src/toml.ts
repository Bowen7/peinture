import {
  seq,
  tag,
  opt,
  newline,
  alt,
  takeWhile,
  space0,
  peek,
  eof,
  msg,
  delimited,
  isSpace,
  isHexDigit,
  escaped,
  take,
  isAlphanumeric,
  createRangesTester,
  many,
  isDigit19,
  isDigit,
  many1,
  many0,
} from "./repas";

const isDigit07 = (char: string) => char >= "0" && char <= "7";
const isDigit01 = (char: string) => char === "0" || char === "1";

const isNonAscii = (char: string) => {
  const code = char.charCodeAt(0);
  return (
    (code >= 0x80 && code <= 0xd7ff) || (code >= 0xe000 && code <= 0x10ffff)
  );
};

const isAllowedCommentChar = (char: string) => {
  const code = char.charCodeAt(0);
  return (
    (code >= 0x01 && code <= 0x09) ||
    (code >= 0x0e && code <= 0x7f) ||
    isNonAscii(char)
  );
};

const isBasicUnescaped = (char: string) => {
  const code = char.charCodeAt(0);
  return (
    isSpace(char) ||
    code === 0x21 ||
    (code >= 0x23 && code <= 0x5b) ||
    (code >= 0x5d && code <= 0x7e) ||
    isNonAscii(char)
  );
};

const isEscaped = (char: string, str: string) => {
  if (char !== "\\") {
    return false;
  }
  char = str[1];
  const matches = str
    .slice(1)
    .match(
      /^["\\befnrt]|(x[a-zA-Z0-9]{2})|(u[a-zA-Z0-9]{4})|(u[a-zA-Z0-9]{8})$/
    );
  if (!matches) {
    return false;
  }
  return matches[0].length + 1;
};

const isLiteralChar = (char: string) => {
  const code = char.charCodeAt(0);
  return (
    code === 0x09 ||
    (code >= 0x20 && code <= 0x26) ||
    (code >= 0x28 && code <= 0x7e) ||
    isNonAscii(char)
  );
};

const isUnquotedKeyCode = createRangesTester([
  0x2d,
  0x5f,
  0xb2,
  0xb3,
  0xb9,
  [0xbc, 0xbe],
  [0xc0, 0xd6],
  [0xd8, 0xf6],
  [0xf8, 0x37d],
  [0x37f, 0x1fff],
  0x200c,
  0x200d,
  [0x203f, 0x2040],
  [0x2070, 0x218f],
  [0x2460, 0x24ff],
  [0x2c00, 0x2fef],
  [0x3001, 0xd7ff],
  [0xf900, 0xfdcf],
  [0xfdf0, 0xfffd],
  [0x10000, 0xeffff],
]);

const isUnquotedKeyChar = (char: string) =>
  isAlphanumeric(char) || isUnquotedKeyCode(char);

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

const mapEscaped = (str: string) => {
  if (str.length === 2) {
    const char = str[1];
    switch (char) {
      case "b":
        return "\b";
      case "e":
        return "\u001b";
      case "f":
        return "\f";
      case "n":
        return "\n";
      case "r":
        return "\r";
      case "t":
        return "\t";
      default:
        return char;
    }
  }
  const code = parseInt(str.slice(2), 16);
  return String.fromCharCode(code);
};

const basicStringContent = escaped(isBasicUnescaped, isEscaped, mapEscaped);
const basicString = delimited(questionMark, basicStringContent, questionMark);

const literalString = delimited(
  apostrophe,
  takeWhile(isLiteralChar),
  apostrophe
);
const quotedKey = alt(basicString, literalString);

const dotSep = seq(space0, tag("."), space0);

const comment = seq(
  tag("#"),
  takeWhile((c) => isAllowedCommentChar(c)),
  msg(peek(alt(newline, eof)), "expect end of line")
);

const unquotedKey = take(isUnquotedKeyChar, 1);
const simpleKey = alt(quotedKey, unquotedKey);

const keyValSep = delimited(space0, tag("="), space0);
const dottedKey = seq(simpleKey, many(seq(dotSep, simpleKey), 1));
const key = alt(simpleKey, dottedKey);

const boolean = alt(tag("true"), tag("false"));

const unsignedDecInt = alt(
  seq(
    take(isDigit19, 1, 1),
    many1(alt(take1(isDigit), seq(underscore, take1(isDigit))))
  ),
  take(isHexDigit, 1)
);
const decInt = seq(opt(alt(plus, minus)), unsignedDecInt);

const hexInt = seq(
  hexPrefix,
  take1(isHexDigit),
  many1(alt(take1(isHexDigit), seq(underscore, take1(isHexDigit))))
);
const octInt = seq(
  octPrefix,
  take1(isDigit07),
  many1(alt(take1(isDigit07), seq(underscore, take1(isDigit07))))
);
const binInt = seq(
  binPrefix,
  take1(isDigit01),
  many1(alt(take1(isDigit01), seq(underscore, take1(isDigit01))))
);
const integer = alt(hexInt, octInt, binInt, decInt);

const floatIntPart = decInt;
const zeroPrefixableInt = seq(
  take1(isDigit),
  many0(alt(take1(isDigit), seq(underscore, take1(isDigit))))
);
const floatExpPart = seq(opt(alt(plus, minus)), unsignedDecInt);
const exp = seq(e, floatExpPart);
const frac = seq(decimalPoint, zeroPrefixableInt);

const specialFloat = seq(opt(alt(plus, minus)), alt(inf, nan));

const float = alt(
  specialFloat,
  seq(floatIntPart, alt(exp, seq(frac, opt(exp))))
);

const dateFullYear = take(isDigit, 4, 4);
const dateMonth = take(isDigit, 2, 2);
const dateMDay = take(isDigit, 2, 2);
const timeDelim = take1(
  (char) => char === "t" || char === "T" || isSpace(char)
);
const timeHour = take(isDigit, 2, 2);
const timeMinute = take(isDigit, 2, 2);
const timeSecond = take(isDigit, 2, 2);
const timeSecFrac = seq(decimalPoint, take(isDigit, 1));
// const keyVal =
