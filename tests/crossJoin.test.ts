import { describe, expect, it } from "vitest";
import { crossJoin, crossJoinMerge } from "../src/joins/crossJoin.js";

describe("crossJoin", () => {
  it("should produce Cartesian product as {left, right} pairs", () => {
    const sizes = [{ size: "S" }, { size: "M" }];
    const colors = [{ color: "red" }, { color: "blue" }];

    const result = crossJoin(sizes, colors);
    expect(result).toEqual([
      { left: { size: "S" }, right: { color: "red" } },
      { left: { size: "S" }, right: { color: "blue" } },
      { left: { size: "M" }, right: { color: "red" } },
      { left: { size: "M" }, right: { color: "blue" } },
    ]);
  });

  it("should produce n*m results", () => {
    const a = [{ x: 1 }, { x: 2 }, { x: 3 }];
    const b = [{ y: 1 }, { y: 2 }];
    expect(crossJoin(a, b)).toHaveLength(6);
  });

  it("should return empty for empty left", () => {
    expect(crossJoin([], [{ a: 1 }])).toEqual([]);
  });

  it("should return empty for empty right", () => {
    expect(crossJoin([{ a: 1 }], [])).toEqual([]);
  });
});

describe("crossJoinMerge", () => {
  it("should produce Cartesian product with merged objects", () => {
    const sizes = [{ size: "S" }, { size: "M" }];
    const colors = [{ color: "red" }, { color: "blue" }];

    const result = crossJoinMerge(sizes, colors);
    expect(result).toEqual([
      { size: "S", color: "red" },
      { size: "S", color: "blue" },
      { size: "M", color: "red" },
      { size: "M", color: "blue" },
    ]);
  });

  it("should right-side override on key conflicts", () => {
    const a = [{ id: 1, name: "left" }];
    const b = [{ id: 2, extra: true }];

    const result = crossJoinMerge(a, b);
    expect(result).toEqual([{ id: 2, name: "left", extra: true }]);
  });

  it("should return empty for empty arrays", () => {
    expect(crossJoinMerge([], [])).toEqual([]);
  });
});
