export const TOKEN_TYPE = {
  MATTER_MARKER: "---",
  END: "",
  SEQUENCE: "-",
} as const;

export const STATE = {
  INITIAL: "initial",
  YAML: "yaml",
  END: "",
} as const;

export type TokenType = (typeof TOKEN_TYPE)[keyof typeof TOKEN_TYPE];

export type StateType = (typeof STATE)[keyof typeof STATE];

export type Token = {
  type: TokenType;
  indent: number;
  value?: string;
};

export type MatchResult =
  | {
      ok: true;
      pos: number;
      rest: string;
      match: string;
    }
  | {
      ok: false;
      pos: number;
      expected: string;
    };

export type Matcher = (_input: string, _pos: number) => MatchResult;

export type CharTest = (_input: string) => number;
