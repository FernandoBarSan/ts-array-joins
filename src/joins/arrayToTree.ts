import type { TreeNode } from "../types/index.js";

/**
 * Configuration for converting a flat array into a tree structure.
 */
export interface ArrayToTreeParams<
  T,
  IdKey extends keyof T,
  ParentIdKey extends keyof T,
  ChildrenField extends PropertyKey = "children",
> {
  /** Flat array of items to convert into a tree */
  items: readonly T[];
  /** Property name that contains the unique identifier for each item */
  idKey: IdKey;
  /** Property name that contains the reference to the parent item's id */
  parentIdKey: ParentIdKey;
  /**
   * Name of the property to add containing child nodes.
   * @default "children"
   */
  childrenField?: ChildrenField;
  /**
   * Values of parentId that indicate a root node.
   * When not provided, items with null, undefined, or "" as parentId are treated as roots.
   */
  rootParentIds?: ReadonlySet<T[ParentIdKey]> | readonly T[ParentIdKey][];
  /**
   * When true, throws an error if any non-root item's parentId
   * does not match any other item's id (orphan detection).
   * @default false
   */
  throwIfOrphans?: boolean;
}

/**
 * Determines whether a parentId value indicates a root node.
 */
function buildRootChecker<V>(
  rootParentIds: ReadonlySet<V> | readonly V[] | undefined,
): (value: V) => boolean {
  if (rootParentIds === undefined) {
    return (value: V) => value === null || value === undefined || value === ("" as unknown as V);
  }

  if (rootParentIds instanceof Set) {
    return (value: V) => rootParentIds.has(value);
  }

  const set = new Set(rootParentIds);
  return (value: V) => set.has(value);
}

/**
 * Converts a flat array of items into a tree structure based on id/parentId relationships.
 * Each item will have a new property (default: "children") containing its child nodes.
 *
 * Time complexity: O(n) where n = items.length
 * Space complexity: O(n) for the Map-based index
 *
 * @template T - Type of items in the flat array
 * @template IdKey - Key in T that holds the unique identifier
 * @template ParentIdKey - Key in T that holds the parent reference
 * @template ChildrenField - Name of the children property (default: "children")
 *
 * @param params - Configuration object
 * @returns Array of root tree nodes, each with nested children
 *
 * @throws Error if throwIfOrphans is true and orphan nodes are detected
 *
 * @example
 * ```typescript
 * type Employee = { id: number; managerId: number | null; name: string };
 *
 * const employees: Employee[] = [
 *   { id: 1, managerId: null, name: "CEO" },
 *   { id: 2, managerId: 1, name: "CTO" },
 *   { id: 3, managerId: 1, name: "CFO" },
 *   { id: 4, managerId: 2, name: "Dev Lead" },
 * ];
 *
 * const tree = arrayToTree({
 *   items: employees,
 *   idKey: "id",
 *   parentIdKey: "managerId",
 * });
 * // Result type: TreeNode<Employee, "children">[]
 * // [{ id: 1, managerId: null, name: "CEO", children: [{ id: 2, ... }, { id: 3, ... }] }]
 * ```
 */
export function arrayToTree<
  T,
  IdKey extends keyof T,
  ParentIdKey extends keyof T,
  ChildrenField extends PropertyKey = "children",
>(params: ArrayToTreeParams<T, IdKey, ParentIdKey, ChildrenField>): TreeNode<T, ChildrenField>[] {
  const {
    items,
    idKey,
    parentIdKey,
    childrenField = "children" as ChildrenField,
    rootParentIds,
    throwIfOrphans = false,
  } = params;

  // Phase 1: Create tree nodes with empty children arrays, indexed by id
  const nodeMap = new Map<unknown, TreeNode<T, ChildrenField>>();
  const allNodes: TreeNode<T, ChildrenField>[] = [];

  for (const item of items) {
    const node = {
      ...item,
      [childrenField]: [],
    } as TreeNode<T, ChildrenField>;

    const id = item[idKey];
    nodeMap.set(id, node);
    allNodes.push(node);
  }

  // Phase 2: Link children to parents
  const roots: TreeNode<T, ChildrenField>[] = [];
  const isRootParentId = buildRootChecker(rootParentIds);

  for (const node of allNodes) {
    const parentIdValue = (node as T)[parentIdKey];

    if (isRootParentId(parentIdValue)) {
      roots.push(node);
    } else {
      const parentNode = nodeMap.get(parentIdValue);
      if (parentNode) {
        (parentNode[childrenField] as TreeNode<T, ChildrenField>[]).push(node);
      } else if (throwIfOrphans) {
        throw new Error(
          `Orphan node detected: item with ${String(idKey)}=${String(
            (node as T)[idKey],
          )} has ${String(parentIdKey)}=${String(parentIdValue)} which does not match any item's ${String(idKey)}.`,
        );
      } else {
        roots.push(node);
      }
    }
  }

  return roots;
}
