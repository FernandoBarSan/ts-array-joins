import type { WithProperty } from "../types/index.js";
import { indexMany } from "../utils/indexBy.js";

/**
 * Configuration for attaching children with a filter predicate.
 */
export interface AttachChildrenWhereParams<
  TParent,
  TChild,
  ParentKey extends keyof TParent,
  ChildKey extends keyof TChild,
  PropName extends PropertyKey,
> {
  /** Array of parent items */
  parents: readonly TParent[];
  /** Array of child items to attach */
  children: readonly TChild[];
  /** Property name in parent that contains the joining key */
  parentKey: ParentKey;
  /** Property name in child that contains the joining key */
  childKey: ChildKey;
  /** Name of the new property to add to parents containing filtered children */
  as: PropName;
  /** Predicate to filter children after key matching. Receives the child and the parent. */
  where: (child: TChild, parent: TParent) => boolean;
}

/**
 * Attaches children to parents with an additional filter predicate.
 * Children are first matched by key (O(n+m)), then filtered by the predicate.
 *
 * Time complexity: O(n + m) for indexing, plus O(k) per parent where k = matched children
 *
 * @template TParent - Type of parent items
 * @template TChild - Type of child items
 * @template ParentKey - Key in parent used for joining
 * @template ChildKey - Key in child used for joining
 * @template PropName - Name of the property to add to parents
 *
 * @param params - Configuration object
 * @returns New array of parents with filtered children attached
 *
 * @example
 * ```typescript
 * type User = { id: number; name: string; minAmount: number };
 * type Order = { id: number; userId: number; total: number; status: string };
 *
 * const result = attachChildrenWhere({
 *   parents: users,
 *   children: orders,
 *   parentKey: "id",
 *   childKey: "userId",
 *   as: "activeOrders",
 *   where: (order, user) => order.status === "active" && order.total > user.minAmount
 * });
 *
 * // Each user gets only their active orders above their minimum amount
 * ```
 */
export function attachChildrenWhere<
  TParent,
  TChild,
  ParentKey extends keyof TParent,
  ChildKey extends keyof TChild,
  PropName extends PropertyKey,
>(
  params: AttachChildrenWhereParams<TParent, TChild, ParentKey, ChildKey, PropName>,
): Array<WithProperty<TParent, PropName, TChild[]>> {
  const { parents, children, parentKey, childKey, as, where } = params;

  const childrenByKey = indexMany(children, (c) => c[childKey] as unknown);

  return parents.map((parent) => {
    const candidates = childrenByKey.get(parent[parentKey] as unknown) ?? [];
    const filtered = candidates.filter((child) => where(child, parent));

    return {
      ...parent,
      [as]: filtered,
    } as WithProperty<TParent, PropName, TChild[]>;
  });
}
