import type { WithProperty } from "../types/index.js";

/**
 * Cardinality for relationships: "one" for single item, "many" for array
 */
export type Cardinality = "one" | "many";

/**
 * Configuration for attaching a three-level hierarchy: parents -> middle -> children.
 * This is optimized for cases where you need to filter children based on parent context.
 *
 * The middle array acts as a catalog/reference that is shared across all parents,
 * and children are filtered to match both the middle item and the parent.
 */
export interface AttachChildrenWithFilterParams<
  TParent,
  TMiddle,
  TChild,
  ParentKey extends keyof TParent,
  ChildParentKey extends keyof TChild,
  MiddleKey extends keyof TMiddle,
  ChildKey extends keyof TChild,
  MiddlePropName extends PropertyKey,
  ChildPropName extends PropertyKey,
  MiddleCard extends Cardinality = "many",
  ChildCard extends Cardinality = "many"
> {
  /** Array of parent items (top-level) */
  parents: readonly TParent[];
  /** Array of middle items (catalog/reference data shared across parents) */
  middle: readonly TMiddle[];
  /** Array of child items (will be filtered per parent) */
  children: readonly TChild[];
  /** Property name in parent that contains the joining key */
  parentKey: ParentKey;
  /** Property name in child that links to parent (for filtering) */
  childParentKey: ChildParentKey;
  /** Property name in middle that contains the joining key for children */
  middleKey: MiddleKey;
  /** Property name in child that links to middle */
  childKey: ChildKey;
  /** Name of the property to add to parents containing middle array/object */
  middleAs: MiddlePropName;
  /** Name of the property to add to middle items containing children array/object */
  childAs: ChildPropName;
  /**
   * Cardinality for middle items: "many" (default) returns array, "one" returns single object or undefined
   * @default "many"
   */
  middleCardinality?: MiddleCard;
  /**
   * Cardinality for child items: "many" (default) returns array, "one" returns single object or undefined
   * @default "many"
   */
  childCardinality?: ChildCard;
}

// Helper types for cardinality resolution
type CardinalityResult<T, Card extends Cardinality> = Card extends "one"
  ? T | undefined
  : T[];

type MiddleWithChildren<
  TMiddle,
  ChildPropName extends PropertyKey,
  TChild,
  ChildCard extends Cardinality
> = WithProperty<TMiddle, ChildPropName, CardinalityResult<TChild, ChildCard>>;

type ParentWithMiddleAndChildren<
  TParent,
  MiddlePropName extends PropertyKey,
  TMiddle,
  ChildPropName extends PropertyKey,
  TChild,
  MiddleCard extends Cardinality,
  ChildCard extends Cardinality
> = WithProperty<
  TParent,
  MiddlePropName,
  CardinalityResult<
    MiddleWithChildren<TMiddle, ChildPropName, TChild, ChildCard>,
    MiddleCard
  >
>;

/**
 * Attaches children to middle items, then attaches those enriched middle items to parents.
 * This creates a three-level hierarchy where the middle array acts as a shared catalog/reference,
 * and children are filtered to show only those belonging to each specific parent.
 *
 * **Key behavior**: All parents see the SAME middle items (catalog), but each parent
 * only sees their own children within those middle items.
 *
 * **Cardinality control**: Use `middleCardinality` and `childCardinality` to control whether
 * the result is an array (many) or a single object (one).
 *
 * This is perfect for scenarios like:
 * - Enrollments -> PeriodFees (shared catalog) -> EnrollmentPayments (filtered by enrollment)
 * - Users -> Products (shared catalog) -> UserPurchases (filtered by user)
 * - Orders -> AvailableItems (shared catalog) -> OrderItems (filtered by order)
 *
 * Time complexity: O(p × m + c) where p = parents, m = middle, c = children
 * Space complexity: O(c) for the children index map
 *
 * @template TParent - Type of parent items
 * @template TMiddle - Type of middle items (catalog/reference shared across all parents)
 * @template TChild - Type of child items (filtered per parent)
 * @template ParentKey - Key in parent used for joining with children
 * @template ChildParentKey - Key in child that links back to parent (for filtering)
 * @template MiddleKey - Key in middle used for joining with children
 * @template ChildKey - Key in child that links to middle
 * @template MiddlePropName - Name of property to add to parents
 * @template ChildPropName - Name of property to add to middle items
 * @template MiddleCard - Cardinality for middle: "many" (array) or "one" (single object)
 * @template ChildCard - Cardinality for children: "many" (array) or "one" (single object)
 *
 * @param params - Configuration object
 * @returns Array of parents with middle items (containing filtered children) attached
 *
 * @example
 * // Default: many-to-many (arrays)
 * ```typescript
 * const result = attachChildrenWithFilter({
 *   parents: enrollments,
 *   middle: periodFees,
 *   children: payments,
 *   parentKey: "id",
 *   childParentKey: "enrollmentId",
 *   middleKey: "id",
 *   childKey: "feeId",
 *   middleAs: "fees",
 *   childAs: "payments"
 *   // middleCardinality: "many" (default)
 *   // childCardinality: "many" (default)
 * });
 * // Result: { fees: Array<{ payments: Payment[] }> }
 * ```
 *
 * @example
 * // One-to-one: single fee with single payment
 * ```typescript
 * const result = attachChildrenWithFilter({
 *   parents: enrollments,
 *   middle: periodFees,
 *   children: payments,
 *   parentKey: "id",
 *   childParentKey: "enrollmentId",
 *   middleKey: "id",
 *   childKey: "feeId",
 *   middleAs: "fee",
 *   childAs: "payment",
 *   middleCardinality: "one",
 *   childCardinality: "one"
 * });
 * // Result: { fee?: { payment?: Payment } }
 * ```
 *
 * @example
 * // Many-to-one: multiple fees, each with at most one payment
 * ```typescript
 * const result = attachChildrenWithFilter({
 *   parents: inscripciones,
 *   middle: cuotasPeriodo,
 *   children: cuotasInscripcion,
 *   parentKey: "idInscripcion",
 *   childParentKey: "idInscripcion",
 *   middleKey: "idPeriodoCuota",
 *   childKey: "idPeriodoCuota",
 *   middleAs: "cuotasPeriodo",
 *   childAs: "pago",
 *   childCardinality: "one" // ← Each fee has at most ONE payment
 * });
 * // Result: { cuotasPeriodo: Array<{ pago?: CuotaInscripcion }> }
 * ```
 */
