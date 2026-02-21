/**
 * Builds a Map grouping items by a key extractor (one-to-many).
 * O(n) time complexity.
 *
 * @param items - Array of items to index
 * @param keyExtractor - Function to extract the grouping key from each item
 * @returns Map where each key maps to an array of matching items
 *
 * @example
 * ```typescript
 * const orders = [
 *   { id: 1, userId: 1, total: 50 },
 *   { id: 2, userId: 1, total: 100 },
 *   { id: 3, userId: 2, total: 75 },
 * ];
 *
 * const byUser = indexMany(orders, (o) => o.userId);
 * // Map { 1 => [order1, order2], 2 => [order3] }
 * ```
 */
export function indexMany<T, K>(items: readonly T[], keyExtractor: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();

  for (const item of items) {
    const key = keyExtractor(item);
    const existing = map.get(key);

    if (existing) {
      existing.push(item);
    } else {
      map.set(key, [item]);
    }
  }

  return map;
}

/**
 * Builds a Map storing only the first match per key (one-to-one).
 * O(n) time complexity.
 *
 * @param items - Array of items to index
 * @param keyExtractor - Function to extract the key from each item
 * @returns Map where each key maps to the first matching item
 *
 * @example
 * ```typescript
 * const addresses = [
 *   { id: 1, userId: 1, city: "Madrid" },
 *   { id: 2, userId: 1, city: "Barcelona" }, // ignored, first match wins
 *   { id: 3, userId: 2, city: "Sevilla" },
 * ];
 *
 * const byUser = indexOne(addresses, (a) => a.userId);
 * // Map { 1 => address1, 2 => address3 }
 * ```
 */
export function indexOne<T, K>(items: readonly T[], keyExtractor: (item: T) => K): Map<K, T> {
  const map = new Map<K, T>();

  for (const item of items) {
    const key = keyExtractor(item);

    if (!map.has(key)) {
      map.set(key, item);
    }
  }

  return map;
}
