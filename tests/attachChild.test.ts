import { describe, expect, it } from "vitest";
import { attachChild } from "../src/joins/attachChild.js";

type User = { id: number; name: string };
type Address = { id: number; userId: number; city: string };

describe("attachChild", () => {
  const users: User[] = [
    { id: 1, name: "Ana" },
    { id: 2, name: "Juan" },
    { id: 3, name: "Luis" },
  ];

  const addresses: Address[] = [
    { id: 201, userId: 1, city: "Madrid" },
    { id: 202, userId: 2, city: "Barcelona" },
  ];

  it("should attach first matching child to each parent", () => {
    const result = attachChild({
      parents: users,
      children: addresses,
      parentKey: "id",
      childKey: "userId",
      as: "address",
    });

    expect(result).toHaveLength(3);
    expect(result[0].address).toEqual({ id: 201, userId: 1, city: "Madrid" });
    expect(result[1].address).toEqual({
      id: 202,
      userId: 2,
      city: "Barcelona",
    });
  });

  it("should return null for parents without matching child", () => {
    const result = attachChild({
      parents: users,
      children: addresses,
      parentKey: "id",
      childKey: "userId",
      as: "address",
    });

    const luis = result.find((u) => u.name === "Luis");
    expect(luis!.address).toBeNull();
  });

  it("should use first-match-wins when multiple children match", () => {
    const multiAddresses: Address[] = [
      { id: 201, userId: 1, city: "Madrid" },
      { id: 202, userId: 1, city: "Barcelona" },
      { id: 203, userId: 1, city: "Sevilla" },
    ];

    const result = attachChild({
      parents: [{ id: 1, name: "Ana" }],
      children: multiAddresses,
      parentKey: "id",
      childKey: "userId",
      as: "address",
    });

    expect(result[0].address!.city).toBe("Madrid");
  });

  it("should return empty array when parents is empty", () => {
    const result = attachChild({
      parents: [] as User[],
      children: addresses,
      parentKey: "id",
      childKey: "userId",
      as: "address",
    });

    expect(result).toEqual([]);
  });

  it("should give all parents null when children is empty", () => {
    const result = attachChild({
      parents: users,
      children: [] as Address[],
      parentKey: "id",
      childKey: "userId",
      as: "address",
    });

    expect(result).toHaveLength(3);
    for (const user of result) {
      expect(user.address).toBeNull();
    }
  });

  it("should not mutate original arrays", () => {
    const parentsCopy = [...users];
    const childrenCopy = [...addresses];

    attachChild({
      parents: users,
      children: addresses,
      parentKey: "id",
      childKey: "userId",
      as: "address",
    });

    expect(users).toEqual(parentsCopy);
    expect(addresses).toEqual(childrenCopy);
  });

  it("should preserve all parent properties", () => {
    const result = attachChild({
      parents: users,
      children: addresses,
      parentKey: "id",
      childKey: "userId",
      as: "address",
    });

    expect(result[0].id).toBe(1);
    expect(result[0].name).toBe("Ana");
  });
});
