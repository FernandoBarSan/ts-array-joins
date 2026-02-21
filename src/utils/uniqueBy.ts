/**
 * Returns a new array with duplicate items removed, keeping the first occurrence
 * of each unique key value.
 *
 * Time complexity: O(n)
 *
 * @template T - Type of items in the array
 * @template K - Key used for deduplication
 * @param items - Array to deduplicate (not mutated)
 * @param key - Property name to use for uniqueness check
 * @returns New array with duplicates removed
 *
 * @example
 * ```typescript
 * const users = [
 *   { id: 1, email: "ana@test.com" },
 *   { id: 2, email: "ana@test.com" },
 *   { id: 3, email: "juan@test.com" },
 * ];
 *
 * uniqueBy(users, "email");
 * // [{ id: 1, email: "ana@test.com" }, { id: 3, email: "juan@test.com" }]
 * ```
 */
export function uniqueBy<T, K extends keyof T>(items: readonly T[], key: K): T[] {
  const seen = new Set<T[K]>();
  const result: T[] = [];

  for (const item of items) {
    const value = item[key];
    if (!seen.has(value)) {
      seen.add(value);
      result.push(item);
    }
  }

  return result;
}
