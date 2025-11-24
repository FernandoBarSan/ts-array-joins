import type { WithProperty } from "../types/index.js";

/**
 * Configuration for attaching a single child to parent items (one-to-one relationship).
 */
export interface AttachChildParams<
  TParent,
  TChild,
  ParentKey extends keyof TParent,
  ChildKey extends keyof TChild,
  PropName extends PropertyKey
> {
  /** Array of parent items */
  parents: readonly TParent[];
  /** Array of child items (only first match per parent will be attached) */
  children: readonly TChild[];
  /** Property name in parent that contains the joining key */
  parentKey: ParentKey;
  /** Property name in child that contains the joining key */
  childKey: ChildKey;
  /** Name of the new property to add to parents containing the child or null */
  as: PropName;
}

/**
 * Attaches a single child item to parent items based on matching keys (one-to-one join).
 * Each parent will have a new property containing the first matching child or null.
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
 * @returns New array of parents with single child attached (or null)
 *
 * @example
 * ```typescript
 * type User = { id: number; name: string };
 * type Address = { id: number; userId: number; city: string };
 *
 * const users: User[] = [
 *   { id: 1, name: "Ana" },
 *   { id: 2, name: "Juan" }
 * ];
 *
 * const addresses: Address[] = [
 *   { id: 201, userId: 1, city: "Madrid" },
 *   { id: 202, userId: 2, city: "Barcelona" }
 * ];
 *
 * const result = attachChild({
 *   parents: users,
 *   children: addresses,
 *   parentKey: "id",
 *   childKey: "userId",
 *   as: "address"
 * });
 *
 * // Result type: Array<User & { address: Address | null }>
 * // [
 * //   { id: 1, name: "Ana", address: { id: 201, userId: 1, city: "Madrid" } },
 * //   { id: 2, name: "Juan", address: { id: 202, userId: 2, city: "Barcelona" } }
 * // ]
 * ```
 */
export function attachChild<
  TParent,
  TChild,
  ParentKey extends keyof TParent,
  ChildKey extends keyof TChild,
  PropName extends PropertyKey
>(
  params: AttachChildParams<TParent, TChild, ParentKey, ChildKey, PropName>
): Array<WithProperty<TParent, PropName, TChild | null>> {
  const { parents, children, parentKey, childKey, as } = params;

  // Create index of children by the child key for O(1) lookup
  // Only store the first match for each key
  const childByKey = new Map<unknown, TChild>();

  for (const child of children) {
    const key = child[childKey];

    // Only set if not already present (first match wins)
    if (!childByKey.has(key)) {
      childByKey.set(key, child);
    }
  }

  // Attach child to each parent
  return parents.map((parent) => {
    const parentKeyValue = parent[parentKey];
    const matchingChild = childByKey.get(parentKeyValue) ?? null;

    return {
      ...parent,
      [as]: matchingChild,
    } as WithProperty<TParent, PropName, TChild | null>;
  });
}
