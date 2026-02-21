import { describe, expect, it } from "vitest";
import { IndexCache } from "../src/utils/IndexCache.js";

type User = { id: number; name: string; role: string };

const users: User[] = [
  { id: 1, name: "Ana", role: "admin" },
  { id: 2, name: "Juan", role: "user" },
  { id: 3, name: "Luis", role: "admin" },
];

describe("IndexCache", () => {
  describe("indexMany", () => {
    it("should create a one-to-many index", () => {
      const cache = new IndexCache();
      const byRole = cache.indexMany(users, "role");

      expect(byRole.get("admin")).toEqual([
        { id: 1, name: "Ana", role: "admin" },
        { id: 3, name: "Luis", role: "admin" },
      ]);
      expect(byRole.get("user")).toEqual([{ id: 2, name: "Juan", role: "user" }]);
    });

    it("should return the same Map instance on cache hit", () => {
      const cache = new IndexCache();
      const first = cache.indexMany(users, "role");
      const second = cache.indexMany(users, "role");
      expect(first).toBe(second);
    });

    it("should create separate indices for different keys", () => {
      const cache = new IndexCache();
      const byRole = cache.indexMany(users, "role");
      const byId = cache.indexMany(users, "id");

      expect(byRole).not.toBe(byId);
      expect(byRole.get("admin")).toHaveLength(2);
      expect(byId.get(1)).toEqual([{ id: 1, name: "Ana", role: "admin" }]);
    });
  });

  describe("indexOne", () => {
    it("should create a one-to-one index", () => {
      const cache = new IndexCache();
      const byId = cache.indexOne(users, "id");

      expect(byId.get(1)).toEqual({ id: 1, name: "Ana", role: "admin" });
      expect(byId.get(2)).toEqual({ id: 2, name: "Juan", role: "user" });
    });

    it("should return the same Map instance on cache hit", () => {
      const cache = new IndexCache();
      const first = cache.indexOne(users, "id");
      const second = cache.indexOne(users, "id");
      expect(first).toBe(second);
    });

    it("should keep last item on duplicate keys", () => {
      const items = [
        { id: 1, name: "First" },
        { id: 1, name: "Second" },
      ];
      const cache = new IndexCache();
      const byId = cache.indexOne(items, "id");
      expect(byId.get(1)).toEqual({ id: 1, name: "Second" });
    });
  });

  it("should handle empty arrays", () => {
    const cache = new IndexCache();
    const empty: User[] = [];
    const byRole = cache.indexMany(empty, "role");
    expect(byRole.size).toBe(0);
  });
});
