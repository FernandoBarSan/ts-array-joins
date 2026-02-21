import { describe, expect, it } from "vitest";
import { flatMapChildren } from "../src/utils/flatMapChildren.js";

describe("flatMapChildren", () => {
  it("should denormalize parent-children into flat rows", () => {
    const data = [
      {
        id: 1,
        name: "Ana",
        orders: [
          { orderId: 101, total: 50 },
          { orderId: 102, total: 100 },
        ],
      },
      {
        id: 2,
        name: "Juan",
        orders: [{ orderId: 103, total: 75 }],
      },
    ];

    const result = flatMapChildren(data, "orders");
    expect(result).toEqual([
      { id: 1, name: "Ana", orderId: 101, total: 50 },
      { id: 1, name: "Ana", orderId: 102, total: 100 },
      { id: 2, name: "Juan", orderId: 103, total: 75 },
    ]);
  });

  it("should exclude parents without children", () => {
    const data = [
      { id: 1, name: "Ana", orders: [{ orderId: 101 }] },
      { id: 2, name: "Juan", orders: [] },
    ];

    const result = flatMapChildren(data, "orders");
    expect(result).toEqual([{ id: 1, name: "Ana", orderId: 101 }]);
  });

  it("should handle empty array", () => {
    const result = flatMapChildren([], "children" as never);
    expect(result).toEqual([]);
  });

  it("should remove the children key from results", () => {
    const data = [
      {
        id: 1,
        items: [{ itemId: 1 }],
      },
    ];

    const result = flatMapChildren(data, "items");
    for (const row of result) {
      expect(row).not.toHaveProperty("items");
    }
  });

  it("should not mutate the original array", () => {
    const data = [{ id: 1, orders: [{ orderId: 101 }] }];
    const original = JSON.parse(JSON.stringify(data));
    flatMapChildren(data, "orders");
    expect(data).toEqual(original);
  });
});
