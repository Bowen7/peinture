import { Parser, ParserResult, ParserErrResult } from "../types";
import { pushErrorStack } from "./utils";

export function seq<P1, P2>(
  _p1: Parser<P1>,
  _p2: Parser<P2>,
  _outerMessage?: string
): Parser<[P1, P2]>;
export function seq<P1, P2, P3>(
  _p1: Parser<P1>,
  _p2: Parser<P2>,
  _p3: Parser<P3>,
  _outerMessage?: string
): Parser<[P1, P2, P3]>;
export function seq<P1, P2, P3, P4>(
  _p1: Parser<P1>,
  _p2: Parser<P2>,
  _p3: Parser<P3>,
  _p4: Parser<P4>,
  _outerMessage?: string
): Parser<[P1, P2, P3, P4]>;
export function seq<P1, P2, P3, P4, P5>(
  _p1: Parser<P1>,
  _p2: Parser<P2>,
  _p3: Parser<P3>,
  _p4: Parser<P4>,
  _p5: Parser<P5>,
  _outerMessage?: string
): Parser<[P1, P2, P3, P4, P5]>;
export function seq<P1, P2, P3, P4, P5, P6>(
  _p1: Parser<P1>,
  _p2: Parser<P2>,
  _p3: Parser<P3>,
  _p4: Parser<P4>,
  _p5: Parser<P5>,
  _p6: Parser<P6>,
  _outerMessage?: string
): Parser<[P1, P2, P3, P4, P5, P6]>;
export function seq<P1, P2, P3, P4, P5, P6, P7>(
  _p1: Parser<P1>,
  _p2: Parser<P2>,
  _p3: Parser<P3>,
  _p4: Parser<P4>,
  _p5: Parser<P5>,
  _p6: Parser<P6>,
  _p7: Parser<P7>,
  _outerMessage?: string
): Parser<[P1, P2, P3, P4, P5, P6, P7]>;
export function seq(...args: unknown[]): Parser<unknown> {
  const last = args[args.length - 1];
  const outerMessage = typeof last === "string" ? last : undefined;
  const parsers = outerMessage ? args.slice(0, -1) : args;
  return (input: string, message = outerMessage): ParserResult<unknown> => {
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
  _p1: Parser<P1>,
  _p2: Parser<P2>,
  _outerMessage?: string
): Parser<P1 | P2>;
export function alt<P1, P2, P3>(
  _p1: Parser<P1>,
  _p2: Parser<P2>,
  _p3: Parser<P3>,
  _outerMessage?: string
): Parser<P1 | P2 | P3>;
export function alt<P1, P2, P3, P4>(
  _p1: Parser<P1>,
  _p2: Parser<P2>,
  _p3: Parser<P3>,
  _p4: Parser<P4>,
  _outerMessage?: string
): Parser<P1 | P2 | P3 | P4>;
export function alt<P1, P2, P3, P4, P5>(
  _p1: Parser<P1>,
  _p2: Parser<P2>,
  _p3: Parser<P3>,
  _p4: Parser<P4>,
  _p5: Parser<P5>,
  _outerMessage?: string
): Parser<P1 | P2 | P3 | P4 | P5>;
export function alt<P1, P2, P3, P4, P5, P6>(
  _p1: Parser<P1>,
  _p2: Parser<P2>,
  _p3: Parser<P3>,
  _p4: Parser<P4>,
  _p5: Parser<P5>,
  _p6: Parser<P6>,
  _outerMessage?: string
): Parser<P1 | P2 | P3 | P4 | P5 | P6>;
export function alt<P1, P2, P3, P4, P5, P6, P7>(
  _p1: Parser<P1>,
  _p2: Parser<P2>,
  _p3: Parser<P3>,
  _p4: Parser<P4>,
  _p5: Parser<P5>,
  _p6: Parser<P6>,
  _p7: Parser<P7>,
  _outerMessage?: string
): Parser<P1 | P2 | P3 | P4 | P5 | P6 | P7>;
export function alt(...args: unknown[]): Parser<unknown> {
  const last = args[args.length - 1];
  const outerMessage = typeof last === "string" ? last : undefined;
  const parsers = outerMessage ? args.slice(0, -1) : args;
  return (input: string, message = outerMessage): ParserResult<unknown> => {
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

export const delimited = <T1, T2, T3>(
  parser1: Parser<T1>,
  parser2: Parser<T2>,
  parser3: Parser<T3>,
  outerMessage?: string
) => {
  const parser = seq(parser1, parser2, parser3);
  return (input: string, message = outerMessage): ParserResult<T2> => {
    const result = parser(input);
    if (!result.ok) {
      return pushErrorStack(result, message);
    }
    return {
      ok: true,
      rest: result.rest,
      value: result.value[1],
    };
  };
};
