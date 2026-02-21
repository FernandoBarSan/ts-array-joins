import { describe, expect, it } from "vitest";
import { diff, except, intersect } from "../src/utils/setOperations.js";

type User = { id: number; name: string };

const oldUsers: User[] = [
  { id: 1, name: "Ana" },
  { id: 2, name: "Juan" },
  { id: 3, name: "Luis" },
];

const newUsers: User[] = [
  { id: 2, name: "Juan Updated" },
  { id: 3, name: "Luis" },
  { id: 4, name: "Maria" },
];

describe("diff", () => {
  it("should return items in source but not in other", () => {
    const result = diff(newUsers, oldUsers, "id");
    expect(result).toEqual([{ id: 4, name: "Maria" }]);
  });

  it("should return items in old but not in new", () => {
    const result = diff(oldUsers, newUsers, "id");
    expect(result).toEqual([{ id: 1, name: "Ana" }]);
  });

  it("should return empty when all match", () => {
    const result = diff(oldUsers, oldUsers, "id");
    expect(result).toEqual([]);
  });

  it("should return all when nothing matches", () => {
    const a: User[] = [{ id: 1, name: "A" }];
    const b: User[] = [{ id: 2, name: "B" }];
    expect(diff(a, b, "id")).toEqual(a);
  });

  it("should handle empty arrays", () => {
    expect(diff([], oldUsers, "id")).toEqual([]);
    expect(diff(oldUsers, [], "id")).toEqual(oldUsers);
  });
});

describe("intersect", () => {
  it("should return items that exist in both arrays", () => {
    const result = intersect(oldUsers, newUsers, "id");
    expect(result).toEqual([
      { id: 2, name: "Juan" },
      { id: 3, name: "Luis" },
    ]);
  });

  it("should return items from source", () => {
    const result = intersect(newUsers, oldUsers, "id");
    expect(result).toEqual([
      { id: 2, name: "Juan Updated" },
      { id: 3, name: "Luis" },
    ]);
  });

  it("should return empty when nothing matches", () => {
    const a: User[] = [{ id: 1, name: "A" }];
    const b: User[] = [{ id: 2, name: "B" }];
    expect(intersect(a, b, "id")).toEqual([]);
  });

  it("should handle empty arrays", () => {
    expect(intersect([], oldUsers, "id")).toEqual([]);
    expect(intersect(oldUsers, [], "id")).toEqual([]);
  });
});

describe("except", () => {
  it("should work as an alias for diff", () => {
    const diffResult = diff(oldUsers, newUsers, "id");
    const exceptResult = except(oldUsers, newUsers, "id");
    expect(exceptResult).toEqual(diffResult);
  });

  it("should exclude matching items", () => {
    const result = except(oldUsers, newUsers, "id");
    expect(result).toEqual([{ id: 1, name: "Ana" }]);
  });
});
