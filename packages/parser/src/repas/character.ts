export const isSpace = (char: string) => {
  if (char === " " || char === "\t") {
    return true;
  }
  return false;
};

export const isNewline = (char: string) => {
  if (char === "\n") {
    return true;
  }
  return false;
};

export const isLineEnding = (char: string) => {
  if (char === "\n" || char === "\r") {
    return true;
  }
  return false;
};
