import { describe, it, expect } from "vitest";
import {
  groupBy,
  groupByKey,
  groupByMany,
  groupByTransform,
} from "../src/groupBy.js";

describe("groupBy", () => {
  it("should group items by selector function", () => {
    const users = [
      { id: 1, name: "Ana", role: "admin" },
      { id: 2, name: "Juan", role: "user" },
      { id: 3, name: "Luis", role: "admin" },
    ];

    const result = groupBy(users, (u) => u.role);

    expect(result).toEqual({
      admin: [
        { id: 1, name: "Ana", role: "admin" },
        { id: 3, name: "Luis", role: "admin" },
      ],
      user: [{ id: 2, name: "Juan", role: "user" }],
    });
  });

  it("should handle empty arrays", () => {
    const result = groupBy([], (x: number) => x);
    expect(result).toEqual({});
  });

  it("should group by first letter", () => {
    const users = [
      { id: 1, name: "Ana" },
      { id: 2, name: "Alberto" },
      { id: 3, name: "Juan" },
    ];

    const result = groupBy(users, (u) => u.name[0]);

    expect(result).toEqual({
      A: [
        { id: 1, name: "Ana" },
        { id: 2, name: "Alberto" },
      ],
      J: [{ id: 3, name: "Juan" }],
    });
  });
});

describe("groupByKey", () => {
  it("should group items by property key", () => {
    type User = { id: number; role: "admin" | "user"; name: string };
    const users: User[] = [
      { id: 1, role: "admin", name: "Juan" },
      { id: 2, role: "user", name: "Ana" },
      { id: 3, role: "admin", name: "Luis" },
    ];

    const grouped = groupByKey(users, "role");

    expect(grouped).toEqual({
      admin: [
        { id: 1, role: "admin", name: "Juan" },
        { id: 3, role: "admin", name: "Luis" },
      ],
      user: [{ id: 2, role: "user", name: "Ana" }],
    });
  });

  it("should handle numeric keys", () => {
    const items = [
      { id: 1, category: 100 },
      { id: 2, category: 200 },
      { id: 3, category: 100 },
    ];

    const grouped = groupByKey(items, "category");

    expect(grouped).toEqual({
      100: [
        { id: 1, category: 100 },
        { id: 3, category: 100 },
      ],
      200: [{ id: 2, category: 200 }],
    });
  });
});

describe("groupByMany", () => {
  it("should create nested groups with multiple keys", () => {
    type Sale = { country: string; city: string; amount: number };
    const sales: Sale[] = [
      { country: "USA", city: "NYC", amount: 100 },
      { country: "USA", city: "LA", amount: 200 },
      { country: "Spain", city: "Madrid", amount: 150 },
      { country: "USA", city: "NYC", amount: 50 },
    ];

    const grouped = groupByMany(sales, ["country", "city"]);

    expect(grouped).toEqual({
      USA: {
        NYC: [
          { country: "USA", city: "NYC", amount: 100 },
          { country: "USA", city: "NYC", amount: 50 },
        ],
        LA: [{ country: "USA", city: "LA", amount: 200 }],
      },
      Spain: {
        Madrid: [{ country: "Spain", city: "Madrid", amount: 150 }],
      },
    });
  });

  it("should handle single key", () => {
    const users = [
      { id: 1, role: "admin" },
      { id: 2, role: "user" },
    ];

    const grouped = groupByMany(users, ["role"]);

    expect(grouped).toEqual({
      admin: [{ id: 1, role: "admin" }],
      user: [{ id: 2, role: "user" }],
    });
  });

  it("should handle empty key array", () => {
    const users = [
      { id: 1, role: "admin" },
      { id: 2, role: "user" },
    ];

    const grouped = groupByMany(users, []);

    expect(grouped).toEqual(users);
  });
});

describe("groupByTransform", () => {
  it("should group and transform values", () => {
    type Order = { userId: number; total: number };
    const orders: Order[] = [
      { userId: 1, total: 100 },
      { userId: 1, total: 50 },
      { userId: 2, total: 200 },
    ];

    const totalByUser = groupByTransform(
      orders,
      (o) => o.userId,
      (orders) => orders.reduce((sum, o) => sum + o.total, 0)
    );

    expect(totalByUser).toEqual({
      1: 150,
      2: 200,
    });
  });

  it("should allow complex transformations", () => {
    type Product = { category: string; price: number; name: string };
    const products: Product[] = [
      { category: "electronics", price: 100, name: "Phone" },
      { category: "electronics", price: 200, name: "Laptop" },
      { category: "books", price: 20, name: "Novel" },
    ];

    const summaryByCategory = groupByTransform(
      products,
      (p) => p.category,
      (items) => ({
        count: items.length,
        avgPrice: items.reduce((sum, p) => sum + p.price, 0) / items.length,
        items: items.map((p) => p.name),
      })
    );

    expect(summaryByCategory).toEqual({
      electronics: {
        count: 2,
        avgPrice: 150,
        items: ["Phone", "Laptop"],
      },
      books: {
        count: 1,
        avgPrice: 20,
        items: ["Novel"],
      },
    });
  });
});
