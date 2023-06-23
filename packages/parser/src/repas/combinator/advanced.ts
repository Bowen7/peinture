import { Parser, ParserResult, ParserErrResult } from "../types";
import { pushErrorStack } from "./utils";

export const seq = <T extends unknown[]>(
  parsers: { [K in keyof T]: Parser<T[K]> },
  outerMessage?: string
): Parser<T> => {
  return (input: string, message = outerMessage): ParserResult<T> => {
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
      value: value as T,
    };
  };
};

export const pair = <T1, T2>(
  parser1: Parser<T1>,
  parser2: Parser<T2>,
  outerMessage?: string
): Parser<[T1, T2]> => seq<[T1, T2]>([parser1, parser2], outerMessage);

export const triplet = <T1, T2, T3>(
  parser1: Parser<T1>,
  parser2: Parser<T2>,
  parser3: Parser<T3>,
  outerMessage?: string
): Parser<[T1, T2, T3]> =>
  seq<[T1, T2, T3]>([parser1, parser2, parser3], outerMessage);

export const alt = <T extends unknown[]>(
  parsers: { [K in keyof T]: Parser<T[K]> },
  outerMessage?: string
): Parser<T[number]> => {
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
      } else if (result.fatal) {
        return pushErrorStack(result, message);
      }
      errRes = result;
    }
    return pushErrorStack(errRes!, message);
  };
};

export const delimited = <T1, T2, T3>(
  parser1: Parser<T1>,
  parser2: Parser<T2>,
  parser3: Parser<T3>,
  outerMessage?: string
) => {
  const parser = seq<[T1, T2, T3]>([parser1, parser2, parser3]);
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
