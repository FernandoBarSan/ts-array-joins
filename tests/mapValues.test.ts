import { describe, expect, it } from "vitest";
import { mapValues } from "../src/utils/mapValues.js";

describe("mapValues", () => {
  it("should transform record values preserving keys", () => {
    const grouped = { admin: ["Ana", "Bob"], user: ["Carol"] };
    const result = mapValues(grouped, (users) => users.length);
    expect(result).toEqual({ admin: 2, user: 1 });
  });

  it("should pass key as second argument", () => {
    const record = { a: 1, b: 2 };
    const result = mapValues(record, (val, key) => `${key}:${val}`);
    expect(result).toEqual({ a: "a:1", b: "b:2" });
  });

  it("should handle empty record", () => {
    const result = mapValues({} as Record<string, number>, (v) => v * 2);
    expect(result).toEqual({});
  });

  it("should work with complex transformations", () => {
    const groups = {
      team1: [10, 20, 30],
      team2: [5, 15],
    };
    const result = mapValues(groups, (scores) => ({
      count: scores.length,
      total: scores.reduce((a, b) => a + b, 0),
    }));
    expect(result).toEqual({
      team1: { count: 3, total: 60 },
      team2: { count: 2, total: 20 },
    });
  });

  it("should not mutate the original record", () => {
    const record = { a: [1, 2], b: [3] };
    const original = { ...record };
    mapValues(record, (v) => v.length);
    expect(record).toEqual(original);
  });
});
