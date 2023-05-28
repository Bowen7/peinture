import { CharacterTester, ParserResult } from "../types";
import { mapErrRes } from "./utils";

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
    return mapErrRes(
      {
        kind: "expect",
        rest: input,
        message: str,
      },
      message
    );
  };

export const takeWhile =
  (tester: CharacterTester) =>
  (input: string): ParserResult<string> => {
    let i = 0;
    while (i < input.length) {
      if (tester(input.slice(i))) {
        i++;
      }
      break;
    }
    return {
      ok: true,
      rest: input.slice(i),
      value: input.slice(0, i),
    };
  };
