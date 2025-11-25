import type { WithProperty } from "../types/index.js";

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
  ChildPropName extends PropertyKey
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
  /** Name of the property to add to parents containing middle array */
  middleAs: MiddlePropName;
  /** Name of the property to add to middle items containing children array */
  childAs: ChildPropName;
}

type MiddleWithChildren<
  TMiddle,
  ChildPropName extends PropertyKey,
  TChild
> = WithProperty<TMiddle, ChildPropName, TChild[]>;

type ParentWithMiddleAndChildren<
  TParent,
  MiddlePropName extends PropertyKey,
  TMiddle,
  ChildPropName extends PropertyKey,
  TChild
> = WithProperty<
  TParent,
  MiddlePropName,
  Array<MiddleWithChildren<TMiddle, ChildPropName, TChild>>
>;

/**
 * Attaches children to middle items, then attaches those enriched middle items to parents.
 * This creates a three-level hierarchy where the middle array acts as a shared catalog/reference,
 * and children are filtered to show only those belonging to each specific parent.
 *
 * **Key behavior**: All parents see the SAME middle items (catalog), but each parent
 * only sees their own children within those middle items.
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
 *
 * @param params - Configuration object
 * @returns Array of parents with middle items (containing filtered children) attached
 *
 * @example
 * ```typescript
 * type Enrollment = { id: number; userId: number; courseName: string };
 * type PeriodFee = { id: number; name: string; amount: number };
 * type Payment = { id: number; enrollmentId: number; feeId: number; paid: boolean };
 *
 * const enrollments: Enrollment[] = [
 *   { id: 1, userId: 100, courseName: "TypeScript" }
 * ];
 *
 * const periodFees: PeriodFee[] = [
 *   { id: 1, name: "Registration", amount: 100 },
 *   { id: 2, name: "Tuition 1", amount: 500 },
 *   { id: 3, name: "Tuition 2", amount: 500 }
 * ];
 *
 * const payments: Payment[] = [
 *   { id: 1, enrollmentId: 1, feeId: 1, paid: true },
 *   { id: 2, enrollmentId: 1, feeId: 2, paid: true }
 *   // Note: feeId 3 has no payment yet
 * ];
 *
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
 * });
 *
 * // Result:
 * // [
 * //   {
 * //     id: 1, userId: 100, courseName: "TypeScript",
 * //     fees: [
 * //       { id: 1, name: "Registration", amount: 100, payments: [payment1] },
 * //       { id: 2, name: "Tuition 1", amount: 500, payments: [payment2] },
 * //       { id: 3, name: "Tuition 2", amount: 500, payments: [] }
 * //     ]
 * //   }
 * // ]
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
  ChildPropName extends PropertyKey
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
    ChildPropName
  >
): Array<
  ParentWithMiddleAndChildren<
    TParent,
    MiddlePropName,
    TMiddle,
    ChildPropName,
    TChild
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

      return {
        ...mid,
        [childAs]: matchingChildren,
      } as MiddleWithChildren<TMiddle, ChildPropName, TChild>;
    });

    return {
      ...parent,
      [middleAs]: middleWithChildren,
    } as ParentWithMiddleAndChildren<
      TParent,
      MiddlePropName,
      TMiddle,
      ChildPropName,
      TChild
    >;
  });
}
