import { parseByRegex, ok, err } from "./utils";
import { Result, FrontMatter } from "./types";
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

export const parseMatter = (content: string): Result<FrontMatter> => {
  const result = parseByRegex(content, MATTER_START);
  if (!result.ok) return err();
  const head = result.value;
  const tailIndex = content.indexOf(MATTER_END, head.length - 1);
  if (tailIndex === -1) {
    return err("Missing closing matter tag");
  }
  const matterString = content.slice(head.length, tailIndex);
  const rest = content.slice(tailIndex + MATTER_END.length);
  // TODO: support JS Object
  // Try to parse front matter as JSON
  try {
    const value: FrontMatter = JSON.parse(matterString);
    if (Object.prototype.toString.call(value) === "[object Object]") {
      return {
        value,
        rest,
      };
    }
  } catch (err) {}

  // const result = readYAML(matter);
};
