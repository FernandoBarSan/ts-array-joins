import { describe, expect, it } from "vitest";
import { createNestedGroups, getFromNestedGroups } from "../../src/utils/nestedGroup.js";

type Item = { a: string; b: string; value: number };

describe("createNestedGroups", () => {
  const items: Item[] = [
    { a: "x", b: "1", value: 10 },
    { a: "x", b: "2", value: 20 },
    { a: "y", b: "1", value: 30 },
    { a: "x", b: "1", value: 40 },
  ];

  it("should group by single key", () => {
    const result = createNestedGroups(items, ["a"]);

    expect(result.x).toHaveLength(3);
    expect(result.y).toHaveLength(1);
  });

  it("should create nested groups with two keys", () => {
    const result = createNestedGroups(items, ["a", "b"]);

    expect(result.x["1"]).toHaveLength(2);
    expect(result.x["2"]).toHaveLength(1);
    expect(result.y["1"]).toHaveLength(1);
  });

  it("should return items directly when keys is empty", () => {
    const result = createNestedGroups(items, []);
    expect(result).toEqual(items);
  });

  it("should handle empty items", () => {
    const result = createNestedGroups([] as Item[], ["a"]);
    expect(result).toEqual({});
  });
});

describe("getFromNestedGroups", () => {
  const items: Item[] = [
    { a: "x", b: "1", value: 10 },
    { a: "x", b: "1", value: 40 },
    { a: "x", b: "2", value: 20 },
  ];

  it("should retrieve items at valid path", () => {
    const groups = createNestedGroups(items, ["a", "b"]);
    const result = getFromNestedGroups<Item>(groups, ["x", "1"]);

    expect(result).toHaveLength(2);
    expect(result[0].value).toBe(10);
    expect(result[1].value).toBe(40);
  });

  it("should return empty array for invalid path", () => {
    const groups = createNestedGroups(items, ["a", "b"]);
    const result = getFromNestedGroups<Item>(groups, ["z", "1"]);

    expect(result).toEqual([]);
  });

  it("should return empty array for partially valid path", () => {
    const groups = createNestedGroups(items, ["a", "b"]);
    const result = getFromNestedGroups<Item>(groups, ["x", "99"]);

    expect(result).toEqual([]);
  });

  it("should return empty array for empty path on object", () => {
    const groups = createNestedGroups(items, ["a"]);
    const result = getFromNestedGroups<Item>(groups, []);

    expect(result).toEqual([]);
  });

  it("should handle null/undefined in nested groups", () => {
    const result = getFromNestedGroups<Item>(null, ["a"]);
    expect(result).toEqual([]);
  });
});
