import {
  tag,
  sequences,
  ParserResult,
  takeWhile,
  blankLines,
  displayErr,
  terminated,
  delimited,
  blankLine,
  ParserOkResult,
  map,
  isSpace,
  isLineEnding,
  space0,
} from "./repas";
import { YAMLMap, YAMLScalar, YAMLSeq, YAMLValue } from "./types";

const isDelimiter = (char: string) => isSpace(char) || isLineEnding(char);

const NUMBER_REGEX = /^\d*\.\d+$/;

const matterSeparator = tag("---");

let indents: number[] = [];

const spaces = map(space0, (s) => s.length);
const [peekIndent, consumeIndent] = peek(
  map(takeWhile(isSpace), (s) => s.length)
);

export function parse(input: string) {
  indents = [];
  const result = parser(input);
  if (!result.ok) {
    displayErr(result);
  }
  return result.value;
}

function parser(input: string) {
  input = blankLines(input).rest;
  const matterRes = matterParser(input);
  if (!matterRes.ok) {
    return matterRes;
  }
  input = matterRes.rest;
}

function matterParser(input: string): ParserResult<null> {
  const result = matterSeparator(input);
  if (!result.ok) {
    return { ok: true, rest: input, value: null };
  }
  return delimited(blankLine, matterContentParser, matterSeparator)(input);
}

function matterContentParser(input: string): ParserResult<null> {}

function yamlParser(input: string): ParserResult<YAMLValue> {
  const indent = spaces(input).value;
  indents.push(indent);
}

function yamlScalarParser(input: string): ParserResult<string> {
  let i = 0;
  while (i < input.length) {
    if (
      input[i] === "\n" ||
      input[i] === "\r" ||
      (input[i] === ":" && isDelimiter(input[i + 1]))
    ) {
      break;
    }
    i++;
  }
  let value = input.slice(0, i).trim();
  const rest = input.slice(i);
  // handle quoted string
  if (value[0] === "'" || value[0] === '"') {
    if (value[0] === value[value.length - 1]) {
      value = value.slice(1, value.length - 1);
    } else {
      return {
        ok: false,
        rest: input[i - 1] + rest,
        kind: "expected",
        message: "closing quote",
      };
    }
  }
  return {
    ok: true,
    value,
    rest,
  };
}

const yamlScalarValueParser = map(yamlScalarParser, (value) => {
  switch (value) {
    case "true":
      return true;
    case "false":
      return false;
    case "null":
      return null;
    default:
      if (NUMBER_REGEX.test(value)) {
        return parseFloat(value);
      }
      return value;
  }
});

function yamlValueParser(input: string): ParserResult<YAMLValue> {
  if (input[0] === "-" && isDelimiter(input[1])) {
  }
}

function yamlMapParser(input: string): ParserResult<YAMLMap> {}

function yamlSeqParser(input: string): ParserResult<YAMLSeq> {
  let rest = input;
  if (rest[0] !== "-" || isDelimiter(rest[1])) {
    return {
      ok: false,
      rest: input,
      kind: "expected",
      message: "sequence item",
    };
  }
  rest = spaces(input.slice(1)).rest;
  const scalarRes = yamlScalarParser(input.slice(1));
  if (!scalarRes.ok) {
    return scalarRes;
  }
  const scalar = scalarRes.value;
}
