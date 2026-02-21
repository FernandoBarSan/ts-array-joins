import { describe, expect, it } from "vitest";
import { attachChildrenComposite } from "../src/joins/attachChildrenComposite.js";

type Product = { sku: string; origin: string; name: string };
type Inventory = { sku: string; origin: string; quantity: number };

describe("attachChildrenComposite", () => {
  const products: Product[] = [
    { sku: "SKU-A", origin: "origin1", name: "Widget A1" },
    { sku: "SKU-A", origin: "origin2", name: "Widget A2" },
    { sku: "SKU-B", origin: "origin1", name: "Gadget B1" },
  ];

  const inventory: Inventory[] = [
    { sku: "SKU-A", origin: "origin1", quantity: 100 },
    { sku: "SKU-A", origin: "origin1", quantity: 50 },
    { sku: "SKU-A", origin: "origin2", quantity: 75 },
  ];

  it("should attach children using two-key composite join", () => {
    const result = attachChildrenComposite({
      parents: products,
      children: inventory,
      parentKeys: ["sku", "origin"] as const,
      childKeys: ["sku", "origin"] as const,
      as: "stock",
    });

    expect(result).toHaveLength(3);

    const a1 = result.find((p) => p.name === "Widget A1");
    expect(a1!.stock).toHaveLength(2);
    expect(a1!.stock[0].quantity).toBe(100);
    expect(a1!.stock[1].quantity).toBe(50);

    const a2 = result.find((p) => p.name === "Widget A2");
    expect(a2!.stock).toHaveLength(1);
    expect(a2!.stock[0].quantity).toBe(75);
  });

  it("should give empty array when no match", () => {
    const result = attachChildrenComposite({
      parents: products,
      children: inventory,
      parentKeys: ["sku", "origin"] as const,
      childKeys: ["sku", "origin"] as const,
      as: "stock",
    });

    const b1 = result.find((p) => p.name === "Gadget B1");
    expect(b1!.stock).toEqual([]);
  });

  it("should handle empty parents", () => {
    const result = attachChildrenComposite({
      parents: [] as Product[],
      children: inventory,
      parentKeys: ["sku", "origin"] as const,
      childKeys: ["sku", "origin"] as const,
      as: "stock",
    });

    expect(result).toEqual([]);
  });

  it("should handle empty children", () => {
    const result = attachChildrenComposite({
      parents: products,
      children: [] as Inventory[],
      parentKeys: ["sku", "origin"] as const,
      childKeys: ["sku", "origin"] as const,
      as: "stock",
    });

    expect(result).toHaveLength(3);
    for (const p of result) {
      expect(p.stock).toEqual([]);
    }
  });

  it("should work with three-key composite", () => {
    type Record3 = { a: string; b: string; c: string; val: number };
    type Child3 = { a: string; b: string; c: string; data: string };

    const parents: Record3[] = [{ a: "x", b: "y", c: "z", val: 1 }];
    const children: Child3[] = [
      { a: "x", b: "y", c: "z", data: "match" },
      { a: "x", b: "y", c: "w", data: "no-match" },
    ];

    const result = attachChildrenComposite({
      parents,
      children,
      parentKeys: ["a", "b", "c"] as const,
      childKeys: ["a", "b", "c"] as const,
      as: "items",
    });

    expect(result[0].items).toHaveLength(1);
    expect(result[0].items[0].data).toBe("match");
  });

  it("should not mutate original arrays", () => {
    const parentsCopy = [...products];
    const childrenCopy = [...inventory];

    attachChildrenComposite({
      parents: products,
      children: inventory,
      parentKeys: ["sku", "origin"] as const,
      childKeys: ["sku", "origin"] as const,
      as: "stock",
    });

    expect(products).toEqual(parentsCopy);
    expect(inventory).toEqual(childrenCopy);
  });
});
