import { describe, expect, it } from "vitest";
import { attachChildNested } from "../src/joins/attachChildNested.js";

type Product = { sku: string; origin: string; name: string };
type Price = { sku: string; origin: string; amount: number };

describe("attachChildNested", () => {
  const products: Product[] = [
    { sku: "SKU-A", origin: "origin1", name: "Widget A1" },
    { sku: "SKU-A", origin: "origin2", name: "Widget A2" },
    { sku: "SKU-B", origin: "origin1", name: "Gadget B1" },
  ];

  const prices: Price[] = [
    { sku: "SKU-A", origin: "origin1", amount: 99.99 },
    { sku: "SKU-A", origin: "origin2", amount: 89.99 },
  ];

  it("should attach first matching child using nested keys", () => {
    const result = attachChildNested({
      parents: products,
      children: prices,
      parentKeys: ["sku", "origin"] as const,
      childKeys: ["sku", "origin"] as const,
      as: "price",
    });

    expect(result).toHaveLength(3);

    const a1 = result.find((p) => p.name === "Widget A1");
    expect(a1!.price).toEqual({ sku: "SKU-A", origin: "origin1", amount: 99.99 });

    const a2 = result.find((p) => p.name === "Widget A2");
    expect(a2!.price).toEqual({ sku: "SKU-A", origin: "origin2", amount: 89.99 });
  });

  it("should return null when no match", () => {
    const result = attachChildNested({
      parents: products,
      children: prices,
      parentKeys: ["sku", "origin"] as const,
      childKeys: ["sku", "origin"] as const,
      as: "price",
    });

    const b1 = result.find((p) => p.name === "Gadget B1");
    expect(b1!.price).toBeNull();
  });

  it("should use first-match-wins with nested keys", () => {
    const multiPrices: Price[] = [
      { sku: "SKU-A", origin: "origin1", amount: 99.99 },
      { sku: "SKU-A", origin: "origin1", amount: 79.99 },
    ];

    const result = attachChildNested({
      parents: [{ sku: "SKU-A", origin: "origin1", name: "Widget" }],
      children: multiPrices,
      parentKeys: ["sku", "origin"] as const,
      childKeys: ["sku", "origin"] as const,
      as: "price",
    });

    expect(result[0].price!.amount).toBe(99.99);
  });

  it("should handle empty parents", () => {
    const result = attachChildNested({
      parents: [] as Product[],
      children: prices,
      parentKeys: ["sku", "origin"] as const,
      childKeys: ["sku", "origin"] as const,
      as: "price",
    });

    expect(result).toEqual([]);
  });

  it("should handle empty children", () => {
    const result = attachChildNested({
      parents: products,
      children: [] as Price[],
      parentKeys: ["sku", "origin"] as const,
      childKeys: ["sku", "origin"] as const,
      as: "price",
    });

    expect(result).toHaveLength(3);
    for (const p of result) {
      expect(p.price).toBeNull();
    }
  });

  it("should not mutate original arrays", () => {
    const parentsCopy = [...products];
    const childrenCopy = [...prices];

    attachChildNested({
      parents: products,
      children: prices,
      parentKeys: ["sku", "origin"] as const,
      childKeys: ["sku", "origin"] as const,
      as: "price",
    });

    expect(products).toEqual(parentsCopy);
    expect(prices).toEqual(childrenCopy);
  });
});
