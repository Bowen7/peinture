import { Parser, ParserResult, OkParser } from "../types";
import { errMsg } from "./utils";

export function peek<T>(_parser: OkParser<T>): [OkParser<T>, OkParser<null>];
export function peek<T>(_parser: Parser<T>): [Parser<T>, OkParser<null>];
export function peek<T>(parser: Parser<T>) {
  let cachedInput = "";
  let cachedResult: ParserResult<T> | null = null;
  const _peek: Parser<T> = (input: string) => {
    if (cachedInput !== input || !cachedResult) {
      cachedResult = parser(input);
      cachedInput = input;
    }
    return cachedResult;
  };
  const _consume = (input: string) => {
    if (cachedInput !== input || !cachedResult) {
      return {
        ok: true,
        rest: input,
        value: null,
      };
    }
    return {
      ok: true,
      rest: cachedResult.rest,
      value: null,
    };
  };
  return [_peek, _consume];
}

export const expMsg =
  <T>(parser: Parser<T>, outerMessage: string) =>
  (input: string, innerMessage?: string) => {
    const result = parser(input);
    if (!result.ok) {
      return errMsg(
        {
          kind: "expected",
          rest: input,
          message: outerMessage,
        },
        innerMessage
      );
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
      return errMsg(result, message);
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
