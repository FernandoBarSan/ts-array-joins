/**
 * Splits an array into chunks of the specified size.
 *
 * Time complexity: O(n)
 *
 * @template T - Type of items in the array
 * @param items - Array to split (not mutated)
 * @param size - Maximum size of each chunk (must be >= 1)
 * @returns Array of chunks
 *
 * @example
 * ```typescript
 * chunk([1, 2, 3, 4, 5], 2);
 * // [[1, 2], [3, 4], [5]]
 * ```
 */
export function chunk<T>(items: readonly T[], size: number): T[][] {
  if (size < 1) {
    throw new Error("Chunk size must be at least 1.");
  }

  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

/**
 * Splits an array into two groups based on a predicate.
 * The first array contains items where the predicate returns true,
 * the second contains items where it returns false.
 *
 * Time complexity: O(n)
 *
 * @template T - Type of items in the array
 * @param items - Array to partition (not mutated)
 * @param predicate - Function that returns true/false for each item
 * @returns Tuple of [matching, non-matching] arrays
 *
 * @example
 * ```typescript
 * const [active, inactive] = partition(users, u => u.active);
 * ```
 */
export function partition<T>(items: readonly T[], predicate: (item: T) => boolean): [T[], T[]] {
  const pass: T[] = [];
  const fail: T[] = [];

  for (const item of items) {
    if (predicate(item)) {
      pass.push(item);
    } else {
      fail.push(item);
    }
  }

  return [pass, fail];
}
