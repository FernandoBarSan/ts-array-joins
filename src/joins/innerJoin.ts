import type { WithProperty } from "../types/index.js";
import { indexMany } from "../utils/indexBy.js";

/**
 * Configuration for inner join (only parents with matching children).
 */
export interface InnerJoinParams<
  TParent,
  TChild,
  ParentKey extends keyof TParent,
  ChildKey extends keyof TChild,
  PropName extends PropertyKey,
> {
  /** Array of parent items */
  parents: readonly TParent[];
  /** Array of child items */
  children: readonly TChild[];
  /** Property name in parent that contains the joining key */
  parentKey: ParentKey;
  /** Property name in child that contains the joining key */
  childKey: ChildKey;
  /** Name of the new property to add to parents containing children array */
  as: PropName;
}

/**
 * Inner join: only returns parents that have at least one matching child.
 * Parents without matching children are excluded from the result.
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
 * @returns Array of parents (with children) that had at least one match
 *
 * @example
 * ```typescript
 * type User = { id: number; name: string };
 * type Order = { id: number; userId: number; total: number };
 *
 * const users: User[] = [
 *   { id: 1, name: "Ana" },
 *   { id: 2, name: "Juan" },
 *   { id: 3, name: "Luis" }  // no orders
 * ];
 *
 * const orders: Order[] = [
 *   { id: 101, userId: 1, total: 50 },
 *   { id: 102, userId: 2, total: 75 }
 * ];
 *
 * const result = innerJoin({
 *   parents: users,
 *   children: orders,
 *   parentKey: "id",
 *   childKey: "userId",
 *   as: "orders"
 * });
 *
 * // Result: only Ana and Juan (Luis excluded - no orders)
 * // [
 * //   { id: 1, name: "Ana", orders: [{ id: 101, userId: 1, total: 50 }] },
 * //   { id: 2, name: "Juan", orders: [{ id: 102, userId: 2, total: 75 }] }
 * // ]
 * ```
 */
export function innerJoin<
  TParent,
  TChild,
  ParentKey extends keyof TParent,
  ChildKey extends keyof TChild,
  PropName extends PropertyKey,
>(
  params: InnerJoinParams<TParent, TChild, ParentKey, ChildKey, PropName>,
): Array<WithProperty<TParent, PropName, TChild[]>> {
  const { parents, children, parentKey, childKey, as } = params;

  const childrenByKey = indexMany(children, (c) => c[childKey] as unknown);

  const result: Array<WithProperty<TParent, PropName, TChild[]>> = [];

  for (const parent of parents) {
    const matching = childrenByKey.get(parent[parentKey] as unknown);

    if (matching && matching.length > 0) {
      result.push({
        ...parent,
        [as]: matching,
      } as WithProperty<TParent, PropName, TChild[]>);
    }
  }

  return result;
}
