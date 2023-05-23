import { STATE, StateType, TOKEN_TYPE, Token } from "./types";
const SPACE = " ";
const LINE_BREAK = "\n";
const HASH = "#";
const END_TOKEN = {
  type: TOKEN_TYPE.END,
  indent: 0,
};

class Lexer {
  source: string;
  pos = 0;
  state: StateType = STATE.INITIAL;
  constructor(source: string) {
    this.source = source;
  }
  get isEnd() {
    return this.pos >= this.source.length;
  }
  get rest() {
    return this.source.slice(this.pos);
  }
  char() {
    return this.source[this.pos];
  }
  nextChar() {
    return this.source[this.pos + 1];
  }
  skipSpacesAndLineBreaks() {
    while (!this.isEnd) {
      if (this.char() === SPACE || this.char() === LINE_BREAK) {
        this.pos++;
      } else if (this.char() === "\r" && this.nextChar() === LINE_BREAK) {
        this.pos += 2;
      } else {
        break;
      }
    }
  }
  readWhiteSpaces() {
    let start = this.pos;
    while (!this.isEnd) {
      if (this.char() === SPACE) {
        this.pos++;
      } else {
        break;
      }
    }
    return this.pos - start;
  }
  readLineBreak() {
    if (this.char() === LINE_BREAK) {
      this.pos++;
      return true;
    } else if (this.char() === "\r" && this.nextChar() === LINE_BREAK) {
      this.pos += 2;
      return true;
    }
    return false;
  }
  readToken(): Token {
    if (this.isEnd) {
      return END_TOKEN;
    }
    switch (this.state) {
      case STATE.INITIAL:
        return this.readInitialToken();
      case STATE.YAML:
        return this.readYAMLToken();
      default:
        break;
    }
  }
  skipComment() {
    if (this.char() === HASH) {
      this.pos++;
      while (!this.isEnd) {
        this.pos++;
        if (this.char() === LINE_BREAK) {
          break;
        }
      }
      return true;
    }
    return false;
  }
  readYAMLToken(): Token {
    if (this.isEnd) {
      return {
        type: TOKEN_TYPE.END,
        indent: 0,
      };
    }
    const indent = this.readWhiteSpaces();
    if (this.readLineBreak() || this.skipComment()) {
      return this.readYAMLToken();
    }
  }
  readStr(str: string) {
    if (this.rest.startsWith(str)) {
      this.pos += str.length;
      return str.length;
    }
    return 0;
  }
  readInitialToken(): Token {
    this.skipSpacesAndLineBreaks();
    if (this.readStr(TOKEN_TYPE.MATTER_MARKER)) {
      this.state = STATE.YAML;
      return {
        type: TOKEN_TYPE.MATTER_MARKER,
        indent: 0,
      };
    }
    // TODO
    // return this.readContentToken();
  }
}
