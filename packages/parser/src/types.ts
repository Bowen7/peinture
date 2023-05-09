export type Result<T, E> =
  | { ok: true; value: T; rest: string }
  | { ok: false; error: E | undefined };

export type FrontMatter = { [key: string]: string | number | boolean };

export type JSONObject = {
  [key: string]: string | number | boolean | JSONObject | JSONObject[];
};

export const TOKEN = {
  BLOCK_ENTRY: "BLOCK_ENTRY",
  BLOCK_LEAVE: "BLOCK_LEAVE",
  COLON: "COLON",
} as const;
