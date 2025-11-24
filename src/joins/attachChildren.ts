import type { WithProperty } from "../types/index.js";

/**
 * Configuration for attaching children to parent items (one-to-many relationship).
 */
export interface AttachChildrenParams<
  TParent,
  TChild,
  ParentKey extends keyof TParent,
  ChildKey extends keyof TChild,
  PropName extends PropertyKey
> {
  /** Array of parent items */
  parents: readonly TParent[];
  /** Array of child items to attach */
  children: readonly TChild[];
  /** Property name in parent that contains the joining key */
  parentKey: ParentKey;
  /** Property name in child that contains the joining key */
  childKey: ChildKey;
  /** Name of the new property to add to parents containing children array */
  as: PropName;
}

/**
 * Attaches child items to parent items based on matching keys (one-to-many join).
 * Each parent will have a new property containing an array of matching children.
 * Parents without children will have an empty array.
 *
 * Time complexity: O(n + m) where n = parents.length, m = children.length
 *
 * @template TParent - Type of parent items
 * @template TChild - Type of child items
 * @template ParentKey - Key in parent used for joining
 * @template ChildKey - Key in child used for joining
 * @template PropName - Name of the property to add to parents
 *
 * @param params - Configuration object
 * @returns New array of parents with children attached
 *
 * @example
 * ```typescript
 * type User = { id: number; name: string };
 * type Order = { id: number; userId: number; total: number };
 *
 * const users: User[] = [
 *   { id: 1, name: "Ana" },
 *   { id: 2, name: "Juan" }
 * ];
 *
 * const orders: Order[] = [
 *   { id: 101, userId: 1, total: 50 },
 *   { id: 102, userId: 1, total: 100 },
 *   { id: 103, userId: 2, total: 75 }
 * ];
 *
 * const result = attachChildren({
 *   parents: users,
 *   children: orders,
 *   parentKey: "id",
 *   childKey: "userId",
 *   as: "orders"
 * });
 *
 * // Result type: Array<User & { orders: Order[] }>
 * // [
 * //   { id: 1, name: "Ana", orders: [order101, order102] },
 * //   { id: 2, name: "Juan", orders: [order103] }
 * // ]
 * ```
 */
export function attachChildren<
  TParent,
  TChild,
  ParentKey extends keyof TParent,
  ChildKey extends keyof TChild,
  PropName extends PropertyKey
>(
  params: AttachChildrenParams<TParent, TChild, ParentKey, ChildKey, PropName>
): Array<WithProperty<TParent, PropName, TChild[]>> {
  const { parents, children, parentKey, childKey, as } = params;

  // Create index of children by the child key for O(1) lookup
  const childrenByKey = new Map<unknown, TChild[]>();

  for (const child of children) {
    const key = child[childKey];
    const existing = childrenByKey.get(key);

    if (existing) {
      existing.push(child);
    } else {
      childrenByKey.set(key, [child]);
    }
  }

  // Attach children to each parent
  return parents.map((parent) => {
    const parentKeyValue = parent[parentKey];
    const matchingChildren = childrenByKey.get(parentKeyValue) ?? [];

    return {
      ...parent,
      [as]: matchingChildren,
    } as WithProperty<TParent, PropName, TChild[]>;
  });
}
