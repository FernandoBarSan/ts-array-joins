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

  describe("Cardinality options", () => {
    it("should support childCardinality: one (many-to-one)", () => {
      type Enrollment = { id: number; name: string };
      type Fee = { id: number; name: string; amount: number };
      type Payment = {
        id: number;
        enrollmentId: number;
        feeId: number;
        paid: number;
      };

      const enrollments: Enrollment[] = [
        { id: 1, name: "Course A" },
        { id: 2, name: "Course B" },
      ];

      const fees: Fee[] = [
        { id: 1, name: "Registration", amount: 100 },
        { id: 2, name: "Tuition", amount: 500 },
      ];

      const payments: Payment[] = [
        { id: 1, enrollmentId: 1, feeId: 1, paid: 100 },
        { id: 2, enrollmentId: 1, feeId: 2, paid: 500 },
        // Enrollment 2 has only one payment
        { id: 3, enrollmentId: 2, feeId: 1, paid: 100 },
      ];

      const result = attachChildrenWithFilter({
        parents: enrollments,
        middle: fees,
        children: payments,
        parentKey: "id",
        childParentKey: "enrollmentId",
        middleKey: "id",
        childKey: "feeId",
        middleAs: "fees",
        childAs: "payment", // Singular
        childCardinality: "one",
      });

      expect(result).toHaveLength(2);

      const course1 = result.find((e) => e.name === "Course A");
      expect(course1!.fees).toHaveLength(2);
      expect(course1!.fees[0].payment).toBeDefined();
      expect(course1!.fees[0].payment!.paid).toBe(100);
      expect(course1!.fees[1].payment).toBeDefined();
      expect(course1!.fees[1].payment!.paid).toBe(500);

      const course2 = result.find((e) => e.name === "Course B");
      expect(course2!.fees).toHaveLength(2);
      expect(course2!.fees[0].payment).toBeDefined();
      expect(course2!.fees[0].payment!.paid).toBe(100);
      expect(course2!.fees[1].payment).toBeUndefined(); // No payment
    });

    it("should support middleCardinality: one (one-to-many)", () => {
      type User = { id: number; name: string };
      type Category = { id: number; name: string };
      type Item = {
        id: number;
        userId: number;
        categoryId: number;
        value: string;
      };

      const users: User[] = [
        { id: 1, name: "User1" },
        { id: 2, name: "User2" },
      ];

      const categories: Category[] = [{ id: 1, name: "Primary" }];

      const items: Item[] = [
        { id: 1, userId: 1, categoryId: 1, value: "Item1" },
        { id: 2, userId: 1, categoryId: 1, value: "Item2" },
      ];

      const result = attachChildrenWithFilter({
        parents: users,
        middle: categories,
        children: items,
        parentKey: "id",
        childParentKey: "userId",
        middleKey: "id",
        childKey: "categoryId",
        middleAs: "category", // Singular
        childAs: "items",
        middleCardinality: "one",
      });

      expect(result).toHaveLength(2);

      const user1 = result.find((u) => u.name === "User1");
      expect(user1!.category).toBeDefined();
      expect(user1!.category!.items).toHaveLength(2);

      const user2 = result.find((u) => u.name === "User2");
      expect(user2!.category).toBeDefined();
      expect(user2!.category!.items).toHaveLength(0);
    });

    it("should support both cardinaliti es: one (one-to-one)", () => {
      type Order = { id: number; name: string };
      type ShippingInfo = { id: number; address: string };
      type Tracking = {
        id: number;
        orderId: number;
        shippingId: number;
        trackingNumber: string;
      };

      const orders: Order[] = [{ id: 1, name: "Order1" }];

      const shippingInfos: ShippingInfo[] = [{ id: 1, address: "123 Main St" }];

      const trackings: Tracking[] = [
        { id: 1, orderId: 1, shippingId: 1, trackingNumber: "TRACK123" },
      ];

      const result = attachChildrenWithFilter({
        parents: orders,
        middle: shippingInfos,
        children: trackings,
        parentKey: "id",
        childParentKey: "orderId",
        middleKey: "id",
        childKey: "shippingId",
        middleAs: "shipping", // Singular
        childAs: "tracking", // Singular
        middleCardinality: "one",
        childCardinality: "one",
      });

      expect(result).toHaveLength(1);
      expect(result[0].shipping).toBeDefined();
      expect(result[0].shipping!.tracking).toBeDefined();
      expect(result[0].shipping!.tracking!.trackingNumber).toBe("TRACK123");
    });

    it("should handle real-world enrollment-fees-payments with childCardinality: one", () => {
      type Inscripcion = { idInscripcion: number; nombre: string };
      type CuotaPeriodo = {
        idPeriodoCuota: number;
        nombre: string;
        monto: string;
      };
      type CuotaInscripcion = {
        idInscripcionCuota: number;
        idInscripcion: number;
        idPeriodoCuota: number;
        montoDescuento: string;
      };

      const inscripciones: Inscripcion[] = [
        { idInscripcion: 279, nombre: "ESME" },
      ];

      const cuotasPeriodo: CuotaPeriodo[] = [
        { idPeriodoCuota: 1, nombre: "P 1", monto: "34.00" },
        { idPeriodoCuota: 2, nombre: "P 2", monto: "34.00" },
        { idPeriodoCuota: 3, nombre: "T 1", monto: "11.00" },
      ];

      const cuotasInscripcion: CuotaInscripcion[] = [
        {
          idInscripcionCuota: 1,
          idInscripcion: 279,
          idPeriodoCuota: 1,
          montoDescuento: "34.00",
        },
        {
          idInscripcionCuota: 27,
          idInscripcion: 279,
          idPeriodoCuota: 2,
          montoDescuento: "34.00",
        },
        // Tutoría 1 sin pago
      ];

      const result = attachChildrenWithFilter({
        parents: inscripciones,
        middle: cuotasPeriodo,
        children: cuotasInscripcion,
        parentKey: "idInscripcion",
        childParentKey: "idInscripcion",
        middleKey: "idPeriodoCuota",
        childKey: "idPeriodoCuota",
        middleAs: "cuotasPeriodo",
        childAs: "pago", // ← Singular: cada cuota tiene máximo 1 pago
        childCardinality: "one",
      });

      expect(result).toHaveLength(1);
      expect(result[0].cuotasPeriodo).toHaveLength(3);

      const p1 = result[0].cuotasPeriodo.find((c) => c.nombre === "P 1");
      expect(p1).toBeDefined();
      expect(p1!.pago).toBeDefined();
      expect(p1!.pago!.montoDescuento).toBe("34.00");

      const p2 = result[0].cuotasPeriodo.find((c) => c.nombre === "P 2");
      expect(p2).toBeDefined();
      expect(p2!.pago).toBeDefined();

      const t1 = result[0].cuotasPeriodo.find((c) => c.nombre === "T 1");
      expect(t1).toBeDefined();
      expect(t1!.pago).toBeUndefined(); // ← Sin pago aún
    });
  });
});
