import { readByRegex } from "./utils";
import { ReadResult, FrontMatter } from "./types";
const MATTER_START = /^---\s*\n/;
const MATTER_END = "\n---";
const YAML_KEY = /^([a-z0-9_-]+):\s*/i;

const readYAML = (content: string): FrontMatter => {
  const lines = content.split("\n");
  const result: FrontMatter = {};
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(YAML_KEY);
    if (!match) {
      if (line.trim() !== "") {
        throw new Error(`Invalid YAML: ${line}`);
      }
      continue;
    }
    const key = match[1];
    let value = line.slice(match[0].length);
    try {
      value = JSON.parse(value);
    } catch (error) {
      value = value.trim();
    }
    result[key] = value;
  }
  return result;
};

export const readMatter = (
  content: string,
  index: number
): ReadResult<FrontMatter> => {
  const matterStart = readByRegex(content.slice(index), MATTER_START);
  if (!matterStart) return null;
  const matterEndIndex = content.indexOf(
    MATTER_END,
    index + matterStart.length - 1
  );
  if (matterEndIndex === -1) {
    throw new Error(`Missing closing matter tag`);
  }
  const matterContent = content.slice(
    index + matterStart.length,
    matterEndIndex
  );
  const end = matterEndIndex + MATTER_END.length;
  // TODO: support JS Object
  // try to parse front matter as JSON
  try {
    const value: FrontMatter = JSON.parse(matterContent);
    if (Object.prototype.toString.call(value) === "[object Object]") {
      return {
        value,
        start: index,
        end,
      };
    }
  } catch (err) {}

  const value = readYAML(matterContent);
  return {
    value,
    start: index,
    end,
  };
};
