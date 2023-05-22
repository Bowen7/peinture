import { CHAR_MAP } from "./utils";

type PrimitiveType = string | number | boolean | null;
type YAMLSequence = (PrimitiveType | YAMLSequence | YAMLMap)[];
type YAMLMap = {
  [key: string]: PrimitiveType | YAMLSequence | YAMLMap;
};
type MapParent = {
  type: "map";
  indent: number;
  value: YAMLMap;
};
type SequenceParent = { type: "sequence"; indent: number; value: YAMLSequence };
type UnknownParent = { type: "unknown"; indent: number; value: null };

class Parser {
  source: string;
  size = 0;
  pos = 0;
  value: YAMLSequence | YAMLMap | null = null;
  parents: (MapParent | SequenceParent | UnknownParent)[];
  indent = 0;
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
    return this.parents[this.parents.length - 1]?.indent || 0;
  }
  get lastParent() {
    return this.parents.length > 0
      ? this.parents[this.parents.length - 1]
      : null;
  }

  parse() {
    while (!this.isEnd) {
      if (!this.readIndent()) {
        continue;
      }
      if (this.peekSequence()) {
        this.readSequence();
      }
    }
  }

  peekSequence() {
    return (
      this.char === CHAR_MAP.HYPHEN &&
      (this.nextChar === CHAR_MAP.SPACE ||
        this.nextChar === CHAR_MAP.LINE_BREAK ||
        this.nextChar === undefined)
    );
  }

  readIndent() {
    const indent = this.readWhiteSpaces();
    if (this.readLineBreak()) {
      return false;
    }
    // just skip comment
    if (this.readComment()) {
      return false;
    }
    const lastIndent = this.lastIndent + (this.peekSequence() ? 1 : 0);
    this.indent = indent;
    if (indent < lastIndent) {
      while (this.parents.length > 0 && indent < this.lastIndent) {
        this.parents.pop();
      }
    }
    return true;
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

  readLine() {
    const start = this.pos;
    while (!this.isEnd && this.char !== CHAR_MAP.LINE_BREAK) {
      this.pos++;
    }
    return this.source.slice(start, this.pos).trim();
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
      this.throwError(str);
    }
  }

  throwError(message: string, pos = this.pos) {
    throw new Error(`${message} at ${this.at(pos)}`);
  }

  at(pos: number) {
    const head = this.source.slice(0, pos + 1);
    const tail = this.source.slice(pos - 1);
    const prevLinkBreak = head.lastIndexOf(CHAR_MAP.LINE_BREAK);
    const nextLinkBreak = tail.indexOf(CHAR_MAP.LINE_BREAK) || tail.length;
    return head.slice(prevLinkBreak + 1) + "^^^" + tail.slice(0, nextLinkBreak);
  }

  readYAMLMapKey() {
    const scalar = this.readScalar();
    if (scalar === "") {
      return "";
    }
    this.expect(":");
    if (this.char !== CHAR_MAP.SPACE && this.char !== CHAR_MAP.LINE_BREAK) {
      this.throwError("Expected space or line break");
    }
    return scalar;
  }

  readSequence() {
    const start = this.pos;
    // HYPHEN
    this.pos++;
    const value = this.readLine() || null;
    if (!this.value) {
      this.value = [value];
      this.parents.push({
        type: "sequence",
        indent: this.indent,
        value: this.value,
      });
    } else {
      const lastParent = this.lastParent;
      if (lastParent?.type === "sequence") {
        lastParent.value.push(value);
      } else if (lastParent?.type === "unknown") {
        this.parents[this.parents.length - 1] = {
          type: "sequence",
          indent: lastParent.indent,
          value: [value],
        };
      } else {
        this.throwError("Unexpected sequence", start);
      }
    }
  }

  readObjectKey() {}
}
