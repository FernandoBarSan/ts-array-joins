/**
 * Creates a new array where each item only contains the specified properties.
 *
 * @template T - Type of items in the array
 * @template K - Keys to pick
 * @param items - Array of items (not mutated)
 * @param keys - Property names to keep
 * @returns New array with only the specified properties
 *
 * @example
 * ```typescript
 * const clean = pick(users, ["id", "name"]);
 * // Array<{ id: number; name: string }>
 * ```
 */
export function pick<T, K extends keyof T>(items: readonly T[], keys: readonly K[]): Pick<T, K>[] {
  return items.map((item) => {
    const result = {} as Pick<T, K>;
    for (const key of keys) {
      result[key] = item[key];
    }
    return result;
  });
}

/**
 * Creates a new array where each item has the specified properties removed.
 *
 * @template T - Type of items in the array
 * @template K - Keys to omit
 * @param items - Array of items (not mutated)
 * @param keys - Property names to remove
 * @returns New array with the specified properties removed
 *
 * @example
 * ```typescript
 * const safe = omit(users, ["password", "token"]);
 * // Array<Omit<User, "password" | "token">>
 * ```
 */
export function omit<T, K extends keyof T>(items: readonly T[], keys: readonly K[]): Omit<T, K>[] {
  const keysToOmit = new Set<PropertyKey>(keys as readonly PropertyKey[]);
  return items.map((item) => {
    const result = {} as Record<PropertyKey, unknown>;
    for (const key of Object.keys(item as Record<string, unknown>)) {
      if (!keysToOmit.has(key)) {
        result[key] = (item as Record<string, unknown>)[key];
      }
    }
    return result as Omit<T, K>;
  });
}
