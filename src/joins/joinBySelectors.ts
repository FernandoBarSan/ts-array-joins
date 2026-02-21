import type { WithProperty } from "../types/index.js";
import { indexMany, indexOne } from "../utils/indexBy.js";

/**
 * Configuration for joining arrays using selector functions instead of property keys.
 */
export interface JoinBySelectorsParams<
  TParent,
  TChild,
  K extends PropertyKey,
  PropName extends PropertyKey,
> {
  /** Array of parent items */
  parents: readonly TParent[];
  /** Array of child items to join */
  children: readonly TChild[];
  /** Function to extract join key from parent */
  parentSelector: (parent: TParent) => K;
  /** Function to extract join key from child */
  childSelector: (child: TChild) => K;
  /** Name of the property to add to parents */
  as: PropName;
  /** Join mode: 'many' for arrays, 'one' for single item or null */
  mode: "many" | "one";
}

/**
 * Joins two arrays using custom selector functions for extracting join keys.
 * More flexible than attachChildren/attachChild as it allows computed join keys.
 *
 * @template TParent - Type of parent items
 * @template TChild - Type of child items
 * @template K - Type of the join key (must be PropertyKey)
 * @template PropName - Name of the property to add
 *
 * @param params - Configuration object
 * @returns Array of parents with children attached based on mode
 *
 * @example
 * ```typescript
 * type Product = { sku: string; name: string };
 * type Review = { productCode: string; rating: number };
 *
 * const products: Product[] = [
 *   { sku: "ABC-123", name: "Widget" },
 *   { sku: "XYZ-789", name: "Gadget" }
 * ];
 *
 * const reviews: Review[] = [
 *   { productCode: "ABC-123", rating: 5 },
 *   { productCode: "ABC-123", rating: 4 }
 * ];
 *
 * // Join using transformed keys
 * const result = joinBySelectors({
 *   parents: products,
 *   children: reviews,
 *   parentSelector: (p) => p.sku,
 *   childSelector: (r) => r.productCode,
 *   as: "reviews",
 *   mode: "many"
 * });
 *
 * // Result: Array<Product & { reviews: Review[] }>
 * ```
 */
export function joinBySelectors<
  TParent,
  TChild,
  K extends PropertyKey,
  PropName extends PropertyKey,
>(
  params: JoinBySelectorsParams<TParent, TChild, K, PropName> & { mode: "many" },
): Array<WithProperty<TParent, PropName, TChild[]>>;

export function joinBySelectors<
  TParent,
  TChild,
  K extends PropertyKey,
  PropName extends PropertyKey,
>(
  params: JoinBySelectorsParams<TParent, TChild, K, PropName> & { mode: "one" },
): Array<WithProperty<TParent, PropName, TChild | null>>;

export function joinBySelectors<
  TParent,
  TChild,
  K extends PropertyKey,
  PropName extends PropertyKey,
>(
  params: JoinBySelectorsParams<TParent, TChild, K, PropName>,
): Array<WithProperty<TParent, PropName, TChild[] | TChild | null>> {
  const { parents, children, parentSelector, childSelector, as, mode } = params;

  if (mode === "many") {
    const childrenByKey = indexMany(children, childSelector);

    return parents.map((parent) => {
      const key = parentSelector(parent);
      const matchingChildren = childrenByKey.get(key) ?? [];

      return {
        ...parent,
        [as]: matchingChildren,
      } as WithProperty<TParent, PropName, TChild[]>;
    });
  }
  const childByKey = indexOne(children, childSelector);

  return parents.map((parent) => {
    const key = parentSelector(parent);
    const matchingChild = childByKey.get(key) ?? null;

    return {
      ...parent,
      [as]: matchingChild,
    } as WithProperty<TParent, PropName, TChild | null>;
  });
}
