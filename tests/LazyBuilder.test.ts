import { describe, expect, it } from "vitest";
import { LazyBuilder, lazy } from "../src/joins/LazyBuilder.js";

type User = { id: number; name: string; active: boolean };
type Order = { orderId: number; userId: number; total: number };

const users: User[] = [
  { id: 1, name: "Ana", active: true },
  { id: 2, name: "Juan", active: false },
  { id: 3, name: "Luis", active: true },
  { id: 4, name: "Maria", active: true },
];

const orders: Order[] = [
  { orderId: 101, userId: 1, total: 50 },
  { orderId: 102, userId: 1, total: 100 },
  { orderId: 103, userId: 3, total: 75 },
];

describe("lazy / LazyBuilder", () => {
  it("should create LazyBuilder instance", () => {
    const builder = lazy(users);
    expect(builder).toBeInstanceOf(LazyBuilder);
  });

  it("should return source when no operations are added", () => {
    const result = lazy(users).run();
    expect(result).toEqual(users);
  });

  it("should filter items", () => {
    const result = lazy(users)
      .filter((u) => u.active)
      .run();

    expect(result).toEqual([
      { id: 1, name: "Ana", active: true },
      { id: 3, name: "Luis", active: true },
      { id: 4, name: "Maria", active: true },
    ]);
  });

  it("should map items", () => {
    const result = lazy(users)
      .map((u) => ({ id: u.id, upper: u.name.toUpperCase() }))
      .run();

    expect(result).toEqual([
      { id: 1, upper: "ANA" },
      { id: 2, upper: "JUAN" },
      { id: 3, upper: "LUIS" },
      { id: 4, upper: "MARIA" },
    ]);
  });

  it("should sort items", () => {
    const result = lazy(users).sortBy("name").run();

    expect(result.map((u) => u.name)).toEqual(["Ana", "Juan", "Luis", "Maria"]);
  });

  it("should take first N items", () => {
    const result = lazy(users).take(2).run();
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Ana");
    expect(result[1].name).toBe("Juan");
  });

  it("should skip first N items", () => {
    const result = lazy(users).skip(2).run();
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Luis");
    expect(result[1].name).toBe("Maria");
  });

  it("should attach children", () => {
    const result = lazy(users)
      .attachChildren({
        children: orders,
        parentKey: "id",
        childKey: "userId",
        as: "orders",
      })
      .run();

    expect(result[0].orders).toEqual([
      { orderId: 101, userId: 1, total: 50 },
      { orderId: 102, userId: 1, total: 100 },
    ]);
    expect(result[1].orders).toEqual([]);
    expect(result[2].orders).toEqual([{ orderId: 103, userId: 3, total: 75 }]);
  });

  it("should chain multiple operations", () => {
    const result = lazy(users)
      .filter((u) => u.active)
      .attachChildren({
        children: orders,
        parentKey: "id",
        childKey: "userId",
        as: "orders",
      })
      .filter((u) => u.orders.length > 0)
      .sortBy("name")
      .run();

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Ana");
    expect(result[1].name).toBe("Luis");
  });

  it("should not mutate original array", () => {
    const original = [...users];
    lazy(users)
      .filter((u) => u.active)
      .sortBy("name")
      .run();
    expect(users).toEqual(original);
  });

  it("should support take + skip for pagination", () => {
    const page2 = lazy(users).skip(2).take(2).run();
    expect(page2).toHaveLength(2);
    expect(page2[0].name).toBe("Luis");
  });
});
