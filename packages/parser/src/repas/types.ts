export type CharacterTester = (_char: string) => boolean;

export type ParserOkResult<T> = {
  ok: true;
  rest: string;
  value: T;
};

export type ParserErr =
  | {
      kind: "expect";
      message: string;
      rest: string;
    }
  | {
      kind: "custom";
      message: string;
      rest: string;
    };

export type ParserErrResult = {
  ok: false;
} & ParserErr;

export type ParserResult<T> = ParserOkResult<T> | ParserErrResult;

export type Parser<T> = (_input: string, _message?: string) => ParserResult<T>;
