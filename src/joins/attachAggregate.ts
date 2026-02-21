import type { WithProperty } from "../types/index.js";
import { indexMany } from "../utils/indexBy.js";

/**
 * Configuration for attaching an aggregated value from matching children.
 */
export interface AttachAggregateParams<
  TParent,
  TChild,
  ParentKey extends keyof TParent,
  ChildKey extends keyof TChild,
  PropName extends PropertyKey,
  TResult,
> {
  /** Array of parent items */
  parents: readonly TParent[];
  /** Array of child items to aggregate */
  children: readonly TChild[];
  /** Property name in parent that contains the joining key */
  parentKey: ParentKey;
  /** Property name in child that contains the joining key */
  childKey: ChildKey;
  /** Name of the new property to add to parents containing the aggregated value */
  as: PropName;
  /** Aggregation function that receives matching children and returns a computed value */
  aggregate: (children: TChild[]) => TResult;
}

/**
 * Attaches an aggregated value computed from matching children.
 * Instead of attaching an array of children, computes a single value.
 * Useful for counts, sums, averages, min/max, or any custom aggregation.
 *
 * Time complexity: O(n + m) for indexing, plus O(k) per parent for aggregation
 *
 * @template TParent - Type of parent items
 * @template TChild - Type of child items
 * @template ParentKey - Key in parent used for joining
 * @template ChildKey - Key in child used for joining
 * @template PropName - Name of the property to add to parents
 * @template TResult - Type of the aggregated result
 *
 * @param params - Configuration object
 * @returns New array of parents with aggregated value attached
 *
 * @example
 * ```typescript
 * type User = { id: number; name: string };
 * type Order = { id: number; userId: number; total: number };
 *
 * const result = attachAggregate({
 *   parents: users,
 *   children: orders,
 *   parentKey: "id",
 *   childKey: "userId",
 *   as: "orderTotal",
 *   aggregate: (orders) => orders.reduce((sum, o) => sum + o.total, 0)
 * });
 *
 * // Result type: Array<User & { orderTotal: number }>
 * // [
 * //   { id: 1, name: "Ana", orderTotal: 150 },
 * //   { id: 2, name: "Juan", orderTotal: 75 }
 * // ]
 * ```
 */
export function attachAggregate<
  TParent,
  TChild,
  ParentKey extends keyof TParent,
  ChildKey extends keyof TChild,
  PropName extends PropertyKey,
  TResult,
>(
  params: AttachAggregateParams<TParent, TChild, ParentKey, ChildKey, PropName, TResult>,
): Array<WithProperty<TParent, PropName, TResult>> {
  const { parents, children, parentKey, childKey, as, aggregate } = params;

  const childrenByKey = indexMany(children, (c) => c[childKey] as unknown);

  return parents.map((parent) => {
    const matching = childrenByKey.get(parent[parentKey] as unknown) ?? [];

    return {
      ...parent,
      [as]: aggregate(matching),
    } as WithProperty<TParent, PropName, TResult>;
  });
}
