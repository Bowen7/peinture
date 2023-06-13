import { CharacterTester, ParserOkResult, ParserResult } from "../types";
import { pushErrorStack } from "./utils";

export const tag =
  (str: string, message?: string) =>
  (input: string): ParserResult<string> => {
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

export const escaped =
  (
    normalTester: CharacterTester,
    escapedTester: CharacterTester,
    mapEscaped: (_str: string) => string
  ) =>
  (input: string): ParserOkResult<string> => {
    let i = 0;
    let value = "";
    while (i < input.length) {
      const char = input[i];
      const str = input.slice(i);
      const normalLen = Number(normalTester(char, str));
      if (normalLen > 0) {
        i += normalLen;
        value += str.slice(0, normalLen);
        continue;
      }
      const escapedLen = Number(escapedTester(char, str));
      if (escapedLen > 0) {
        i += escapedLen;
        value += mapEscaped(str.slice(0, normalLen));
        continue;
      }
      break;
    }
    return {
      ok: true,
      rest: input.slice(i),
      value: value,
    };
  };
