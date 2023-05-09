import { Result } from "./types";

export const ok = <T>(value: T, rest: string): Result<T, never> => ({
  ok: true,
  value,
  rest,
});
export const err = <E>(error?: E): Result<never, E> => ({
  ok: false,
  error,
});
export const mapOk = <T, E>(
  result: Result<T, E>,
  map: (
    value: T,
    rest: string
  ) => {
    ok: true;
    value: T;
    rest: string;
  }
): Result<T, E> => (result.ok ? map(result.value, result.rest) : result);

export const parseByRegex = (
  content: string,
  regex: RegExp
): Result<string, undefined> => {
  const result = regex.exec(content);
  if (!result) {
    return err();
  }
  const value = result[0];
  return ok(value, content.slice(value.length));
};

export const CHAR_MAP = {
  LINE_BREAK: "\n",
  SPACE: " ",
  HASH: "#",
  HYPHEN: "-",
  COLON: ":",
};
