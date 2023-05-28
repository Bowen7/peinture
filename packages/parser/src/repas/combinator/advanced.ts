import { Parser, ParserResult, ParserErr } from "../types";
import { mapErrRes } from "./utils";

export function sequences<P1, P2>(
  _parser1: Parser<P1>,
  _parser2: Parser<P2>
): (_input: string) => ParserResult<[P1, P2]>;
export function sequences<P1, P2, P3>(
  _parser1: Parser<P1>,
  _parser2: Parser<P2>,
  _parser3: Parser<P3>
): (_input: string) => ParserResult<[P1, P2, P3]>;
export function sequences<P1, P2, P3, P4>(
  _parser1: Parser<P1>,
  _parser2: Parser<P2>,
  _parser3: Parser<P3>,
  _parser4: Parser<P4>
): (_input: string) => ParserResult<[P1, P2, P3, P4]>;
export function sequences<P1, P2, P3, P4, P5>(
  _parser1: Parser<P1>,
  _parser2: Parser<P2>,
  _parser3: Parser<P3>,
  _parser4: Parser<P4>,
  _parser5: Parser<P5>
): (_input: string) => ParserResult<[P1, P2, P3, P4, P5]>;
export function sequences(...parsers: Parser<unknown>[]) {
  return (input: string, message?: string): ParserResult<unknown> => {
    let rest = input;
    const value: unknown[] = [];
    for (const parser of parsers) {
      const result = (parser as Parser<unknown>)(rest);
      if (!result.ok) {
        return mapErrRes(result, message);
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
    let errRes: ParserErr;
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
    return mapErrRes(errRes!, message);
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

export const terminated =
  <P1, P2>(parser: Parser<P1>, terminator: Parser<P2>) =>
  (input: string, message?: string): ParserResult<P1> => {
    const result = parser(input);
    if (!result.ok) {
      return mapErrRes(result, message);
    }
    const termResult = terminator(result.rest);
    if (!termResult.ok) {
      return mapErrRes(termResult, message);
    }
    return {
      ok: true,
      rest: termResult.rest,
      value: result.value,
    };
  };

export const delimited =
  <P1, P2, P3>(parser1: Parser<P1>, parser2: Parser<P2>, parser3: Parser<P3>) =>
  (input: string, message?: string): ParserResult<P2> => {
    const result1 = parser1(input);
    if (!result1.ok) {
      return mapErrRes(result1, message);
    }
    const result2 = parser2(result1.rest);
    if (!result2.ok) {
      return mapErrRes(result2, message);
    }
    const result3 = parser3(result2.rest);
    if (!result3.ok) {
      return mapErrRes(result3, message);
    }
    return {
      ok: true,
      rest: result3.rest,
      value: result2.value,
    };
  };
