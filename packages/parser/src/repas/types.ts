export type CharacterTester = (_char: string) => boolean;

export type ParserOkResult<T> = {
  ok: true;
  rest: string;
  value: T;
};

export type ParserErr = {
  kind: string;
  message: string;
};

export type ParserErrResult = {
  ok: false;
  rest: string;
  stack: ParserErr[];
};

export type ParserResult<T> = ParserOkResult<T> | ParserErrResult;

export type OkParser<T> = (
  _input: string,
  _message?: string
) => ParserOkResult<T>;
export type Parser<T> = (_input: string, _message?: string) => ParserResult<T>;
