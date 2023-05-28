import { ParserErr, ParserErrResult } from "../types";

export const mapErrRes = (
  error: ParserErr,
  message?: string
): ParserErrResult =>
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
    case "expect":
      return `Expect ${error.message}`;
    case "custom":
      return error.message;
  }
};
