export const isLineEnding = (input: string) => {
  if (input[0] === "\n") {
    return 1;
  } else if (input[0] === "\r" && input[1] === "\n") {
    return 2;
  }
  return 0;
};

export const isSpace = (input: string) => {
  if (input[0] === " " || input[0] === "\t") {
    return 1;
  }
  return 0;
};
