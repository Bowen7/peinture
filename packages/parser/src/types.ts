export type ReadResult<T> = { value: T; start: number; end: number } | null;

export type FrontMatter = { [key: string]: string | number | boolean };
