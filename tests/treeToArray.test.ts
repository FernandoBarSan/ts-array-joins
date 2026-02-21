import { describe, expect, it } from "vitest";
import type { TreeNode } from "../src/types/index.js";
import { treeToArray } from "../src/utils/treeToArray.js";

describe("treeToArray", () => {
  it("should flatten a tree to a flat array (depth-first)", () => {
    const tree: TreeNode<{ id: number; name: string }>[] = [
      {
        id: 1,
        name: "Root",
        children: [
          { id: 2, name: "Child 1", children: [] },
          {
            id: 3,
            name: "Child 2",
            children: [{ id: 4, name: "Grandchild", children: [] }],
          },
        ],
      },
    ];

    const result = treeToArray(tree, "children");
    expect(result).toEqual([
      { id: 1, name: "Root" },
      { id: 2, name: "Child 1" },
      { id: 3, name: "Child 2" },
      { id: 4, name: "Grandchild" },
    ]);
  });

  it("should handle multiple root nodes", () => {
    const tree: TreeNode<{ id: number }>[] = [
      { id: 1, children: [{ id: 3, children: [] }] },
      { id: 2, children: [] },
    ];

    const result = treeToArray(tree, "children");
    expect(result).toEqual([{ id: 1 }, { id: 3 }, { id: 2 }]);
  });

  it("should handle empty tree", () => {
    const result = treeToArray([], "children");
    expect(result).toEqual([]);
  });

  it("should handle custom children field name", () => {
    const tree: TreeNode<{ id: number }, "subordinates">[] = [
      {
        id: 1,
        subordinates: [{ id: 2, subordinates: [] }],
      },
    ];

    const result = treeToArray(tree, "subordinates");
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("should remove the children property from results", () => {
    const tree: TreeNode<{ id: number; name: string }>[] = [
      { id: 1, name: "Root", children: [{ id: 2, name: "Child", children: [] }] },
    ];

    const result = treeToArray(tree, "children");
    for (const item of result) {
      expect(item).not.toHaveProperty("children");
    }
  });

  it("should not mutate the original tree", () => {
    const tree: TreeNode<{ id: number }>[] = [{ id: 1, children: [{ id: 2, children: [] }] }];
    const originalTree = JSON.parse(JSON.stringify(tree));
    treeToArray(tree, "children");
    expect(tree).toEqual(originalTree);
  });
});
