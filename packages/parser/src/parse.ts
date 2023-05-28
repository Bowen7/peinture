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
} from "./repas";

const matterSeparator = tag("---");

export function parse(input: string) {
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

function yamlParser(input: string): ParserResult<null> {}

function yamlMapParser(input: string): ParserResult<null> {}

function yamlSeqParser(input: string): ParserResult<null> {}
