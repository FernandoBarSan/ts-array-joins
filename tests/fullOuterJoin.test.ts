import { describe, expect, it } from "vitest";
import { fullOuterJoin } from "../src/joins/fullOuterJoin.js";

type User = { id: number; name: string };
type Order = { orderId: number; userId: number; total: number };

const users: User[] = [
  { id: 1, name: "Ana" },
  { id: 2, name: "Juan" },
  { id: 3, name: "Luis" },
];

const orders: Order[] = [
  { orderId: 101, userId: 1, total: 50 },
  { orderId: 102, userId: 1, total: 100 },
  { orderId: 103, userId: 2, total: 75 },
  { orderId: 104, userId: 99, total: 200 },
];

describe("fullOuterJoin", () => {
  it("should match left and right items", () => {
    const result = fullOuterJoin({
      left: users,
      right: orders,
      leftKey: "id",
      rightKey: "userId",
    });

    const matched = result.filter((r) => r.left !== null && r.right !== null);
    expect(matched).toHaveLength(3);
    expect(matched[0]).toEqual({
      left: { id: 1, name: "Ana" },
      right: { orderId: 101, userId: 1, total: 50 },
    });
  });

  it("should include unmatched left items with right = null", () => {
    const result = fullOuterJoin({
      left: users,
      right: orders,
      leftKey: "id",
      rightKey: "userId",
    });

    const unmatchedLeft = result.filter((r) => r.right === null);
    expect(unmatchedLeft).toEqual([{ left: { id: 3, name: "Luis" }, right: null }]);
  });

  it("should include unmatched right items with left = null", () => {
    const result = fullOuterJoin({
      left: users,
      right: orders,
      leftKey: "id",
      rightKey: "userId",
    });

    const unmatchedRight = result.filter((r) => r.left === null);
    expect(unmatchedRight).toEqual([
      { left: null, right: { orderId: 104, userId: 99, total: 200 } },
    ]);
  });

  it("should create one row per left-right combination", () => {
    const result = fullOuterJoin({
      left: users,
      right: orders,
      leftKey: "id",
      rightKey: "userId",
    });

    // Ana has 2 orders, Juan has 1, Luis has 0 (null), orphan order = 1
    expect(result).toHaveLength(5);
  });

  it("should handle empty left array", () => {
    const result = fullOuterJoin({
      left: [] as User[],
      right: orders,
      leftKey: "id",
      rightKey: "userId",
    });

    expect(result).toHaveLength(orders.length);
    for (const row of result) {
      expect(row.left).toBeNull();
    }
  });

  it("should handle empty right array", () => {
    const result = fullOuterJoin({
      left: users,
      right: [] as Order[],
      leftKey: "id",
      rightKey: "userId",
    });

    expect(result).toHaveLength(users.length);
    for (const row of result) {
      expect(row.right).toBeNull();
    }
  });

  it("should handle both arrays empty", () => {
    const result = fullOuterJoin({
      left: [] as User[],
      right: [] as Order[],
      leftKey: "id",
      rightKey: "userId",
    });
    expect(result).toEqual([]);
  });
});
