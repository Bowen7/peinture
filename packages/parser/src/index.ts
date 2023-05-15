import { Result, TOKEN } from "./types";
import { ok, err, CHAR_MAP } from "./utils";

const YAML_TOKEN = {
  ...TOKEN,
  SEQUENCE: "SEQUENCE",
  SCALAR: "SCALAR",
  INDENT: "INDENT",
  DEDENT: "DEDENT",
  LEFT_BRACKET: "LEFT_BRACKET",
} as const;
class Parser {
  source: string;
  size = 0;
  pos = 0;
  indents: number[] = [];
  tokens: (keyof typeof YAML_TOKEN)[] = [];
  constructor(source: string) {
    this.source = source.replace(/\r\n/g, "\n");
    this.size = this.source.length;
  }
  get isEnd() {
    return this.pos >= this.size;
  }
  get char() {
    return this.source[this.pos];
  }
  get nextChar() {
    return this.source[this.pos + 1];
  }
  get lastIndent() {
    return this.indents[this.indents.length - 1] || 0;
  }

  parse() {
    while (!this.isEnd) {
      this.readIndent();
      if (this.readComment()) {
        continue;
      }
      if (this.readObject()) {
        continue;
      }
      const yamlKey = this.readYAMLKey();
      if (yamlKey) {
      }
    }
  }

  readIndent() {
    const indent = this.readWhiteSpaces();
    const lastIndent = this.lastIndent;
    if (indent > lastIndent) {
      this.indents.push(indent);
    } else if (indent < lastIndent) {
      while (this.indents.length > 0 && indent < this.lastIndent) {
        this.indents.pop();
        this.tokens.pop();
      }
    }
  }

  readWhiteSpaces() {
    const start = this.pos;
    while (!this.isEnd && this.char === CHAR_MAP.SPACE) {
      this.pos++;
    }
    return this.pos - start;
  }

  readLineBreak() {
    if (this.char === CHAR_MAP.LINE_BREAK) {
      this.pos++;
      return true;
    }
    return false;
  }

  readComment() {
    if (this.char === CHAR_MAP.HASH) {
      while (!this.isEnd && this.char !== CHAR_MAP.LINE_BREAK) {
        this.pos++;
      }
      return true;
    }
    return false;
  }

  readObject() {
    if (this.char === CHAR_MAP.HYPHEN) {
      this.pos++;

      return true;
    }
    return false;
  }

  readUntil() {}

  readScalar() {
    let scalar = "";
    while (!this.isEnd && this.char && this.char !== CHAR_MAP.LINE_BREAK) {
      if (this.char === CHAR_MAP.COLON && this.nextChar === CHAR_MAP.SPACE) {
        this.pos += 2;
        break;
      }
      // inline comment
      if (this.char === CHAR_MAP.SPACE && this.nextChar === CHAR_MAP.HASH) {
        this.pos++;
        this.readComment();
        break;
      }
      scalar += this.char;
      this.pos++;
    }
    return scalar.trim();
  }

  expect(str: string) {
    if (this.source.slice(this.pos, this.pos + str.length) === str) {
      this.pos += str.length;
    } else {
      this.error(str);
    }
  }

  error(str: string) {
    throw new Error(`Expected ${str} at ${this.at()}`);
  }

  at() {
    const head = this.source.slice(0, this.pos + 1);
    const tail = this.source.slice(this.pos - 1);
    const prevLinkBreak = head.lastIndexOf(CHAR_MAP.LINE_BREAK);
    const nextLinkBreak = tail.indexOf(CHAR_MAP.LINE_BREAK) || tail.length;
    return head.slice(prevLinkBreak + 1) + "^^^" + tail.slice(0, nextLinkBreak);
  }

  readYAMLKey() {
    const scalar = this.readScalar();
    if (scalar === "") {
      return "";
    }
    this.expect(":");
    if (this.char !== CHAR_MAP.SPACE && this.char !== CHAR_MAP.LINE_BREAK) {
      this.error("space or line break");
    }
    return scalar;
  }

  readObjectKey() {}
}
