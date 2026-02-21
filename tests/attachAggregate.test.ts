import { describe, expect, it } from "vitest";
import { attachAggregate } from "../src/joins/attachAggregate.js";

type User = { id: number; name: string };
type Order = { id: number; userId: number; total: number };

describe("attachAggregate", () => {
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

  it("should compute sum aggregation", () => {
    const result = attachAggregate({
      parents: users,
      children: orders,
      parentKey: "id",
      childKey: "userId",
      as: "orderTotal",
      aggregate: (orders) => orders.reduce((sum, o) => sum + o.total, 0),
    });

    expect(result[0].orderTotal).toBe(150);
    expect(result[1].orderTotal).toBe(75);
    expect(result[2].orderTotal).toBe(0);
  });

  it("should compute count aggregation", () => {
    const result = attachAggregate({
      parents: users,
      children: orders,
      parentKey: "id",
      childKey: "userId",
      as: "orderCount",
      aggregate: (orders) => orders.length,
    });

    expect(result[0].orderCount).toBe(2);
    expect(result[1].orderCount).toBe(1);
    expect(result[2].orderCount).toBe(0);
  });

  it("should compute complex aggregation", () => {
    const result = attachAggregate({
      parents: users,
      children: orders,
      parentKey: "id",
      childKey: "userId",
      as: "stats",
      aggregate: (orders) => ({
        count: orders.length,
        total: orders.reduce((s, o) => s + o.total, 0),
        avg: orders.length > 0 ? orders.reduce((s, o) => s + o.total, 0) / orders.length : 0,
      }),
    });

    expect(result[0].stats).toEqual({ count: 2, total: 150, avg: 75 });
    expect(result[1].stats).toEqual({ count: 1, total: 75, avg: 75 });
    expect(result[2].stats).toEqual({ count: 0, total: 0, avg: 0 });
  });

  it("should pass empty array to aggregate when no matches", () => {
    const result = attachAggregate({
      parents: [{ id: 99, name: "Nobody" }],
      children: orders,
      parentKey: "id",
      childKey: "userId",
      as: "orderCount",
      aggregate: (orders) => orders.length,
    });

    expect(result[0].orderCount).toBe(0);
  });

  it("should handle empty parents", () => {
    const result = attachAggregate({
      parents: [] as User[],
      children: orders,
      parentKey: "id",
      childKey: "userId",
      as: "total",
      aggregate: (o) => o.length,
    });

    expect(result).toEqual([]);
  });

  it("should not mutate original arrays", () => {
    const parentsCopy = [...users];
    const childrenCopy = [...orders];

    attachAggregate({
      parents: users,
      children: orders,
      parentKey: "id",
      childKey: "userId",
      as: "total",
      aggregate: (o) => o.length,
    });

    expect(users).toEqual(parentsCopy);
    expect(orders).toEqual(childrenCopy);
  });
});
