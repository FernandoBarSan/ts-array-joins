/**
 * Denormalizes a parent-children relationship into flat rows.
 * Each parent is combined with each of its children via spread.
 * Parents without children are excluded from the result.
 *
 * Time complexity: O(n * k) where n = parents, k = avg children per parent
 *
 * @template T - Type of parent items (including children property)
 * @template K - Key of the children property
 * @param items - Array of parent items with children attached
 * @param childrenKey - Name of the property containing the children array
 * @returns Flat array where each row is a parent merged with one child
 *
 * @example
 * ```typescript
 * type UserWithOrders = User & { orders: Order[] };
 *
 * const usersWithOrders: UserWithOrders[] = [
 *   { id: 1, name: "Ana", orders: [{ orderId: 101, total: 50 }, { orderId: 102, total: 100 }] },
 *   { id: 2, name: "Juan", orders: [{ orderId: 103, total: 75 }] },
 * ];
 *
 * const rows = flatMapChildren(usersWithOrders, "orders");
 * // [
 * //   { id: 1, name: "Ana", orderId: 101, total: 50 },
 * //   { id: 1, name: "Ana", orderId: 102, total: 100 },
 * //   { id: 2, name: "Juan", orderId: 103, total: 75 },
 * // ]
 * ```
 */
export function flatMapChildren<T, K extends keyof T>(
  items: readonly T[],
  childrenKey: K,
): Array<Omit<T, K> & (T[K] extends readonly (infer C)[] ? C : never)> {
  type Child = T[K] extends readonly (infer C)[] ? C : never;
  type Row = Omit<T, K> & Child;

  const result: Row[] = [];

  for (const item of items) {
    const children = item[childrenKey];
    if (!Array.isArray(children)) continue;

    const { [childrenKey]: _, ...parent } = item as Record<PropertyKey, unknown>;

    for (const child of children) {
      result.push({ ...parent, ...(child as Record<string, unknown>) } as Row);
    }
  }

  return result;
}
