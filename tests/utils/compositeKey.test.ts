import { describe, expect, it } from "vitest";
import {
  createCompositeKey,
  getCompositeKey,
  makeCompositeKeyExtractor,
} from "../../src/utils/compositeKey.js";

describe("createCompositeKey", () => {
  it("should create key from string values", () => {
    const key = createCompositeKey(["SKU-A", "origin1"]);
    expect(key).toBe("SKU-A||~~||origin1");
  });

  it("should create key from number values", () => {
    const key = createCompositeKey([1, 2, 3]);
    expect(key).toBe("1||~~||2||~~||3");
  });

  it("should create key from mixed types", () => {
    const key = createCompositeKey(["abc", 123]);
    expect(key).toBe("abc||~~||123");
  });

  it("should handle null/undefined as empty string", () => {
    const key = createCompositeKey([null, undefined, "valid"]);
    expect(key).toBe("||~~||||~~||valid");
  });

  it("should handle single value", () => {
    const key = createCompositeKey(["only"]);
    expect(key).toBe("only");
  });

  it("should handle empty array", () => {
    const key = createCompositeKey([]);
    expect(key).toBe("");
  });
});

describe("makeCompositeKeyExtractor", () => {
  it("should return a function that extracts composite key", () => {
    type Item = { sku: string; origin: string; name: string };
    const extractor = makeCompositeKeyExtractor<Item>(["sku", "origin"]);

    const key = extractor({ sku: "SKU-A", origin: "origin1", name: "Widget" });
    expect(key).toBe("SKU-A||~~||origin1");
  });

  it("should work with single key", () => {
    type Item = { id: number; name: string };
    const extractor = makeCompositeKeyExtractor<Item>(["id"]);

    const key = extractor({ id: 42, name: "Test" });
    expect(key).toBe("42");
  });

  it("should produce consistent keys", () => {
    type Item = { a: string; b: string };
    const extractor = makeCompositeKeyExtractor<Item>(["a", "b"]);

    const key1 = extractor({ a: "x", b: "y" });
    const key2 = extractor({ a: "x", b: "y" });
    expect(key1).toBe(key2);
  });
});

describe("getCompositeKey", () => {
  it("should extract composite key directly", () => {
    type Product = { sku: string; origin: string };
    const product: Product = { sku: "SKU-A", origin: "origin1" };

    const key = getCompositeKey(product, ["sku", "origin"]);
    expect(key).toBe("SKU-A||~~||origin1");
  });

  it("should match makeCompositeKeyExtractor output", () => {
    type Item = { a: string; b: number };
    const item: Item = { a: "test", b: 42 };

    const directKey = getCompositeKey(item, ["a", "b"]);
    const extractorKey = makeCompositeKeyExtractor<Item>(["a", "b"])(item);

    expect(directKey).toBe(extractorKey);
  });
});
