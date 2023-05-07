export const readByRegex = (content: string, regex: RegExp) => {
  const result = regex.exec(content);
  if (!result) return null;
  return result[0];
};
