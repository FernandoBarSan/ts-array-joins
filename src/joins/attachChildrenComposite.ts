import type { WithProperty } from "../types/index.js";
import { makeCompositeKeyExtractor } from "../utils/compositeKey.js";

/**
 * Configuration for attaching children using composite keys.
 */
export interface AttachChildrenCompositeParams<
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
  /** Property names in parent that form the composite key */
  parentKeys: ParentKeys;
  /** Property names in child that form the composite key */
  childKeys: ChildKeys;
  /** Name of the new property to add to parents containing children array */
  as: PropName;
}

/**
 * Attaches child items to parent items using composite keys (one-to-many join).
 * Uses serialized composite keys for efficient lookup.
 * Useful when the relationship is defined by multiple properties.
 *
 * Time complexity: O(n + m) where n = parents.length, m = children.length
 *
 * @template TParent - Type of parent items
 * @template TChild - Type of child items
 * @template ParentKeys - Keys in parent used for joining
 * @template ChildKeys - Keys in child used for joining
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
 * const result = attachChildrenComposite({
 *   parents: products,
 *   children: inventory,
 *   parentKeys: ['sku', 'origin'],
 *   childKeys: ['sku', 'origin'],
 *   as: 'inventoryRecords'
 * });
 *
 * // Internal structure uses serialized keys:
 * // {
 * //   "SKU-A||~~||origin1": [inv1, inv2],
 * //   "SKU-A||~~||origin2": [inv3],
 * //   "SKU-B||~~||origin1": []
 * // }
 * ```
 */
export function attachChildrenComposite<
  TParent,
  TChild,
  ParentKeys extends ReadonlyArray<keyof TParent>,
  ChildKeys extends ReadonlyArray<keyof TChild>,
  PropName extends PropertyKey
>(
  params: AttachChildrenCompositeParams<
    TParent,
    TChild,
    ParentKeys,
    ChildKeys,
    PropName
  >
): Array<WithProperty<TParent, PropName, TChild[]>> {
  const { parents, children, parentKeys, childKeys, as } = params;

  // Create key extractors
  const parentKeyExtractor = makeCompositeKeyExtractor<TParent>(parentKeys);
  const childKeyExtractor = makeCompositeKeyExtractor<TChild>(childKeys);

  // Build index of children by composite key
  const childrenByKey = new Map<string, TChild[]>();

  for (const child of children) {
    const key = childKeyExtractor(child);
    const existing = childrenByKey.get(key);

    if (existing) {
      existing.push(child);
    } else {
      childrenByKey.set(key, [child]);
    }
  }

  // Attach children to each parent
  return parents.map((parent) => {
    const parentKey = parentKeyExtractor(parent);
    const matchingChildren = childrenByKey.get(parentKey) ?? [];

    return {
      ...parent,
      [as]: matchingChildren,
    } as WithProperty<TParent, PropName, TChild[]>;
  });
}
