import { describe, expect, it } from "vitest";
import { omit, pick } from "../src/utils/pickOmit.js";

const users = [
  { id: 1, name: "Ana", email: "ana@test.com", password: "secret" },
  { id: 2, name: "Juan", email: "juan@test.com", password: "hidden" },
];

describe("pick", () => {
  it("should keep only specified properties", () => {
    const result = pick(users, ["id", "name"]);
    expect(result).toEqual([
      { id: 1, name: "Ana" },
      { id: 2, name: "Juan" },
    ]);
  });

  it("should handle single key", () => {
    const result = pick(users, ["name"]);
    expect(result).toEqual([{ name: "Ana" }, { name: "Juan" }]);
  });

  it("should handle empty array", () => {
    const result = pick([] as typeof users, ["id"]);
    expect(result).toEqual([]);
  });

  it("should not mutate original array", () => {
    const original = JSON.parse(JSON.stringify(users));
    pick(users, ["id"]);
    expect(users).toEqual(original);
  });
});

describe("omit", () => {
  it("should remove specified properties", () => {
    const result = omit(users, ["password"]);
    expect(result).toEqual([
      { id: 1, name: "Ana", email: "ana@test.com" },
      { id: 2, name: "Juan", email: "juan@test.com" },
    ]);
  });

  it("should remove multiple properties", () => {
    const result = omit(users, ["password", "email"]);
    expect(result).toEqual([
      { id: 1, name: "Ana" },
      { id: 2, name: "Juan" },
    ]);
  });

  it("should handle empty array", () => {
    const result = omit([] as typeof users, ["password"]);
    expect(result).toEqual([]);
  });

  it("should not include omitted keys in result objects", () => {
    const result = omit(users, ["password", "email"]);
    for (const item of result) {
      expect(item).not.toHaveProperty("password");
      expect(item).not.toHaveProperty("email");
    }
  });

  it("should not mutate original array", () => {
    const original = JSON.parse(JSON.stringify(users));
    omit(users, ["password"]);
    expect(users).toEqual(original);
  });
});
