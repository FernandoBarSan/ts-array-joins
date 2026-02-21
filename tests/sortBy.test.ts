import { describe, expect, it } from "vitest";
import { comparatorBy, sortBy } from "../src/utils/sortBy.js";

type User = { id: number; name: string; age: number };
type WithNull = { id: number; name: string | null; score: number | undefined };

describe("sortBy", () => {
  const users: User[] = [
    { id: 3, name: "Carlos", age: 30 },
    { id: 1, name: "Ana", age: 25 },
    { id: 2, name: "Bruno", age: 35 },
    { id: 4, name: "Ana", age: 20 },
  ];

  it("should sort ascending by a single string key", () => {
    const result = sortBy(users, "name");

    expect(result.map((u) => u.name)).toEqual(["Ana", "Ana", "Bruno", "Carlos"]);
  });

  it("should sort descending with - prefix", () => {
    const result = sortBy(users, "-age");

    expect(result.map((u) => u.age)).toEqual([35, 30, 25, 20]);
  });

  it("should sort descending with object syntax", () => {
    const result = sortBy(users, { key: "age", order: "desc" });

    expect(result.map((u) => u.age)).toEqual([35, 30, 25, 20]);
  });

  it("should sort by multiple criteria (primary + secondary)", () => {
    const result = sortBy(users, "name", "age");

    expect(result.map((u) => ({ name: u.name, age: u.age }))).toEqual([
      { name: "Ana", age: 20 },
      { name: "Ana", age: 25 },
      { name: "Bruno", age: 35 },
      { name: "Carlos", age: 30 },
    ]);
  });

  it("should sort by multiple criteria with mixed directions", () => {
    const result = sortBy(users, "name", "-age");

    expect(result.map((u) => ({ name: u.name, age: u.age }))).toEqual([
      { name: "Ana", age: 25 },
      { name: "Ana", age: 20 },
      { name: "Bruno", age: 35 },
      { name: "Carlos", age: 30 },
    ]);
  });

  it("should support case-insensitive string sorting", () => {
    type Item = { label: string };
    const items: Item[] = [{ label: "banana" }, { label: "Apple" }, { label: "cherry" }];

    const result = sortBy(items, { key: "label", caseInsensitive: true });

    expect(result.map((i) => i.label)).toEqual(["Apple", "banana", "cherry"]);
  });

  it("should sort numbers correctly", () => {
    const result = sortBy(users, "id");

    expect(result.map((u) => u.id)).toEqual([1, 2, 3, 4]);
  });

  it("should place null and undefined values last", () => {
    const items: WithNull[] = [
      { id: 1, name: null, score: undefined },
      { id: 2, name: "Zoe", score: 90 },
      { id: 3, name: "Ana", score: 100 },
      { id: 4, name: null, score: 80 },
    ];

    const byName = sortBy(items, "name");
    expect(byName.map((i) => i.name)).toEqual(["Ana", "Zoe", null, null]);

    const byScore = sortBy(items, "score");
    expect(byScore.map((i) => i.score)).toEqual([80, 90, 100, undefined]);
  });

  it("should return empty array for empty input", () => {
    const result = sortBy([] as User[], "name");

    expect(result).toEqual([]);
  });

  it("should not mutate the original array", () => {
    const copy = [...users];

    sortBy(users, "name");

    expect(users).toEqual(copy);
  });

  it("should mix string and object criteria", () => {
    const result = sortBy(users, { key: "name", caseInsensitive: true }, "-age");

    expect(result.map((u) => ({ name: u.name, age: u.age }))).toEqual([
      { name: "Ana", age: 25 },
      { name: "Ana", age: 20 },
      { name: "Bruno", age: 35 },
      { name: "Carlos", age: 30 },
    ]);
  });

  it("should handle single-element array", () => {
    const result = sortBy([users[0]], "name");

    expect(result).toEqual([users[0]]);
  });

  it("should handle all equal values for a key", () => {
    type Item = { group: string; value: number };
    const items: Item[] = [
      { group: "A", value: 3 },
      { group: "A", value: 1 },
      { group: "A", value: 2 },
    ];

    const result = sortBy(items, "group", "value");

    expect(result.map((i) => i.value)).toEqual([1, 2, 3]);
  });
});

describe("comparatorBy", () => {
  const users: User[] = [
    { id: 3, name: "Carlos", age: 30 },
    { id: 1, name: "Ana", age: 25 },
    { id: 2, name: "Bruno", age: 35 },
  ];

  it("should return a comparator function for use with .sort()", () => {
    const sorted = [...users].sort(comparatorBy("name"));

    expect(sorted.map((u) => u.name)).toEqual(["Ana", "Bruno", "Carlos"]);
  });

  it("should support multiple criteria", () => {
    const items: User[] = [
      { id: 1, name: "Ana", age: 30 },
      { id: 2, name: "Ana", age: 20 },
      { id: 3, name: "Bruno", age: 25 },
    ];

    const sorted = [...items].sort(comparatorBy("name", "age"));

    expect(sorted.map((u) => u.age)).toEqual([20, 30, 25]);
  });

  it("should support descending with - prefix", () => {
    const sorted = [...users].sort(comparatorBy<User>("-age"));

    expect(sorted.map((u) => u.age)).toEqual([35, 30, 25]);
  });
});
