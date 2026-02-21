import { describe, expect, it } from "vitest";
import { keyBy } from "../src/utils/keyBy.js";

describe("keyBy", () => {
  const users = [
    { id: 1, name: "Ana" },
    { id: 2, name: "Juan" },
    { id: 3, name: "Luis" },
  ];

  it("should create a record keyed by the specified property", () => {
    const result = keyBy(users, "id");
    expect(result).toEqual({
      1: { id: 1, name: "Ana" },
      2: { id: 2, name: "Juan" },
      3: { id: 3, name: "Luis" },
    });
  });

  it("should create a record keyed by string property", () => {
    const result = keyBy(users, "name");
    expect(result).toEqual({
      Ana: { id: 1, name: "Ana" },
      Juan: { id: 2, name: "Juan" },
      Luis: { id: 3, name: "Luis" },
    });
  });

  it("should keep first match on duplicate keys", () => {
    const items = [
      { id: 1, name: "First" },
      { id: 1, name: "Second" },
    ];
    const result = keyBy(items, "id");
    expect(result[1]).toEqual({ id: 1, name: "First" });
  });

  it("should return empty record for empty input", () => {
    const result = keyBy([] as { id: number }[], "id");
    expect(result).toEqual({});
  });

  it("should not mutate the original array", () => {
    const original = [...users];
    keyBy(users, "id");
    expect(users).toEqual(original);
  });
});
