import { describe, expect, it } from "vitest";
import { innerJoin } from "../src/joins/innerJoin.js";

type User = { id: number; name: string };
type Order = { id: number; userId: number; total: number };

describe("innerJoin", () => {
  const users: User[] = [
    { id: 1, name: "Ana" },
    { id: 2, name: "Juan" },
    { id: 3, name: "Luis" },
  ];

  const orders: Order[] = [
    { id: 101, userId: 1, total: 50 },
    { id: 102, userId: 1, total: 100 },
    { id: 103, userId: 2, total: 75 },
  ];

  it("should only return parents with matching children", () => {
    const result = innerJoin({
      parents: users,
      children: orders,
      parentKey: "id",
      childKey: "userId",
      as: "orders",
    });

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Ana");
    expect(result[0].orders).toHaveLength(2);
    expect(result[1].name).toBe("Juan");
    expect(result[1].orders).toHaveLength(1);
  });

  it("should exclude parents without matches", () => {
    const result = innerJoin({
      parents: users,
      children: orders,
      parentKey: "id",
      childKey: "userId",
      as: "orders",
    });

    const luis = result.find((u) => u.name === "Luis");
    expect(luis).toBeUndefined();
  });

  it("should return empty array when no matches exist", () => {
    const result = innerJoin({
      parents: [{ id: 99, name: "Nobody" }],
      children: orders,
      parentKey: "id",
      childKey: "userId",
      as: "orders",
    });

    expect(result).toEqual([]);
  });

  it("should return empty array when children is empty", () => {
    const result = innerJoin({
      parents: users,
      children: [] as Order[],
      parentKey: "id",
      childKey: "userId",
      as: "orders",
    });

    expect(result).toEqual([]);
  });

  it("should return empty array when parents is empty", () => {
    const result = innerJoin({
      parents: [] as User[],
      children: orders,
      parentKey: "id",
      childKey: "userId",
      as: "orders",
    });

    expect(result).toEqual([]);
  });

  it("should return all parents when all have matches", () => {
    const allMatchOrders: Order[] = [
      { id: 1, userId: 1, total: 10 },
      { id: 2, userId: 2, total: 20 },
      { id: 3, userId: 3, total: 30 },
    ];

    const result = innerJoin({
      parents: users,
      children: allMatchOrders,
      parentKey: "id",
      childKey: "userId",
      as: "orders",
    });

    expect(result).toHaveLength(3);
  });

  it("should not mutate original arrays", () => {
    const parentsCopy = [...users];
    const childrenCopy = [...orders];

    innerJoin({
      parents: users,
      children: orders,
      parentKey: "id",
      childKey: "userId",
      as: "orders",
    });

    expect(users).toEqual(parentsCopy);
    expect(orders).toEqual(childrenCopy);
  });
});
