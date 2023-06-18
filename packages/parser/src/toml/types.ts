export type DateTime = {
  type: "datetime" | "datetime-local" | "date-local" | "time-local";
  value: string;
};

export type TomlValue =
  | string
  | boolean
  | TomlArray
  | TomlInlineTable
  | DateTime
  | number;

export type TomlArray = TomlValue[];
export type TomlInlineTable = {
  [key: string]: TomlValue;
};
