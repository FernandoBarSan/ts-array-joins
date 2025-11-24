import type { WithProperty } from "../types/index.js";
import { makeCompositeKeyExtractor } from "../utils/compositeKey.js";

/**
 * Configuration for attaching a single child using composite keys.
 */
export interface AttachChildCompositeParams<
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
  /** Property names in parent that form the composite key */
  parentKeys: ParentKeys;
  /** Property names in child that form the composite key */
  childKeys: ChildKeys;
  /** Name of the new property to add to parents containing the child or null */
  as: PropName;
}

/**
 * Attaches a single child item to parent items using composite keys (one-to-one join).
 * Uses serialized composite keys for efficient lookup.
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
 * const result = attachChildComposite({
 *   parents: products,
 *   children: prices,
 *   parentKeys: ['sku', 'origin'],
 *   childKeys: ['sku', 'origin'],
 *   as: 'price'
 * });
 * ```
 */
export function attachChildComposite<
  TParent,
  TChild,
  ParentKeys extends ReadonlyArray<keyof TParent>,
  ChildKeys extends ReadonlyArray<keyof TChild>,
  PropName extends PropertyKey
>(
  params: AttachChildCompositeParams<
    TParent,
    TChild,
    ParentKeys,
    ChildKeys,
    PropName
  >
): Array<WithProperty<TParent, PropName, TChild | null>> {
  const { parents, children, parentKeys, childKeys, as } = params;

  // Create key extractors
  const parentKeyExtractor = makeCompositeKeyExtractor<TParent>(parentKeys);
  const childKeyExtractor = makeCompositeKeyExtractor<TChild>(childKeys);

  // Build index of children by composite key (first match only)
  const childByKey = new Map<string, TChild>();

  for (const child of children) {
    const key = childKeyExtractor(child);

    // Only set if not already present (first match wins)
    if (!childByKey.has(key)) {
      childByKey.set(key, child);
    }
  }

  // Attach child to each parent
  return parents.map((parent) => {
    const parentKey = parentKeyExtractor(parent);
    const matchingChild = childByKey.get(parentKey) ?? null;

    return {
      ...parent,
      [as]: matchingChild,
    } as WithProperty<TParent, PropName, TChild | null>;
  });
}
