import { Parser, ParserResult, ParserErr, ParserErrResult } from "../types";

const advancedErrs = (
  errors: ParserErr[],
  rest: string,
  message?: string
): ParserErrResult =>
  message === undefined
    ? { ok: false, errors }
    : {
        ok: false,
        errors: [
          {
            kind: "custom",
            message,
            rest,
          },
        ],
      };

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
        return advancedErrs(result.errors, rest, message);
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
    let errors: ParserErr[] = [];
    for (const parser of parsers) {
      const result = (parser as Parser<unknown>)(input);
      if (result.ok) {
        return {
          ok: true,
          rest: result.rest,
          value: result.value,
        };
      }
      errors = result.errors;
    }
    return advancedErrs(errors, input, message);
  };
}
