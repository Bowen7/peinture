import { takeWhile } from "./basic";
import { isSpace } from "../character";
import { Parser } from "../types";
import { pushErrorStack } from "./utils";
import { sequence, many0 } from "./advanced";
import { msg } from "./modifier";

export const space0 = takeWhile(isSpace);

export const newline: Parser<string> = (input: string, message?: string) => {
  if (input[0] === "\n") {
    return { ok: true, rest: input.slice(1), value: "\n" };
  } else if (input[0] === "\r" && input[1] === "\n") {
    return { ok: true, rest: input.slice(2), value: "\r\n" };
  }
  return pushErrorStack({ ok: false, rest: input, stack: [] }, message);
};

export const blankLine = msg(sequence(space0, newline), "blank line");
export const blankLines = many0(blankLine);
