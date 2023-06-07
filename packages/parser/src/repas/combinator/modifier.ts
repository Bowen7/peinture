import { Parser, OkParser, ParserResult } from "../types";
import { pushErrorStack } from "./utils";

export const msg =
  <T>(parser: Parser<T>, outerMessage: string) =>
  (input: string, innerMessage?: string) => {
    const result = parser(input);
    if (!result.ok) {
      return pushErrorStack(result, innerMessage || outerMessage);
    }
    return result;
  };

export function map<T, R>(
  _parser: OkParser<T>,
  _mapper: (_value: T) => R
): OkParser<R>;
export function map<T, R>(
  _parser: Parser<T>,
  _mapper: (_value: T) => R
): Parser<R>;
export function map<T, R>(parser: Parser<T>, mapper: (_value: T) => R) {
  return (input: string, message?: string) => {
    const result = parser(input);
    if (!result.ok) {
      return pushErrorStack(result, message);
    }
    return {
      ...result,
      value: mapper(result.value),
    };
  };
}

export function count<T>(parser: Parser<T>) {
  return (input: string) => {
    let value = 0;
    let res = parser(input);
    while (res.ok) {
      input = res.rest;
      value++;
      res = parser(input);
    }
    return {
      ok: true,
      rest: input,
      value,
    };
  };
}

export function opt<T, D = string>(
  parser: Parser<T | D>,
  defaultValue = "" as D
) {
  return (input: string): ParserResult<T | D> => {
    const res = parser(input);
    if (!res.ok) {
      return {
        ok: true,
        rest: input,
        value: defaultValue,
      };
    }
    return res;
  };
}
