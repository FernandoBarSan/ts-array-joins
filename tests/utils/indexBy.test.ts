import { describe, expect, it } from "vitest";
import { indexMany, indexOne } from "../../src/utils/indexBy.js";

describe("indexMany", () => {
  it("should group items by key extractor", () => {
    const items = [
      { id: 1, category: "A" },
      { id: 2, category: "B" },
      { id: 3, category: "A" },
    ];

    const result = indexMany(items, (i) => i.category);

    expect(result.get("A")).toHaveLength(2);
    expect(result.get("B")).toHaveLength(1);
  });

  it("should return empty map for empty array", () => {
    const result = indexMany([], (x: number) => x);
    expect(result.size).toBe(0);
  });

  it("should handle numeric keys", () => {
    const items = [
      { userId: 1, name: "a" },
      { userId: 1, name: "b" },
      { userId: 2, name: "c" },
    ];

    const result = indexMany(items, (i) => i.userId);

    expect(result.get(1)).toHaveLength(2);
    expect(result.get(2)).toHaveLength(1);
  });

  it("should preserve insertion order within groups", () => {
    const items = [
      { id: 1, g: "A" },
      { id: 2, g: "A" },
      { id: 3, g: "A" },
    ];

    const result = indexMany(items, (i) => i.g);
    const group = result.get("A")!;

    expect(group[0].id).toBe(1);
    expect(group[1].id).toBe(2);
    expect(group[2].id).toBe(3);
  });
});

describe("indexOne", () => {
  it("should store first match per key", () => {
    const items = [
      { userId: 1, city: "Madrid" },
      { userId: 1, city: "Barcelona" },
      { userId: 2, city: "Sevilla" },
    ];

    const result = indexOne(items, (i) => i.userId);

    expect(result.get(1)!.city).toBe("Madrid");
    expect(result.get(2)!.city).toBe("Sevilla");
  });

  it("should return empty map for empty array", () => {
    const result = indexOne([], (x: number) => x);
    expect(result.size).toBe(0);
  });

  it("should return undefined for missing key", () => {
    const items = [{ id: 1, name: "a" }];

    const result = indexOne(items, (i) => i.id);

    expect(result.get(999)).toBeUndefined();
  });

  it("should use first-match-wins consistently", () => {
    const items = [
      { key: "x", order: 1 },
      { key: "x", order: 2 },
      { key: "x", order: 3 },
    ];

    const result = indexOne(items, (i) => i.key);

    expect(result.get("x")!.order).toBe(1);
  });
});
