import {
  CharacterTester,
  ParserOkResult,
  ParserErrResult,
  ParserResult,
  Parser,
} from "../types";
import { pushErrorStack } from "./utils";

export const repeatParser =
  <T>(parser: Parser<T>, min: number, max: number, message?: string) =>
  (input: string): ParserResult<T[]> => {
    let rest = input;
    let count = 0;
    const value: T[] = [];
    let errRes: ParserErrResult | null = null;
    while (rest.length > 0) {
      const result = parser(rest);
      if (!result.ok) {
        errRes = result;
        break;
      }
      rest = result.rest;
      count++;
      value.push(result.value);
      if (count === max) {
        break;
      }
    }
    if (value.length < min) {
      return pushErrorStack(
        errRes!,
        message || {
          kind: "repeat.parser",
          message: `${min} - ${max}`,
        }
      );
    }
    return {
      ok: true,
      rest,
      value,
    };
  };

export const repeatTester =
  (tester: CharacterTester, min: number, max: number, message?: string) =>
  (input: string): ParserResult<string> => {
    let i = 0;
    let count = 0;
    while (i < input.length) {
      const char = input[i];
      const str = input.slice(i);
      const len = Number(tester(char, str));
      if (len === 0) {
        break;
      }
      i += len;
      count++;
      if (count === max) {
        break;
      }
    }
    if (count < min) {
      return pushErrorStack(
        {
          ok: false,
          rest: input,
          stack: [],
        },
        message || {
          kind: "repeat.tester",
          message: `${min} - ${max}`,
        }
      );
    }
    return {
      ok: true,
      rest: input.slice(i),
      value: input.slice(0, i),
    };
  };

export function repeat<T>(
  _parser: Parser<T>,
  _min: number,
  _max: number,
  _message?: string
): Parser<T[]>;
export function repeat(
  _tester: CharacterTester,
  _min: number,
  _max: number,
  _message?: string
): Parser<string>;
export function repeat<T>(
  parser: Parser<T> | CharacterTester,
  min = 0,
  max = Infinity,
  message?: string
): Parser<T[]> | Parser<string> {
  const result = parser(" ", " ");
  const type = typeof result;
  if (type === "number" || type === "boolean") {
    return repeatTester(parser as CharacterTester, min, max, message);
  }
  return repeatParser(parser as Parser<T>, min, max, message);
}

export function take1<T>(_parser: Parser<T>, _message?: string): Parser<T[]>;
export function take1(
  _tester: CharacterTester,
  _message?: string
): Parser<string>;
export function take1(
  parser: Parser<unknown> | CharacterTester,
  message?: string
): Parser<unknown> {
  return repeat(parser as CharacterTester, 1, 1, message);
}

export function takeX<T>(
  _parser: Parser<T>,
  _times: number,
  _message?: string
): Parser<T[]>;
export function takeX(
  _tester: CharacterTester,
  _times: number,
  _message?: string
): Parser<string>;
export function takeX(
  parser: Parser<unknown> | CharacterTester,
  times: number,
  message?: string
): Parser<unknown> {
  return repeat(parser as CharacterTester, times, times, message);
}

export function more0<T>(
  _parser: Parser<T>,
  _message?: string
): (_input: string) => ParserOkResult<T[]>;
export function more0(
  _tester: CharacterTester,
  _message?: string
): (_input: string) => ParserOkResult<string>;
export function more0(
  parser: Parser<unknown> | CharacterTester,
  message?: string
): Parser<unknown> {
  return repeat(parser as CharacterTester, 0, Infinity, message);
}

export function more1<T>(_parser: Parser<T>, _message?: string): Parser<T[]>;
export function more1(
  _tester: CharacterTester,
  _message?: string
): Parser<string>;
export function more1(
  parser: Parser<unknown> | CharacterTester,
  message?: string
): Parser<unknown> {
  return repeat(parser as CharacterTester, 1, Infinity, message);
}

export function moreX<T>(
  _parser: Parser<T>,
  _times: number,
  _message?: string
): Parser<T[]>;
export function moreX(
  _tester: CharacterTester,
  _times: number,
  _message?: string
): Parser<string>;
export function moreX(
  parser: Parser<unknown> | CharacterTester,
  times: number,
  message?: string
): Parser<unknown> {
  return repeat(parser as CharacterTester, times, times, message);
}
