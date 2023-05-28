import { Result, TOKEN } from "./types";
import { ok, err, CHAR_MAP } from "./utils";

const YAML_TOKEN = {
  ...TOKEN,
  SEQUENCE: "SEQUENCE",
  SCALAR: "SCALAR",
  INDENT: "INDENT",
  DEDENT: "DEDENT",
} as const;

const tokenize = (content: string): [string, string][] => {
  // add a line break at the start of the content for easier handling indent
  // replace all \r\n with \n for Windows support
  content = "\n" + content.replace(/\r\n/g, "\n");
  let pos = 0;
  let indent = 0;
  let indents: number[] = [];
  const tokens: [string, string][] = [];
  const size = content.length;

  while (pos < size) {
    const start = pos;
    const char = content[pos++];
    if (char === CHAR_MAP.HASH) {
      // comment, just skip
      while (pos < size && content[pos] !== CHAR_MAP.LINE_BREAK) {
        pos++;
      }
    } else if (char === CHAR_MAP.LINE_BREAK) {
      while (pos < size && content[pos] === CHAR_MAP.SPACE) {
        indent++;
        pos++;
      }
      const lastIndent = indents[indents.length - 1] || 0;
      if (indent > lastIndent) {
        tokens.push([YAML_TOKEN.INDENT, CHAR_MAP.LINE_BREAK]);
        indents.push(indent);
      } else {
        while (indents.length > 0 && indent < indents[indents.length - 1]) {
          indents.pop();
          tokens.push([YAML_TOKEN.DEDENT, CHAR_MAP.LINE_BREAK]);
        }
      }
    } else if (
      char === CHAR_MAP.HYPHEN &&
      (content[pos] === CHAR_MAP.SPACE || content[pos] === CHAR_MAP.LINE_BREAK)
    ) {
      tokens.push([YAML_TOKEN.SEQUENCE, char]);
    } else if (char === CHAR_MAP.HASH && content[pos] === CHAR_MAP.SPACE) {
    }
  }
  return tokens;
};
