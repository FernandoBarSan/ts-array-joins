import { indexMany } from "../utils/indexBy.js";

/**
 * Configuration for full outer join.
 */
export interface FullOuterJoinParams<
  TLeft,
  TRight,
  LeftKey extends keyof TLeft,
  RightKey extends keyof TRight,
> {
  /** Left-side array */
  left: readonly TLeft[];
  /** Right-side array */
  right: readonly TRight[];
  /** Property name in left items that contains the joining key */
  leftKey: LeftKey;
  /** Property name in right items that contains the joining key */
  rightKey: RightKey;
}

/**
 * A single row from a full outer join result.
 * Either side can be null if there was no match.
 */
export interface FullOuterJoinRow<TLeft, TRight> {
  left: TLeft | null;
  right: TRight | null;
}

/**
 * Full outer join: returns all items from both arrays, matching where possible.
 * Unmatched items from either side appear with null on the other side.
 *
 * - Left items without a right match → `{ left: item, right: null }`
 * - Right items without a left match → `{ left: null, right: item }`
 * - Matched pairs → `{ left: leftItem, right: rightItem }` (one row per combination)
 *
 * Time complexity: O(n + m) where n = left.length, m = right.length
 *
 * @template TLeft - Type of left-side items
 * @template TRight - Type of right-side items
 * @template LeftKey - Key in left used for joining
 * @template RightKey - Key in right used for joining
 *
 * @param params - Configuration object
 * @returns Array of joined rows
 *
 * @example
 * ```typescript
 * const result = fullOuterJoin({
 *   left: users,
 *   right: orders,
 *   leftKey: "id",
 *   rightKey: "userId",
 * });
 *
 * // Result:
 * // [
 * //   { left: { id: 1, name: "Ana" }, right: { orderId: 101, userId: 1 } },
 * //   { left: { id: 2, name: "Juan" }, right: null },          // no orders
 * //   { left: null, right: { orderId: 102, userId: 99 } },     // orphan order
 * // ]
 * ```
 */
export function fullOuterJoin<
  TLeft,
  TRight,
  LeftKey extends keyof TLeft,
  RightKey extends keyof TRight,
>(
  params: FullOuterJoinParams<TLeft, TRight, LeftKey, RightKey>,
): FullOuterJoinRow<TLeft, TRight>[] {
  const { left, right, leftKey, rightKey } = params;

  const rightByKey = indexMany(right, (r) => r[rightKey] as unknown);
  const matchedRightKeys = new Set<unknown>();

  const result: FullOuterJoinRow<TLeft, TRight>[] = [];

  // Process all left items
  for (const leftItem of left) {
    const key = leftItem[leftKey] as unknown;
    const matchingRight = rightByKey.get(key);

    if (matchingRight && matchingRight.length > 0) {
      matchedRightKeys.add(key);
      for (const rightItem of matchingRight) {
        result.push({ left: leftItem, right: rightItem });
      }
    } else {
      result.push({ left: leftItem, right: null });
    }
  }

  // Process unmatched right items
  for (const rightItem of right) {
    const key = rightItem[rightKey] as unknown;
    if (!matchedRightKeys.has(key)) {
      result.push({ left: null, right: rightItem });
    }
  }

  return result;
}
