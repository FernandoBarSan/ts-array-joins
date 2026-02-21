/**
 * Transforms the values of a record while preserving the keys.
 * Useful for post-processing grouped results from groupBy/groupByKey.
 *
 * @template K - Type of record keys
 * @template V - Type of original values
 * @template R - Type of transformed values
 * @param record - Record to transform
 * @param transform - Function applied to each value
 * @returns New record with transformed values
 *
 * @example
 * ```typescript
 * const grouped = groupByKey(users, "role");
 * // { admin: User[], user: User[] }
 *
 * const counts = mapValues(grouped, (users) => users.length);
 * // { admin: 3, user: 15 }
 *
 * const names = mapValues(grouped, (users) => users.map(u => u.name));
 * // { admin: ["Ana", "Bob", "Carol"], user: [...] }
 * ```
 */
export function mapValues<K extends PropertyKey, V, R>(
  record: Record<K, V>,
  transform: (value: V, key: K) => R,
): Record<K, R> {
  const result = {} as Record<K, R>;

  for (const key of Object.keys(record) as K[]) {
    result[key] = transform(record[key], key);
  }

  return result;
}
