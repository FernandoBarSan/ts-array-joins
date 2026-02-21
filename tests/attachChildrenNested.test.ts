import { describe, expect, it } from "vitest";
import { attachChildrenNested } from "../src/joins/attachChildrenNested.js";

type Product = { sku: string; origin: string; name: string };
type Inventory = { sku: string; origin: string; quantity: number };

describe("attachChildrenNested", () => {
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

  it("should attach children using nested composite keys", () => {
    const result = attachChildrenNested({
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
    const result = attachChildrenNested({
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
    const result = attachChildrenNested({
      parents: [] as Product[],
      children: inventory,
      parentKeys: ["sku", "origin"] as const,
      childKeys: ["sku", "origin"] as const,
      as: "stock",
    });

    expect(result).toEqual([]);
  });

  it("should handle empty children", () => {
    const result = attachChildrenNested({
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

  it("should not mutate original arrays", () => {
    const parentsCopy = [...products];
    const childrenCopy = [...inventory];

    attachChildrenNested({
      parents: products,
      children: inventory,
      parentKeys: ["sku", "origin"] as const,
      childKeys: ["sku", "origin"] as const,
      as: "stock",
    });

    expect(products).toEqual(parentsCopy);
    expect(inventory).toEqual(childrenCopy);
  });

  it("should produce same results as composite variant", () => {
    const result = attachChildrenNested({
      parents: products,
      children: inventory,
      parentKeys: ["sku", "origin"] as const,
      childKeys: ["sku", "origin"] as const,
      as: "stock",
    });

    // Widget A1 should have same children regardless of approach
    const a1 = result.find((p) => p.name === "Widget A1");
    expect(a1!.stock.map((s) => s.quantity).sort((a, b) => a - b)).toEqual([50, 100]);
  });
});
