import { describe, expect, it } from "vitest";
import { joinBySelectors } from "../src/joins/joinBySelectors.js";

type Product = { sku: string; name: string };
type Review = { productCode: string; rating: number };

describe("joinBySelectors", () => {
  const products: Product[] = [
    { sku: "ABC-123", name: "Widget" },
    { sku: "XYZ-789", name: "Gadget" },
  ];

  const reviews: Review[] = [
    { productCode: "ABC-123", rating: 5 },
    { productCode: "ABC-123", rating: 4 },
    { productCode: "XYZ-789", rating: 3 },
  ];

  describe('mode: "many"', () => {
    it("should attach arrays of matching children", () => {
      const result = joinBySelectors({
        parents: products,
        children: reviews,
        parentSelector: (p) => p.sku,
        childSelector: (r) => r.productCode,
        as: "reviews",
        mode: "many",
      });

      expect(result).toHaveLength(2);
      expect(result[0].reviews).toHaveLength(2);
      expect(result[0].reviews[0].rating).toBe(5);
      expect(result[1].reviews).toHaveLength(1);
      expect(result[1].reviews[0].rating).toBe(3);
    });

    it("should give empty array when no match", () => {
      const result = joinBySelectors({
        parents: [{ sku: "NONE", name: "Nothing" }],
        children: reviews,
        parentSelector: (p) => p.sku,
        childSelector: (r) => r.productCode,
        as: "reviews",
        mode: "many",
      });

      expect(result[0].reviews).toEqual([]);
    });

    it("should handle empty parents", () => {
      const result = joinBySelectors({
        parents: [] as Product[],
        children: reviews,
        parentSelector: (p) => p.sku,
        childSelector: (r) => r.productCode,
        as: "reviews",
        mode: "many",
      });

      expect(result).toEqual([]);
    });

    it("should handle empty children", () => {
      const result = joinBySelectors({
        parents: products,
        children: [] as Review[],
        parentSelector: (p) => p.sku,
        childSelector: (r) => r.productCode,
        as: "reviews",
        mode: "many",
      });

      expect(result).toHaveLength(2);
      expect(result[0].reviews).toEqual([]);
      expect(result[1].reviews).toEqual([]);
    });
  });

  describe('mode: "one"', () => {
    it("should attach first matching child", () => {
      const result = joinBySelectors({
        parents: products,
        children: reviews,
        parentSelector: (p) => p.sku,
        childSelector: (r) => r.productCode,
        as: "topReview",
        mode: "one",
      });

      expect(result).toHaveLength(2);
      expect(result[0].topReview).toEqual({ productCode: "ABC-123", rating: 5 });
      expect(result[1].topReview).toEqual({ productCode: "XYZ-789", rating: 3 });
    });

    it("should return null when no match", () => {
      const result = joinBySelectors({
        parents: [{ sku: "NONE", name: "Nothing" }],
        children: reviews,
        parentSelector: (p) => p.sku,
        childSelector: (r) => r.productCode,
        as: "topReview",
        mode: "one",
      });

      expect(result[0].topReview).toBeNull();
    });

    it("should use first-match-wins", () => {
      const result = joinBySelectors({
        parents: [{ sku: "ABC-123", name: "Widget" }],
        children: reviews,
        parentSelector: (p) => p.sku,
        childSelector: (r) => r.productCode,
        as: "topReview",
        mode: "one",
      });

      expect(result[0].topReview!.rating).toBe(5);
    });
  });

  describe("custom selectors", () => {
    it("should work with computed/transformed keys", () => {
      type Item = { code: string; value: number };
      type Tag = { CODE: string; label: string };

      const items: Item[] = [
        { code: "abc", value: 1 },
        { code: "xyz", value: 2 },
      ];

      const tags: Tag[] = [
        { CODE: "ABC", label: "Alpha" },
        { CODE: "XYZ", label: "Xray" },
      ];

      const result = joinBySelectors({
        parents: items,
        children: tags,
        parentSelector: (i) => i.code.toUpperCase(),
        childSelector: (t) => t.CODE,
        as: "tag",
        mode: "one",
      });

      expect(result[0].tag!.label).toBe("Alpha");
      expect(result[1].tag!.label).toBe("Xray");
    });
  });

  it("should not mutate original arrays", () => {
    const parentsCopy = [...products];
    const childrenCopy = [...reviews];

    joinBySelectors({
      parents: products,
      children: reviews,
      parentSelector: (p) => p.sku,
      childSelector: (r) => r.productCode,
      as: "reviews",
      mode: "many",
    });

    expect(products).toEqual(parentsCopy);
    expect(reviews).toEqual(childrenCopy);
  });
});
