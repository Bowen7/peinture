import { tag, takeWhile, sequences, many0, oneOf } from "./match";
import { isSpace } from "./char";
import {} from "./types";

export const matterSeparator = tag("---");

const blankLine = sequences(takeWhile(isSpace), oneOf("\n", "\r\n"));
export const blankLines = many0(blankLine);
