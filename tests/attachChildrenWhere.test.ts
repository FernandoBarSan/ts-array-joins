import { describe, expect, it } from "vitest";
import { attachChildrenWhere } from "../src/joins/attachChildrenWhere.js";

type User = { id: number; name: string; minAmount: number };
type Order = {
  id: number;
  userId: number;
  total: number;
  status: string;
};

describe("attachChildrenWhere", () => {
  const users: User[] = [
    { id: 1, name: "Ana", minAmount: 50 },
    { id: 2, name: "Juan", minAmount: 100 },
  ];

  const orders: Order[] = [
    { id: 1, userId: 1, total: 30, status: "active" },
    { id: 2, userId: 1, total: 80, status: "active" },
    { id: 3, userId: 1, total: 120, status: "cancelled" },
    { id: 4, userId: 2, total: 150, status: "active" },
    { id: 5, userId: 2, total: 50, status: "active" },
  ];

  it("should filter children by child property", () => {
    const result = attachChildrenWhere({
      parents: users,
      children: orders,
      parentKey: "id",
      childKey: "userId",
      as: "activeOrders",
      where: (order) => order.status === "active",
    });

    expect(result[0].activeOrders).toHaveLength(2);
    expect(result[0].activeOrders.every((o) => o.status === "active")).toBe(true);
    expect(result[1].activeOrders).toHaveLength(2);
  });

  it("should filter using parent context", () => {
    const result = attachChildrenWhere({
      parents: users,
      children: orders,
      parentKey: "id",
      childKey: "userId",
      as: "qualifiedOrders",
      where: (order, user) => order.total > user.minAmount && order.status === "active",
    });

    // Ana (minAmount: 50): only order with total 80 passes
    expect(result[0].qualifiedOrders).toHaveLength(1);
    expect(result[0].qualifiedOrders[0].total).toBe(80);

    // Juan (minAmount: 100): only order with total 150 passes
    expect(result[1].qualifiedOrders).toHaveLength(1);
    expect(result[1].qualifiedOrders[0].total).toBe(150);
  });

  it("should behave like attachChildren when predicate allows everything", () => {
    const result = attachChildrenWhere({
      parents: users,
      children: orders,
      parentKey: "id",
      childKey: "userId",
      as: "allOrders",
      where: () => true,
    });

    expect(result[0].allOrders).toHaveLength(3);
    expect(result[1].allOrders).toHaveLength(2);
  });

  it("should give empty arrays when predicate blocks everything", () => {
    const result = attachChildrenWhere({
      parents: users,
      children: orders,
      parentKey: "id",
      childKey: "userId",
      as: "noOrders",
      where: () => false,
    });

    expect(result[0].noOrders).toEqual([]);
    expect(result[1].noOrders).toEqual([]);
  });

  it("should handle empty arrays", () => {
    const result = attachChildrenWhere({
      parents: [] as User[],
      children: orders,
      parentKey: "id",
      childKey: "userId",
      as: "orders",
      where: () => true,
    });

    expect(result).toEqual([]);
  });

  it("should not mutate original arrays", () => {
    const parentsCopy = [...users];
    const childrenCopy = [...orders];

    attachChildrenWhere({
      parents: users,
      children: orders,
      parentKey: "id",
      childKey: "userId",
      as: "orders",
      where: (o) => o.status === "active",
    });

    expect(users).toEqual(parentsCopy);
    expect(orders).toEqual(childrenCopy);
  });
});
