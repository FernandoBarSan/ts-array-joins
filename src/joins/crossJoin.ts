/**
 * Produces the Cartesian product of two arrays.
 * Every item from the left array is combined with every item from the right array.
 *
 * Time complexity: O(n * m) where n = left.length, m = right.length
 *
 * @template TLeft - Type of left-side items
 * @template TRight - Type of right-side items
 * @param left - Left array
 * @param right - Right array
 * @returns Array of `{ left, right }` pairs
 *
 * @example
 * ```typescript
 * const sizes = [{ size: "S" }, { size: "M" }];
 * const colors = [{ color: "red" }, { color: "blue" }];
 *
 * const combos = crossJoin(sizes, colors);
 * // [
 * //   { left: { size: "S" }, right: { color: "red" } },
 * //   { left: { size: "S" }, right: { color: "blue" } },
 * //   { left: { size: "M" }, right: { color: "red" } },
 * //   { left: { size: "M" }, right: { color: "blue" } },
 * // ]
 * ```
 */
export function crossJoin<TLeft, TRight>(
  left: readonly TLeft[],
  right: readonly TRight[],
): Array<{ left: TLeft; right: TRight }> {
  const result: Array<{ left: TLeft; right: TRight }> = [];

  for (const leftItem of left) {
    for (const rightItem of right) {
      result.push({ left: leftItem, right: rightItem });
    }
  }

  return result;
}

/**
 * Produces the Cartesian product and merges each pair into a single object.
 * Properties from right override properties from left if they share the same key.
 *
 * Time complexity: O(n * m) where n = left.length, m = right.length
 *
 * @template TLeft - Type of left-side items
 * @template TRight - Type of right-side items
 * @param left - Left array
 * @param right - Right array
 * @returns Array of merged objects
 *
 * @example
 * ```typescript
 * const sizes = [{ size: "S" }, { size: "M" }];
 * const colors = [{ color: "red" }, { color: "blue" }];
 *
 * const combos = crossJoinMerge(sizes, colors);
 * // [
 * //   { size: "S", color: "red" },
 * //   { size: "S", color: "blue" },
 * //   { size: "M", color: "red" },
 * //   { size: "M", color: "blue" },
 * // ]
 * ```
 */
export function crossJoinMerge<TLeft, TRight>(
  left: readonly TLeft[],
  right: readonly TRight[],
): Array<TLeft & TRight> {
  const result: Array<TLeft & TRight> = [];

  for (const leftItem of left) {
    for (const rightItem of right) {
      result.push({ ...leftItem, ...rightItem } as TLeft & TRight);
    }
  }

  return result;
}
