import { describe, expect, it } from "vitest";
import { uniqueBy } from "../src/utils/uniqueBy.js";

describe("uniqueBy", () => {
  const users = [
    { id: 1, name: "Ana", role: "admin" },
    { id: 2, name: "Juan", role: "user" },
    { id: 3, name: "Luis", role: "admin" },
    { id: 1, name: "Ana Duplicate", role: "editor" },
  ];

  it("should deduplicate by key, keeping first match", () => {
    const result = uniqueBy(users, "id");
    expect(result).toEqual([
      { id: 1, name: "Ana", role: "admin" },
      { id: 2, name: "Juan", role: "user" },
      { id: 3, name: "Luis", role: "admin" },
    ]);
  });

  it("should deduplicate by string key", () => {
    const result = uniqueBy(users, "role");
    expect(result).toEqual([
      { id: 1, name: "Ana", role: "admin" },
      { id: 2, name: "Juan", role: "user" },
      { id: 1, name: "Ana Duplicate", role: "editor" },
    ]);
  });

  it("should return empty array for empty input", () => {
    const result = uniqueBy([], "id" as never);
    expect(result).toEqual([]);
  });

  it("should return all items when all keys are unique", () => {
    const items = [
      { id: 1, name: "a" },
      { id: 2, name: "b" },
      { id: 3, name: "c" },
    ];
    const result = uniqueBy(items, "id");
    expect(result).toEqual(items);
  });

  it("should not mutate the original array", () => {
    const original = [...users];
    uniqueBy(users, "id");
    expect(users).toEqual(original);
  });
});
