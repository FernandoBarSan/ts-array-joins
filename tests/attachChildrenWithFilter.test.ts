import { describe, it, expect } from "vitest";
import { attachChildrenWithFilter } from "../src/joins/attachChildrenWithFilter.js";

describe("attachChildrenWithFilter", () => {
  describe("Basic functionality", () => {
    it("should create three-level hierarchy with filtered children", () => {
      type User = { id: number; name: string };
      type Product = { id: number; name: string; price: number };
      type Purchase = {
        id: number;
        userId: number;
        productId: number;
        quantity: number;
      };

      const users: User[] = [
        { id: 1, name: "Ana" },
        { id: 2, name: "Luis" },
      ];

      const products: Product[] = [
        { id: 10, name: "Laptop", price: 1000 },
        { id: 20, name: "Mouse", price: 50 },
        { id: 30, name: "Keyboard", price: 100 },
      ];

      const purchases: Purchase[] = [
        { id: 1, userId: 1, productId: 10, quantity: 1 },
        { id: 2, userId: 1, productId: 20, quantity: 2 },
        { id: 3, userId: 2, productId: 10, quantity: 1 },
      ];

      const result = attachChildrenWithFilter({
        parents: users,
        middle: products,
        children: purchases,
        parentKey: "id",
        childParentKey: "userId",
        middleKey: "id",
        childKey: "productId",
        middleAs: "products",
        childAs: "purchases",
      });

      expect(result).toHaveLength(2);

      // Ana should have purchases for Laptop and Mouse
      const ana = result.find((u) => u.name === "Ana");
      expect(ana).toBeDefined();
      expect(ana!.products).toHaveLength(3); // All products in catalog

      const anaLaptop = ana!.products.find((p) => p.name === "Laptop");
      expect(anaLaptop!.purchases).toHaveLength(1);
      expect(anaLaptop!.purchases[0].quantity).toBe(1);

      const anaMouse = ana!.products.find((p) => p.name === "Mouse");
      expect(anaMouse!.purchases).toHaveLength(1);
      expect(anaMouse!.purchases[0].quantity).toBe(2);

      const anaKeyboard = ana!.products.find((p) => p.name === "Keyboard");
      expect(anaKeyboard!.purchases).toHaveLength(0); // No purchases yet

      // Luis should have purchase for Laptop only
      const luis = result.find((u) => u.name === "Luis");
      expect(luis).toBeDefined();
      expect(luis!.products).toHaveLength(3); // All products in catalog

      const luisLaptop = luis!.products.find((p) => p.name === "Laptop");
      expect(luisLaptop!.purchases).toHaveLength(1);
      expect(luisLaptop!.purchases[0].quantity).toBe(1);

      const luisMouse = luis!.products.find((p) => p.name === "Mouse");
      expect(luisMouse!.purchases).toHaveLength(0);
    });
  });

  describe("Edge cases", () => {
    it("should handle empty arrays", () => {
      const result = attachChildrenWithFilter({
        parents: [],
        middle: [],
        children: [],
        parentKey: "id",
        childParentKey: "parentId",
        middleKey: "id",
        childKey: "middleId",
        middleAs: "middle",
        childAs: "children",
      });

      expect(result).toEqual([]);
    });

    it("should handle parents with no middle items", () => {
      type Parent = { id: number; name: string };
      type Middle = { id: number; parentId: number; value: string };
      type Child = {
        id: number;
        middleId: number;
        parentId: number;
        data: string;
      };

      const parents: Parent[] = [
        { id: 1, name: "Parent1" },
        { id: 2, name: "Parent2" },
      ];

      const middle: Middle[] = [{ id: 10, parentId: 1, value: "Middle1" }];

      const children: Child[] = [
        { id: 100, middleId: 10, parentId: 1, data: "Child1" },
      ];

      const result = attachChildrenWithFilter({
        parents,
        middle,
        children,
        parentKey: "id",
        childParentKey: "parentId",
        middleKey: "id",
        childKey: "middleId",
        middleAs: "items",
        childAs: "subItems",
      });

      expect(result).toHaveLength(2);

      const parent1 = result.find((p) => p.name === "Parent1");
      expect(parent1!.items).toHaveLength(1); // Only middle item with parentId = 1
      expect(parent1!.items[0].subItems).toHaveLength(1);

      const parent2 = result.find((p) => p.name === "Parent2");
      expect(parent2!.items).toHaveLength(1); // All middle items (catalog approach) - shows same catalog
      expect(parent2!.items[0].subItems).toHaveLength(0); // But no children for Parent2
    });

    it("should handle middle items with no children", () => {
      type Parent = { id: number; name: string };
      type Middle = { id: number; parentId: number; value: string };
      type Child = {
        id: number;
        middleId: number;
        parentId: number;
        data: string;
      };

      const parents: Parent[] = [{ id: 1, name: "Parent1" }];

      const middle: Middle[] = [
        { id: 10, parentId: 1, value: "Middle1" },
        { id: 20, parentId: 1, value: "Middle2" },
      ];

      const children: Child[] = [
        { id: 100, middleId: 10, parentId: 1, data: "Child1" },
      ];

      const result = attachChildrenWithFilter({
        parents,
        middle,
        children,
        parentKey: "id",
        childParentKey: "parentId",
        middleKey: "id",
        childKey: "middleId",
        middleAs: "items",
        childAs: "subItems",
      });

      expect(result).toHaveLength(1);
      expect(result[0].items).toHaveLength(2);

      const middle1 = result[0].items.find((m) => m.value === "Middle1");
      expect(middle1!.subItems).toHaveLength(1);

      const middle2 = result[0].items.find((m) => m.value === "Middle2");
      expect(middle2!.subItems).toHaveLength(0); // No children
    });
  });

  describe("Type safety", () => {
    it("should preserve types correctly", () => {
      type Parent = { id: number; name: string };
      type Middle = { id: number; value: string };
      type Child = {
        id: number;
        middleId: number;
        parentId: number;
        data: string;
      };

      const parents: Parent[] = [{ id: 1, name: "Parent1" }];
      const middle: Middle[] = [{ id: 10, value: "Middle1" }];
      const children: Child[] = [
        { id: 100, middleId: 10, parentId: 1, data: "Child1" },
      ];

      const result = attachChildrenWithFilter({
        parents,
        middle,
        children,
        parentKey: "id",
        childParentKey: "parentId",
        middleKey: "id",
        childKey: "middleId",
        middleAs: "items",
        childAs: "subItems",
      });

      // Type assertions to verify TypeScript inference
      const parent: Parent & { items: Array<Middle & { subItems: Child[] }> } =
        result[0];
      expect(parent.id).toBe(1);
      expect(parent.name).toBe("Parent1");
      expect(parent.items[0].id).toBe(10);
      expect(parent.items[0].value).toBe("Middle1");
      expect(parent.items[0].subItems[0].id).toBe(100);
      expect(parent.items[0].subItems[0].data).toBe("Child1");
    });
  });
});
