import { describe, expect, it } from "vitest";
import { chunk, partition } from "../src/utils/chunk.js";

describe("chunk", () => {
  it("should split array into chunks of specified size", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("should handle exact division", () => {
    expect(chunk([1, 2, 3, 4], 2)).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it("should handle chunk size larger than array", () => {
    expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
  });

  it("should handle chunk size of 1", () => {
    expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
  });

  it("should return empty array for empty input", () => {
    expect(chunk([], 3)).toEqual([]);
  });

  it("should throw for chunk size < 1", () => {
    expect(() => chunk([1, 2], 0)).toThrow("Chunk size must be at least 1");
  });

  it("should not mutate the original array", () => {
    const arr = [1, 2, 3, 4, 5];
    const original = [...arr];
    chunk(arr, 2);
    expect(arr).toEqual(original);
  });
});

describe("partition", () => {
  it("should split by predicate into [pass, fail]", () => {
    const [even, odd] = partition([1, 2, 3, 4, 5], (n) => n % 2 === 0);
    expect(even).toEqual([2, 4]);
    expect(odd).toEqual([1, 3, 5]);
  });

  it("should handle all items matching", () => {
    const [pass, fail] = partition([2, 4, 6], (n) => n % 2 === 0);
    expect(pass).toEqual([2, 4, 6]);
    expect(fail).toEqual([]);
  });

  it("should handle no items matching", () => {
    const [pass, fail] = partition([1, 3, 5], (n) => n % 2 === 0);
    expect(pass).toEqual([]);
    expect(fail).toEqual([1, 3, 5]);
  });

  it("should handle empty array", () => {
    const [pass, fail] = partition([], () => true);
    expect(pass).toEqual([]);
    expect(fail).toEqual([]);
  });

  it("should work with objects", () => {
    const users = [
      { id: 1, active: true },
      { id: 2, active: false },
      { id: 3, active: true },
    ];
    const [active, inactive] = partition(users, (u) => u.active);
    expect(active).toEqual([
      { id: 1, active: true },
      { id: 3, active: true },
    ]);
    expect(inactive).toEqual([{ id: 2, active: false }]);
  });
});
