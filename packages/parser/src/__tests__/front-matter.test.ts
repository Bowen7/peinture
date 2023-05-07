import { describe, it, expect } from "vitest";
import { readMatter } from "../frontMatter";

describe("read YAML", () => {
  it("return null", () => {
    const content = `
--
title: Hello World
`.trim();
    expect(readMatter(content, 0)).toEqual(null);
  });

  it("throw error", () => {
    const content = `
---
title: Hello World
`.trim();
    expect(() => readMatter(content, 0)).toThrowError(Error);
  });

  it("read string value", () => {
    const content = `
---
title: Hello World
---
`.trim();
    expect(readMatter(content, 0)).toEqual({
      value: { title: "Hello World" },
      start: 0,
      end: content.length,
    });
  });

  it("read boolean value", () => {
    const content = `
---
title: true
---
`.trim();
    expect(readMatter(content, 0)).toEqual({
      value: { title: true },
      start: 0,
      end: content.length,
    });
  });

  it("read number value", () => {
    const content = `
---
title: 123
---
`.trim();
    expect(readMatter(content, 0)).toEqual({
      value: { title: 123 },
      start: 0,
      end: content.length,
    });
  });

  it("read multiple lines value", () => {
    const content = `
---
title: Hello World
isYAML: true
level: 0
---
`.trim();
    expect(readMatter(content, 0)).toEqual({
      value: { title: "Hello World", isYAML: true, level: 0 },
      start: 0,
      end: content.length,
    });
  });
});

describe("read JSON", () => {
  it("read nested JSON", () => {
    const content = `
---
{
  "title": "Hello World",
  "nested": {
    "isNested": true,
    "level": 1
  }
}
---
`.trim();
    expect(readMatter(content, 0)).toEqual({
      value: {
        title: "Hello World",
        nested: {
          isNested: true,
          level: 1,
        },
      },
      start: 0,
      end: content.length,
    });
  });
});
