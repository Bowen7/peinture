import { Parser, ParserResult, ParserErrResult } from "../types";
import { pushErrorStack } from "./utils";

export function seq<P1, P2>(
  _parser1: Parser<P1>,
  _parser2: Parser<P2>
): (_input: string) => ParserResult<[P1, P2]>;
export function seq<P1, P2, P3>(
  _parser1: Parser<P1>,
  _parser2: Parser<P2>,
  _parser3: Parser<P3>
): (_input: string) => ParserResult<[P1, P2, P3]>;
export function seq<P1, P2, P3, P4>(
  _parser1: Parser<P1>,
  _parser2: Parser<P2>,
  _parser3: Parser<P3>,
  _parser4: Parser<P4>
): (_input: string) => ParserResult<[P1, P2, P3, P4]>;
export function seq<P1, P2, P3, P4, P5>(
  _parser1: Parser<P1>,
  _parser2: Parser<P2>,
  _parser3: Parser<P3>,
  _parser4: Parser<P4>,
  _parser5: Parser<P5>
): (_input: string) => ParserResult<[P1, P2, P3, P4, P5]>;
export function seq(...parsers: Parser<unknown>[]) {
  return (input: string, message?: string): ParserResult<unknown> => {
    let rest = input;
    const value: unknown[] = [];
    for (const parser of parsers) {
      const result = (parser as Parser<unknown>)(rest);
      if (!result.ok) {
        return pushErrorStack(result, message);
      }
      rest = result.rest;
      value.push(result.value);
    }
    return {
      ok: true,
      rest,
      value,
    };
  };
}

export function alt<P1, P2>(
  _parser1: Parser<P1>,
  _parser2: Parser<P2>
): (_input: string) => ParserResult<P1 | P2>;
export function alt<P1, P2, P3>(
  _parser1: Parser<P1>,
  _parser2: Parser<P2>,
  _parser3: Parser<P3>
): (_input: string) => ParserResult<P1 | P2 | P3>;
export function alt<P1, P2, P3, P4>(
  _parser1: Parser<P1>,
  _parser2: Parser<P2>,
  _parser3: Parser<P3>,
  _parser4: Parser<P4>
): (_input: string) => ParserResult<P1 | P2 | P3 | P4>;
export function alt<P1, P2, P3, P4, P5>(
  _parser1: Parser<P1>,
  _parser2: Parser<P2>,
  _parser3: Parser<P3>,
  _parser4: Parser<P4>,
  _parser5: Parser<P5>
): (_input: string) => ParserResult<P1 | P2 | P3 | P4 | P5>;
export function alt(...parsers: Parser<unknown>[]) {
  return (input: string, message?: string): ParserResult<unknown> => {
    let errRes: ParserErrResult;
    for (const parser of parsers) {
      const result = (parser as Parser<unknown>)(input);
      if (result.ok) {
        return {
          ok: true,
          rest: result.rest,
          value: result.value,
        };
      }
      errRes = result;
    }
    return pushErrorStack(errRes!, message);
  };
}

export const many0 = <T>(parser: Parser<T>) => {
  return (input: string): ParserResult<T[]> => {
    let rest = input;
    const value: T[] = [];
    let result = parser(rest);
    while (result) {
      if (!result.ok) {
        break;
      }
      rest = result.rest;
      value.push(result.value);
      result = parser(rest);
    }
    return {
      ok: true,
      rest,
      value,
    };
  };
};

export const escaped =
  (normal: Parser<string>, escapable: Parser<string>, controlChar = "\\") =>
  (input: string, message?: string): ParserResult<string> => {
    let value = "";
    while (input) {
      const norRes = normal(input);
      if (!norRes.ok) {
        return pushErrorStack(norRes, message);
      }
      if (norRes.value) {
        value += norRes.value;
        input = norRes.rest;
        continue;
      }
      if (input.startsWith(controlChar)) {
        input = input.slice(controlChar.length);
        const escRes = escapable(input);
        if (!escRes.ok) {
          return pushErrorStack(escRes, message);
        }
        if (!escRes.value) {
          value += input[0];
          input = input.slice(1);
        } else {
          value += escRes.value;
          input = escRes.rest;
        }
        continue;
      }
      break;
    }
    return {
      ok: true,
      rest: input,
      value,
    };
  };
