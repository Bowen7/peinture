import { Parser, ParserResult } from "../types";
import { mapErrRes } from "./utils";

export const peek = <T>(parser: Parser<T>) => {
  let cachedInput = "";
  let cachedResult: ParserResult<T> | null = null;
  const _peek: Parser<T> = (input: string) => {
    if (cachedInput !== input || !cachedResult) {
      cachedResult = parser(input);
      cachedInput = input;
    }
    return cachedResult;
  };
  const _consume: Parser<T> = (input: string) => {
    if (cachedInput !== input || !cachedResult) {
      return parser(input);
    }
    return cachedResult;
  };
  return [_peek, _consume];
};

export const expMsg =
  <T>(parser: Parser<T>, outerMessage: string) =>
  (input: string, innerMessage?: string) => {
    const result = parser(input);
    if (!result.ok) {
      return mapErrRes(
        {
          kind: "expect",
          rest: input,
          message: outerMessage,
        },
        innerMessage
      );
    }
    return result;
  };
