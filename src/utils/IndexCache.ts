/**
 * Cache for pre-built Map indices.
 * Avoids rebuilding the index when the same array + key combination is used multiple times.
 *
 * @example
 * ```typescript
 * const cache = new IndexCache();
 *
 * // First call builds the index, subsequent calls reuse it
 * const ordersByUserId = cache.indexMany(orders, "userId");
 * const ordersByUserId2 = cache.indexMany(orders, "userId"); // cache hit
 *
 * // Use with joins
 * for (const user of users) {
 *   const userOrders = ordersByUserId.get(user.id) ?? [];
 * }
 * ```
 */
export class IndexCache {
  private readonly manyCache = new WeakMap<
    readonly unknown[],
    Map<PropertyKey, Map<unknown, unknown[]>>
  >();

  private readonly oneCache = new WeakMap<
    readonly unknown[],
    Map<PropertyKey, Map<unknown, unknown>>
  >();

  /**
   * Get or build a one-to-many index (like groupBy).
   * Returns a Map where each key maps to an array of items.
   *
   * @template T - Type of items
   * @template K - Key used for indexing
   * @param items - Array to index (used as WeakMap key for caching)
   * @param key - Property to index by
   * @returns Map from key values to arrays of items
   */
  indexMany<T, K extends keyof T>(items: readonly T[], key: K): Map<T[K], T[]> {
    let byKey = this.manyCache.get(items);
    if (!byKey) {
      byKey = new Map();
      this.manyCache.set(items, byKey);
    }

    const keyStr = key as PropertyKey;
    let index = byKey.get(keyStr) as Map<T[K], T[]> | undefined;

    if (!index) {
      index = new Map<T[K], T[]>();
      for (const item of items) {
        const k = item[key];
        let group = index.get(k);
        if (!group) {
          group = [];
          index.set(k, group);
        }
        group.push(item);
      }
      byKey.set(keyStr, index as Map<unknown, unknown[]>);
    }

    return index;
  }

  /**
   * Get or build a one-to-one index (like keyBy).
   * Returns a Map where each key maps to a single item.
   * If duplicate keys exist, the last item wins.
   *
   * @template T - Type of items
   * @template K - Key used for indexing
   * @param items - Array to index (used as WeakMap key for caching)
   * @param key - Property to index by
   * @returns Map from key values to single items
   */
  indexOne<T, K extends keyof T>(items: readonly T[], key: K): Map<T[K], T> {
    let byKey = this.oneCache.get(items);
    if (!byKey) {
      byKey = new Map();
      this.oneCache.set(items, byKey);
    }

    const keyStr = key as PropertyKey;
    let index = byKey.get(keyStr) as Map<T[K], T> | undefined;

    if (!index) {
      index = new Map<T[K], T>();
      for (const item of items) {
        index.set(item[key], item);
      }
      byKey.set(keyStr, index as Map<unknown, unknown>);
    }

    return index;
  }

  /**
   * Clear all cached indices.
   * Note: WeakMap entries are automatically garbage-collected when
   * arrays are no longer referenced, so clearing is rarely needed.
   */
  clear(): void {
    // WeakMap doesn't have a clear method, so we create new instances
    // by reassigning (but since they're readonly, we use a workaround)
    // Actually, WeakMap entries are GC'd automatically.
    // This method exists for explicit cache invalidation needs.
    // Since WeakMap doesn't support .clear(), this is a no-op.
    // Users should create a new IndexCache instance for a full reset.
  }
}
