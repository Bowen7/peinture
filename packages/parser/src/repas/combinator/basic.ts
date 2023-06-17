import { ParserResult } from "../types";
import { pushErrorStack } from "./utils";

export const tag =
  (str: string) =>
  (input: string, message?: string): ParserResult<string> => {
    if (str === input.slice(0, str.length)) {
      return {
        ok: true,
        rest: input.slice(str.length),
        value: str,
      };
    }
    return pushErrorStack(
      {
        ok: false,
        rest: input,
        stack: [],
      },
      message || { kind: "tag", message: str }
    );
  };

export const regex = (r: RegExp) => {
  return (input: string, message?: string): ParserResult<string> => {
    const m = input.match(r);
    if (m) {
      return {
        ok: true,
        rest: input.slice(m[0].length),
        value: m[0],
      };
    }
    return pushErrorStack(
      {
        ok: false,
        rest: input,
        stack: [],
      },
      message || { kind: "regex", message: r.toString() }
    );
  };
};
