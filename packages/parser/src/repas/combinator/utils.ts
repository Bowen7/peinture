import { ParserErrResult } from "../types";

export const pushErrorStack = (
  errRes: ParserErrResult,
  message?: string | { kind: string; message: string }
): ParserErrResult => {
  if (!message) {
    return errRes;
  }
  const nextStack = errRes.stack.slice();
  if (typeof message === "string") {
    nextStack.push({ kind: "custom", message });
  } else {
    nextStack.push(message);
  }
  return {
    ...errRes,
    stack: nextStack,
  };
};

// TODO: pretty print error
export const displayErr = (errRes: ParserErrResult): string => {
  const stack = errRes.stack;
  return stack.map((err) => err.message).join("\n");
};

export type Range = [number, number] | number;
export const createRangesTester = (ranges: Range[]) => {
  return (char: string) => {
    const code = char.charCodeAt(0);
    for (const range of ranges) {
      if (typeof range === "number") {
        if (code === range) {
          return true;
        }
      } else {
        const [start, end] = range;
        if (code >= start && code <= end) {
          return true;
        }
      }
    }
    return false;
  };
};
