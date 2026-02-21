import { describe, expect, it } from "vitest";
import { arrayToTree } from "../src/joins/arrayToTree.js";

type Employee = { id: number; managerId: number | null; name: string };
type Category = { id: string; parentId: string | null; name: string };

describe("arrayToTree", () => {
  const employees: Employee[] = [
    { id: 1, managerId: null, name: "CEO" },
    { id: 2, managerId: 1, name: "CTO" },
    { id: 3, managerId: 1, name: "CFO" },
    { id: 4, managerId: 2, name: "Dev Lead" },
    { id: 5, managerId: 2, name: "QA Lead" },
    { id: 6, managerId: 4, name: "Developer" },
  ];

  it("should build a tree from flat items", () => {
    const tree = arrayToTree({
      items: employees,
      idKey: "id",
      parentIdKey: "managerId",
    });

    expect(tree).toHaveLength(1);
    expect(tree[0].name).toBe("CEO");
    expect(tree[0].children).toHaveLength(2);
    expect(tree[0].children[0].name).toBe("CTO");
    expect(tree[0].children[0].children).toHaveLength(2);
    expect(tree[0].children[0].children[0].children[0].name).toBe("Developer");
  });

  it("should handle multiple root nodes", () => {
    const items: Employee[] = [
      { id: 1, managerId: null, name: "Root A" },
      { id: 2, managerId: null, name: "Root B" },
      { id: 3, managerId: 1, name: "Child of A" },
    ];

    const tree = arrayToTree({
      items,
      idKey: "id",
      parentIdKey: "managerId",
    });

    expect(tree).toHaveLength(2);
    expect(tree[0].children).toHaveLength(1);
    expect(tree[1].children).toHaveLength(0);
  });

  it("should return empty array for empty input", () => {
    const tree = arrayToTree({
      items: [] as Employee[],
      idKey: "id",
      parentIdKey: "managerId",
    });

    expect(tree).toEqual([]);
  });

  it("should give leaf nodes empty children arrays", () => {
    const tree = arrayToTree({
      items: employees,
      idKey: "id",
      parentIdKey: "managerId",
    });

    const developer = tree[0].children[0].children[0].children[0];
    expect(developer.children).toEqual([]);
    expect(developer.name).toBe("Developer");
  });

  it("should support custom children field name", () => {
    const tree = arrayToTree({
      items: employees,
      idKey: "id",
      parentIdKey: "managerId",
      childrenField: "subordinates" as const,
    });

    expect(tree[0].subordinates).toHaveLength(2);
    expect(tree[0].subordinates[0].subordinates).toHaveLength(2);
  });

  it("should work with string keys", () => {
    const categories: Category[] = [
      { id: "root", parentId: null, name: "Root" },
      { id: "a", parentId: "root", name: "A" },
      { id: "b", parentId: "root", name: "B" },
      { id: "a1", parentId: "a", name: "A1" },
    ];

    const tree = arrayToTree({
      items: categories,
      idKey: "id",
      parentIdKey: "parentId",
    });

    expect(tree).toHaveLength(1);
    expect(tree[0].children).toHaveLength(2);
    expect(tree[0].children[0].children).toHaveLength(1);
  });

  it("should support custom rootParentIds as array", () => {
    type Item = { id: number; pid: number; name: string };
    const items: Item[] = [
      { id: 1, pid: 0, name: "Root" },
      { id: 2, pid: 1, name: "Child" },
    ];

    const tree = arrayToTree({
      items,
      idKey: "id",
      parentIdKey: "pid",
      rootParentIds: [0],
    });

    expect(tree).toHaveLength(1);
    expect(tree[0].name).toBe("Root");
    expect(tree[0].children).toHaveLength(1);
  });

  it("should support custom rootParentIds as Set", () => {
    type Item = { id: number; pid: number; name: string };
    const items: Item[] = [
      { id: 1, pid: 0, name: "Root A" },
      { id: 2, pid: -1, name: "Root B" },
      { id: 3, pid: 1, name: "Child" },
    ];

    const tree = arrayToTree({
      items,
      idKey: "id",
      parentIdKey: "pid",
      rootParentIds: new Set([0, -1]),
    });

    expect(tree).toHaveLength(2);
  });

  it("should throw when orphans exist and throwIfOrphans is true", () => {
    const items: Employee[] = [
      { id: 1, managerId: null, name: "CEO" },
      { id: 2, managerId: 999, name: "Orphan" },
    ];

    expect(() =>
      arrayToTree({
        items,
        idKey: "id",
        parentIdKey: "managerId",
        throwIfOrphans: true,
      }),
    ).toThrow(/Orphan/);
  });

  it("should treat orphans as roots when throwIfOrphans is false", () => {
    const items: Employee[] = [
      { id: 1, managerId: null, name: "CEO" },
      { id: 2, managerId: 999, name: "Orphan" },
    ];

    const tree = arrayToTree({
      items,
      idKey: "id",
      parentIdKey: "managerId",
      throwIfOrphans: false,
    });

    expect(tree).toHaveLength(2);
  });

  it("should not throw when no orphans exist and throwIfOrphans is true", () => {
    const tree = arrayToTree({
      items: employees,
      idKey: "id",
      parentIdKey: "managerId",
      throwIfOrphans: true,
    });

    expect(tree).toHaveLength(1);
  });

  it("should not mutate the original array", () => {
    const copy = employees.map((e) => ({ ...e }));

    arrayToTree({
      items: employees,
      idKey: "id",
      parentIdKey: "managerId",
    });

    expect(employees).toEqual(copy);
  });

  it("should preserve all item properties on tree nodes", () => {
    const tree = arrayToTree({
      items: employees,
      idKey: "id",
      parentIdKey: "managerId",
    });

    expect(tree[0].id).toBe(1);
    expect(tree[0].managerId).toBeNull();
    expect(tree[0].name).toBe("CEO");
  });

  it("should treat all items as roots when none have parent references", () => {
    const items: Employee[] = [
      { id: 1, managerId: null, name: "A" },
      { id: 2, managerId: null, name: "B" },
      { id: 3, managerId: null, name: "C" },
    ];

    const tree = arrayToTree({
      items,
      idKey: "id",
      parentIdKey: "managerId",
    });

    expect(tree).toHaveLength(3);
    for (const node of tree) {
      expect(node.children).toEqual([]);
    }
  });

  it("should handle deeply nested trees", () => {
    const items: Employee[] = [
      { id: 1, managerId: null, name: "Level 0" },
      { id: 2, managerId: 1, name: "Level 1" },
      { id: 3, managerId: 2, name: "Level 2" },
      { id: 4, managerId: 3, name: "Level 3" },
      { id: 5, managerId: 4, name: "Level 4" },
    ];

    const tree = arrayToTree({
      items,
      idKey: "id",
      parentIdKey: "managerId",
    });

    expect(tree).toHaveLength(1);
    let current = tree[0];
    for (let i = 1; i <= 4; i++) {
      expect(current.children).toHaveLength(1);
      current = current.children[0];
    }
    expect(current.children).toEqual([]);
    expect(current.name).toBe("Level 4");
  });
});
