import { takeWhile } from "./basic";
import { isSpace } from "../character";
import { Parser } from "../types";
import { mapErrRes } from "./utils";
import { sequences, many0 } from "./advanced";
import { expMsg } from "./modifier";

export const space0 = takeWhile(isSpace);

export const lineEnding: Parser<string> = (input: string, message?: string) => {
  if (input[0] === "\n") {
    return { ok: true, rest: input.slice(1), value: "\n" };
  } else if (input[0] === "\r" && input[1] === "\n") {
    return { ok: true, rest: input.slice(2), value: "\r\n" };
  }
  return mapErrRes(
    { kind: "expect", message: "line ending", rest: input },
    message
  );
};

export const blankLine = expMsg(sequences(space0, lineEnding), "blank line");
export const blankLines = many0(blankLine);
