import type { WithProperty } from "../types/index.js";
import {
  createNestedGroups,
  getFromNestedGroups,
} from "../utils/nestedGroup.js";

/**
 * Configuration for attaching children using nested composite keys.
 */
export interface AttachChildrenNestedParams<
  TParent,
  TChild,
  ParentKeys extends ReadonlyArray<keyof TParent>,
  ChildKeys extends ReadonlyArray<keyof TChild>,
  PropName extends PropertyKey
> {
  /** Array of parent items */
  parents: readonly TParent[];
  /** Array of child items to attach */
  children: readonly TChild[];
  /** Property names in parent that form the composite key (in order) */
  parentKeys: ParentKeys;
  /** Property names in child that form the composite key (in order) */
  childKeys: ChildKeys;
  /** Name of the new property to add to parents containing children array */
  as: PropName;
}

/**
 * Attaches child items to parent items using nested composite keys (one-to-many join).
 * Creates a nested group structure for efficient lookup, similar to groupByMany.
 *
 * This approach creates a structure like:
 * ```
 * {
 *   "SKU-A": {
 *     "origin1": [child1, child2],
 *     "origin2": [child3]
 *   },
 *   "SKU-B": {
 *     "origin1": [child4]
 *   }
 * }
 * ```
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
 * @returns New array of parents with children attached
 *
 * @example
 * ```typescript
 * type Product = { sku: string; origin: string; name: string };
 * type Inventory = { sku: string; origin: string; quantity: number };
 *
 * const products: Product[] = [
 *   { sku: 'SKU-A', origin: 'origin1', name: 'Widget A1' },
 *   { sku: 'SKU-A', origin: 'origin2', name: 'Widget A2' },
 *   { sku: 'SKU-B', origin: 'origin1', name: 'Gadget B1' }
 * ];
 *
 * const inventory: Inventory[] = [
 *   { sku: 'SKU-A', origin: 'origin1', quantity: 100 },
 *   { sku: 'SKU-A', origin: 'origin1', quantity: 50 },
 *   { sku: 'SKU-A', origin: 'origin2', quantity: 75 }
 * ];
 *
 * const result = attachChildrenNested({
 *   parents: products,
 *   children: inventory,
 *   parentKeys: ['sku', 'origin'],
 *   childKeys: ['sku', 'origin'],
 *   as: 'inventoryRecords'
 * });
 *
 * // Internal structure created:
 * // {
 * //   "SKU-A": {
 * //     "origin1": [inv1, inv2],
 * //     "origin2": [inv3]
 * //   },
 * //   "SKU-B": {
 * //     "origin1": []
 * //   }
 * // }
 * ```
 */
export function attachChildrenNested<
  TParent,
  TChild,
  ParentKeys extends ReadonlyArray<keyof TParent>,
  ChildKeys extends ReadonlyArray<keyof TChild>,
  PropName extends PropertyKey
>(
  params: AttachChildrenNestedParams<
    TParent,
    TChild,
    ParentKeys,
    ChildKeys,
    PropName
  >
): Array<WithProperty<TParent, PropName, TChild[]>> {
  const { parents, children, parentKeys, childKeys, as } = params;

  // Create nested group structure from children
  const nestedGroups = createNestedGroups(children, childKeys);

  // Attach children to each parent by navigating the nested structure
  return parents.map((parent) => {
    // Extract the path from parent keys
    const path = parentKeys.map((key) => parent[key]);

    // Get matching children from nested structure
    const matchingChildren = getFromNestedGroups<TChild>(nestedGroups, path);

    return {
      ...parent,
      [as]: matchingChildren,
    } as WithProperty<TParent, PropName, TChild[]>;
  });
}
