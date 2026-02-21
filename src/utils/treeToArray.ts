import type { TreeNode } from "../types/index.js";

/**
 * Flattens a tree structure back into a flat array.
 * Traverses the tree depth-first, collecting all nodes.
 * Each resulting item has the children field removed.
 *
 * Time complexity: O(n) where n = total nodes
 *
 * @template T - Original item type (without children field)
 * @template ChildrenField - Name of the children property
 * @param tree - Array of root tree nodes
 * @param childrenField - Name of the property containing child nodes
 * @returns Flat array of items with children field removed
 *
 * @example
 * ```typescript
 * const tree = arrayToTree({ items: employees, idKey: "id", parentIdKey: "managerId" });
 * const flat = treeToArray(tree, "children");
 * // Employee[] — all nodes flattened, "children" property removed
 * ```
 */
export function treeToArray<T, ChildrenField extends PropertyKey = "children">(
  tree: readonly TreeNode<T, ChildrenField>[],
  childrenField: ChildrenField,
): T[] {
  const result: T[] = [];

  function traverse(nodes: readonly TreeNode<T, ChildrenField>[]): void {
    for (const node of nodes) {
      const children = node[childrenField] as TreeNode<T, ChildrenField>[];
      const { [childrenField]: _, ...rest } = node as Record<PropertyKey, unknown>;
      result.push(rest as T);
      if (children.length > 0) {
        traverse(children);
      }
    }
  }

  traverse(tree);
  return result;
}
