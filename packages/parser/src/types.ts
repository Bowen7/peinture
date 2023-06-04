export type YAMLValue = YAMLMap | YAMLSeq | YAMLScalar;
export type YAMLScalar = string | number | boolean | null;
export type YAMLMap = {
  [key: string]: YAMLValue;
};
export type YAMLSeq = YAMLValue[];
