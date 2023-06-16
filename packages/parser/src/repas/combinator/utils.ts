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

export type Range = [string, string] | string;
export type CodeRange = [number, number] | number;

export const range = (start: string, end: string) => (char: string) =>
  char >= start && char <= end;

export const ranges =
  (...ranges: Range[]) =>
  (char: string) =>
    ranges.some((range) => {
      if (Array.isArray(range)) {
        const [start, end] = range;
        return char >= start && char <= end;
      }
      return char === range;
    });

export const codeRange = (start: number, end: number) => (char: string) => {
  const code = char.charCodeAt(0);
  return code >= start && code <= end;
};
export const codeRanges =
  (...ranges: CodeRange[]) =>
  (char: string) => {
    const code = char.charCodeAt(0);
    return ranges.some((range) => {
      if (Array.isArray(range)) {
        const [start, end] = range;
        return code >= start && code <= end;
      }
      return code === range;
    });
  };
