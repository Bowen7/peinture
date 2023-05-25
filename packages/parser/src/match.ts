import { MatchResult, Matcher, CharTest } from "./types";

export const tag =
  (expected: string) =>
  (input: string, pos: number): MatchResult => {
    const match = input.slice(pos, pos + expected.length);
    if (match === expected) {
      pos += expected.length;
      return {
        ok: true,
        pos,
        rest: input.slice(pos),
        match,
      };
    }
    return {
      ok: false,
      pos,
      expected,
    };
  };

export const takeWhile =
  (charTest: CharTest) =>
  (input: string, pos: number): MatchResult => {
    let i = 0;
    while (i < input.length) {
      const length = charTest(input.slice(i));
      i += length;
    }
    return {
      ok: true,
      pos: pos + i,
      rest: input.slice(i),
      match: input.slice(0, i),
    };
  };

export const alt =
  (...matchers: Matcher[]) =>
  (input: string, pos: number): MatchResult => {
    const expected: string[] = [];
    for (const match of matchers) {
      const result = match(input, pos);
      if (result.ok) {
        return result;
      }
      expected.push(result.expected);
    }
    return {
      ok: false,
      pos,
      expected: `oneOf(${expected.join(", ")})`,
    };
  };

export const many0 = (matcher: Matcher) => (input: string, pos: number) => {
  let match = "";
  let result = matcher(input, pos);
  while (result.ok) {
    pos = result.pos;
    match += result.match;
    result = matcher(input, pos);
  }
  return {
    ok: true,
    pos,
    rest: input.slice(match.length),
    match,
  };
};

export const sequences =
  (...matchers: Matcher[]) =>
  (input: string, pos: number): MatchResult => {
    const start = pos;
    let rest = input;
    let expected: string[] = [];
    for (const matcher of matchers) {
      const result = matcher(rest, pos);
      if (!result.ok) {
        expected.push(result.expected);
        return {
          ok: false,
          pos: start,
          expected: `sequence(${expected.join(", ")})`,
        };
      }
      rest = result.rest;
      pos = result.pos;
      expected.push(result.match);
    }
    return {
      ok: true,
      pos,
      rest,
      match: input.slice(start, pos),
    };
  };

export const oneOf =
  (...strings: string[]) =>
  (input: string, pos: number): MatchResult => {
    const start = pos;
    for (const string of strings) {
      const length = string.length;
      const match = input.slice(0, length);
      if (match === string) {
        return {
          ok: true,
          pos: pos + length,
          rest: input.slice(length),
          match,
        };
      }
    }
    return {
      ok: false,
      pos: start,
      expected: `oneOf(${strings.join(", ")})`,
    };
  };
