import type { WithProperty } from "../types/index.js";
import {
  createNestedGroups,
  getFromNestedGroups,
} from "../utils/nestedGroup.js";

/**
 * Configuration for attaching a single child using nested composite keys.
 */
export interface AttachChildNestedParams<
  TParent,
  TChild,
  ParentKeys extends ReadonlyArray<keyof TParent>,
  ChildKeys extends ReadonlyArray<keyof TChild>,
  PropName extends PropertyKey
> {
  /** Array of parent items */
  parents: readonly TParent[];
  /** Array of child items (only first match per parent will be attached) */
  children: readonly TChild[];
  /** Property names in parent that form the composite key (in order) */
  parentKeys: ParentKeys;
  /** Property names in child that form the composite key (in order) */
  childKeys: ChildKeys;
  /** Name of the new property to add to parents containing the child or null */
  as: PropName;
}

/**
 * Attaches a single child item to parent items using nested composite keys (one-to-one join).
 * Creates a nested group structure for efficient lookup.
 *
 * Time complexity: O(n + m) where n = parents.length, m = children.length
 *
 * @template TParent - Type of parent items
 * @template TChild - Type of child items
 * @template ParentKeys - Keys in parent used for joining (in order)
 * @template ChildKeys - Keys in child used for joining (in order)
 * @template PropName - Name of the property to add to parents
 *
 * @param params - Configuration object
 * @returns New array of parents with single child attached (or null)
 *
 * @example
 * ```typescript
 * type Product = { sku: string; origin: string; name: string };
 * type Price = { sku: string; origin: string; amount: number };
 *
 * const products: Product[] = [
 *   { sku: 'SKU-A', origin: 'origin1', name: 'Widget A1' },
 *   { sku: 'SKU-A', origin: 'origin2', name: 'Widget A2' }
 * ];
 *
 * const prices: Price[] = [
 *   { sku: 'SKU-A', origin: 'origin1', amount: 99.99 },
 *   { sku: 'SKU-A', origin: 'origin2', amount: 89.99 }
 * ];
 *
 * const result = attachChildNested({
 *   parents: products,
 *   children: prices,
 *   parentKeys: ['sku', 'origin'],
 *   childKeys: ['sku', 'origin'],
 *   as: 'price'
 * });
 * ```
 */
export function attachChildNested<
  TParent,
  TChild,
  ParentKeys extends ReadonlyArray<keyof TParent>,
  ChildKeys extends ReadonlyArray<keyof TChild>,
  PropName extends PropertyKey
>(
  params: AttachChildNestedParams<
    TParent,
    TChild,
    ParentKeys,
    ChildKeys,
    PropName
  >
): Array<WithProperty<TParent, PropName, TChild | null>> {
  const { parents, children, parentKeys, childKeys, as } = params;

  // Create nested group structure from children
  const nestedGroups = createNestedGroups(children, childKeys);

  // Attach first matching child to each parent
  return parents.map((parent) => {
    // Extract the path from parent keys
    const path = parentKeys.map((key) => parent[key]);

    // Get matching children from nested structure
    const matchingChildren = getFromNestedGroups<TChild>(nestedGroups, path);

    // Take first match or null
    const matchingChild =
      matchingChildren.length > 0 ? matchingChildren[0] : null;

    return {
      ...parent,
      [as]: matchingChild,
    } as WithProperty<TParent, PropName, TChild | null>;
  });
}