export function attachChildrenWithFilter<
  TParent,
  TMiddle,
  TChild,
  ParentKey extends keyof TParent,
  ChildParentKey extends keyof TChild,
  MiddleKey extends keyof TMiddle,
  ChildKey extends keyof TChild,
  MiddlePropName extends PropertyKey,
  ChildPropName extends PropertyKey,
  MiddleCard extends Cardinality = "many",
  ChildCard extends Cardinality = "many"
>(
  params: AttachChildrenWithFilterParams<
    TParent,
    TMiddle,
    TChild,
    ParentKey,
    ChildParentKey,
    MiddleKey,
    ChildKey,
    MiddlePropName,
    ChildPropName,
    MiddleCard,
    ChildCard
  >
): Array<
  ParentWithMiddleAndChildren<
    TParent,
    MiddlePropName,
    TMiddle,
    ChildPropName,
    TChild,
    MiddleCard,
    ChildCard
  >
> {
  const {
    parents,
    middle,
    children,
    parentKey,
    childParentKey,
    middleKey,
    childKey,
    middleAs,
    childAs,
    middleCardinality = "many" as MiddleCard,
    childCardinality = "many" as ChildCard,
  } = params;

  // Step 1: Create index of children by middleKey - O(c)
  const childrenByMiddleKey = new Map<unknown, TChild[]>();
  for (const child of children) {
    const key = child[childKey];
    const existing = childrenByMiddleKey.get(key);
    if (existing) {
      existing.push(child);
    } else {
      childrenByMiddleKey.set(key, [child]);
    }
  }

  // Step 2: For each parent, create middle items with filtered children - O(p × m)
  return parents.map((parent) => {
    const parentKeyValue = parent[parentKey];

    // For each middle item, attach children filtered by parent
    const middleWithChildren = middle.map((mid) => {
      const midKeyValue = mid[middleKey];
      const allChildrenForMiddle = childrenByMiddleKey.get(midKeyValue) ?? [];

      // Filter children that belong to this parent
      const matchingChildren = allChildrenForMiddle.filter(
        (child) => (child[childParentKey] as unknown) === parentKeyValue
      );

      // Apply child cardinality
      const childValue =
        childCardinality === "one"
          ? matchingChildren[0] ?? undefined
          : matchingChildren;

      return {
        ...mid,
        [childAs]: childValue,
      } as MiddleWithChildren<TMiddle, ChildPropName, TChild, ChildCard>;
    });

    // Apply middle cardinality
    const middleValue =
      middleCardinality === "one"
        ? middleWithChildren[0] ?? undefined
        : middleWithChildren;

    return {
      ...parent,
      [middleAs]: middleValue,
    } as ParentWithMiddleAndChildren<
      TParent,
      MiddlePropName,
      TMiddle,
      ChildPropName,
      TChild,
      MiddleCard,
      ChildCard
    >;
  });
}
