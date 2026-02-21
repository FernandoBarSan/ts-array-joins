import { describe, expect, it } from "vitest";
import { attachChildren } from "../src/joins/attachChildren.js";

type User = { id: number; name: string };
type Order = { id: number; userId: number; total: number };

describe("attachChildren", () => {
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

  it("should attach matching children to each parent", () => {
    const result = attachChildren({
      parents: users,
      children: orders,
      parentKey: "id",
      childKey: "userId",
      as: "orders",
    });

    expect(result).toHaveLength(3);
    expect(result[0].orders).toHaveLength(2);
    expect(result[0].orders[0].total).toBe(50);
    expect(result[0].orders[1].total).toBe(100);
    expect(result[1].orders).toHaveLength(1);
    expect(result[1].orders[0].total).toBe(75);
  });

  it("should give empty array to parents without matching children", () => {
    const result = attachChildren({
      parents: users,
      children: orders,
      parentKey: "id",
      childKey: "userId",
      as: "orders",
    });

    const luis = result.find((u) => u.name === "Luis");
    expect(luis!.orders).toEqual([]);
  });

  it("should return empty array when parents is empty", () => {
    const result = attachChildren({
      parents: [] as User[],
      children: orders,
      parentKey: "id",
      childKey: "userId",
      as: "orders",
    });

    expect(result).toEqual([]);
  });

  it("should give all parents empty arrays when children is empty", () => {
    const result = attachChildren({
      parents: users,
      children: [] as Order[],
      parentKey: "id",
      childKey: "userId",
      as: "orders",
    });

    expect(result).toHaveLength(3);
    for (const user of result) {
      expect(user.orders).toEqual([]);
    }
  });

  it("should handle both arrays empty", () => {
    const result = attachChildren({
      parents: [] as User[],
      children: [] as Order[],
      parentKey: "id",
      childKey: "userId",
      as: "orders",
    });

    expect(result).toEqual([]);
  });

  it("should attach all duplicate children", () => {
    const dupeOrders: Order[] = [
      { id: 1, userId: 1, total: 10 },
      { id: 2, userId: 1, total: 20 },
      { id: 3, userId: 1, total: 30 },
    ];

    const result = attachChildren({
      parents: [{ id: 1, name: "Ana" }],
      children: dupeOrders,
      parentKey: "id",
      childKey: "userId",
      as: "orders",
    });

    expect(result[0].orders).toHaveLength(3);
  });

  it("should not mutate original arrays", () => {
    const parentsCopy = [...users];
    const childrenCopy = [...orders];

    attachChildren({
      parents: users,
      children: orders,
      parentKey: "id",
      childKey: "userId",
      as: "orders",
    });

    expect(users).toEqual(parentsCopy);
    expect(orders).toEqual(childrenCopy);
  });

  it("should preserve all parent properties", () => {
    const result = attachChildren({
      parents: users,
      children: orders,
      parentKey: "id",
      childKey: "userId",
      as: "orders",
    });

    expect(result[0].id).toBe(1);
    expect(result[0].name).toBe("Ana");
  });

  it("should work with string keys", () => {
    type Category = { code: string; label: string };
    type Product = { id: number; categoryCode: string; name: string };

    const categories: Category[] = [
      { code: "A", label: "Alpha" },
      { code: "B", label: "Beta" },
    ];

    const products: Product[] = [
      { id: 1, categoryCode: "A", name: "Prod1" },
      { id: 2, categoryCode: "A", name: "Prod2" },
      { id: 3, categoryCode: "B", name: "Prod3" },
    ];

    const result = attachChildren({
      parents: categories,
      children: products,
      parentKey: "code",
      childKey: "categoryCode",
      as: "products",
    });

    expect(result[0].products).toHaveLength(2);
    expect(result[1].products).toHaveLength(1);
  });
});
