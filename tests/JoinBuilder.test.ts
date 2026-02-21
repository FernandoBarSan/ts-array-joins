import { describe, expect, it } from "vitest";
import { from } from "../src/joins/JoinBuilder.js";

type User = { id: number; name: string };
type Order = { id: number; userId: number; total: number };
type Profile = { userId: number; bio: string };

describe("JoinBuilder", () => {
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

  const profiles: Profile[] = [
    { userId: 1, bio: "Developer" },
    { userId: 2, bio: "Designer" },
  ];

  describe("attachChildren", () => {
    it("should attach children via builder", () => {
      const result = from(users)
        .attachChildren({
          children: orders,
          parentKey: "id",
          childKey: "userId",
          as: "orders",
        })
        .build();

      expect(result).toHaveLength(3);
      expect(result[0].orders).toHaveLength(2);
      expect(result[1].orders).toHaveLength(1);
      expect(result[2].orders).toEqual([]);
    });
  });

  describe("attachChild", () => {
    it("should attach single child via builder", () => {
      const result = from(users)
        .attachChild({
          children: profiles,
          parentKey: "id",
          childKey: "userId",
          as: "profile",
        })
        .build();

      expect(result[0].profile!.bio).toBe("Developer");
      expect(result[1].profile!.bio).toBe("Designer");
      expect(result[2].profile).toBeNull();
    });
  });

  describe("chaining", () => {
    it("should chain attachChildren + attachChild", () => {
      const result = from(users)
        .attachChildren({
          children: orders,
          parentKey: "id",
          childKey: "userId",
          as: "orders",
        })
        .attachChild({
          children: profiles,
          parentKey: "id",
          childKey: "userId",
          as: "profile",
        })
        .build();

      expect(result).toHaveLength(3);
      expect(result[0].orders).toHaveLength(2);
      expect(result[0].profile!.bio).toBe("Developer");
      expect(result[2].orders).toEqual([]);
      expect(result[2].profile).toBeNull();
    });

    it("should chain attachChildren + attachAggregate", () => {
      const result = from(users)
        .attachChildren({
          children: orders,
          parentKey: "id",
          childKey: "userId",
          as: "orders",
        })
        .attachAggregate({
          children: orders,
          parentKey: "id",
          childKey: "userId",
          as: "orderTotal",
          aggregate: (o) => o.reduce((s, x) => s + x.total, 0),
        })
        .build();

      expect(result[0].orders).toHaveLength(2);
      expect(result[0].orderTotal).toBe(150);
      expect(result[2].orderTotal).toBe(0);
    });
  });

  describe("where", () => {
    it("should filter items", () => {
      const result = from(users)
        .attachChildren({
          children: orders,
          parentKey: "id",
          childKey: "userId",
          as: "orders",
        })
        .where((u) => u.orders.length > 0)
        .build();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Ana");
      expect(result[1].name).toBe("Juan");
    });
  });

  describe("attachAggregate", () => {
    it("should attach aggregate value via builder", () => {
      const result = from(users)
        .attachAggregate({
          children: orders,
          parentKey: "id",
          childKey: "userId",
          as: "orderCount",
          aggregate: (o) => o.length,
        })
        .build();

      expect(result[0].orderCount).toBe(2);
      expect(result[1].orderCount).toBe(1);
      expect(result[2].orderCount).toBe(0);
    });
  });

  describe("empty input", () => {
    it("should handle empty array", () => {
      const result = from([] as User[])
        .attachChildren({
          children: orders,
          parentKey: "id",
          childKey: "userId",
          as: "orders",
        })
        .build();

      expect(result).toEqual([]);
    });
  });

  it("should not mutate original arrays", () => {
    const usersCopy = [...users];

    from(users)
      .attachChildren({
        children: orders,
        parentKey: "id",
        childKey: "userId",
        as: "orders",
      })
      .build();

    expect(users).toEqual(usersCopy);
  });
});
