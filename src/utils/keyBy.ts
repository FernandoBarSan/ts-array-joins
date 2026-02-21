import type { PropertyKeyValue } from "../types/index.js";

/**
 * Creates a lookup record from an array, indexed by a property value.
 * If multiple items share the same key, the first one wins.
 *
 * Time complexity: O(n)
 *
 * @template T - Type of items in the array
 * @template K - Key used for indexing
 * @param items - Array to index (not mutated)
 * @param key - Property name to use as the record key
 * @returns Record mapping key values to items
 *
 * @example
 * ```typescript
 * const users = [
 *   { id: 1, name: "Ana" },
 *   { id: 2, name: "Juan" },
 * ];
 *
 * const byId = keyBy(users, "id");
 * // { 1: { id: 1, name: "Ana" }, 2: { id: 2, name: "Juan" } }
 * // byId[1].name === "Ana"
 * ```
 */
export function keyBy<T, K extends keyof T>(
  items: readonly T[],
  key: K,
): Record<PropertyKeyValue<T[K]>, T> {
  const result = {} as Record<PropertyKeyValue<T[K]>, T>;

  for (const item of items) {
    const keyValue = item[key] as PropertyKeyValue<T[K]>;
    if (!(keyValue in result)) {
      result[keyValue] = item;
    }
  }

  return result;
}
