/**
 * Returns items that exist in `source` but not in `other`, compared by a key.
 *
 * Time complexity: O(n + m)
 *
 * @template T - Type of items
 * @template K - Key used for comparison
 * @param source - Source array
 * @param other - Array to compare against
 * @param key - Property name to compare by
 * @returns Items in source that are not in other
 *
 * @example
 * ```typescript
 * const added = diff(newUsers, oldUsers, "id");
 * // Users in newUsers whose id doesn't exist in oldUsers
 * ```
 */
export function diff<T, K extends keyof T>(source: readonly T[], other: readonly T[], key: K): T[] {
  const otherKeys = new Set(other.map((item) => item[key]));
  return source.filter((item) => !otherKeys.has(item[key]));
}

/**
 * Returns items that exist in both arrays, compared by a key.
 * Items are taken from the `source` array.
 *
 * Time complexity: O(n + m)
 *
 * @template T - Type of items
 * @template K - Key used for comparison
 * @param source - Source array (items are taken from here)
 * @param other - Array to compare against
 * @param key - Property name to compare by
 * @returns Items that exist in both arrays
 *
 * @example
 * ```typescript
 * const common = intersect(newUsers, oldUsers, "id");
 * // Users whose id exists in both arrays
 * ```
 */
export function intersect<T, K extends keyof T>(
  source: readonly T[],
  other: readonly T[],
  key: K,
): T[] {
  const otherKeys = new Set(other.map((item) => item[key]));
  return source.filter((item) => otherKeys.has(item[key]));
}

/**
 * Returns items from `source` that don't exist in `other`, compared by a key.
 * Alias for `diff` with clearer semantics for "exclude these items".
 *
 * Time complexity: O(n + m)
 *
 * @template T - Type of items
 * @template K - Key used for comparison
 * @param source - Source array
 * @param exclude - Items to exclude
 * @param key - Property name to compare by
 * @returns Items in source excluding those in the exclude array
 *
 * @example
 * ```typescript
 * const removed = except(oldUsers, newUsers, "id");
 * // Users in oldUsers whose id doesn't exist in newUsers
 * ```
 */
export function except<T, K extends keyof T>(
  source: readonly T[],
  exclude: readonly T[],
  key: K,
): T[] {
  return diff(source, exclude, key);
}
