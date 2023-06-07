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
