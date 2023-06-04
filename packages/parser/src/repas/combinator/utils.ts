import { ParserErr, ParserErrResult } from "../types";

export const errMsg = (error: ParserErr, message?: string): ParserErrResult =>
  message === undefined
    ? { ok: false, ...error }
    : {
        ok: false,
        kind: "custom",
        message,
        rest: error.rest,
      };

// TODO: pretty print error
export const displayErr = (error: ParserErrResult): string => {
  switch (error.kind) {
    case "expected":
      return `Expected ${error.message}`;
    case "unexpected":
      return `Unexpected ${error.message}`;
    case "custom":
      return error.message;
  }
};
