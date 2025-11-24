import type { NestedGroupResult, PropertyKeyValue } from "./types/index.js";
import { makeCompositeKeyExtractor } from "./utils/compositeKey.js";

/**
 * Groups an array of items by a key selector function.
 *
 * @template T - The type of items in the array
 * @template K - The type of the grouping key (must extend PropertyKey)
 *
 * @param items - The array to group
 * @param keySelector - Function that extracts the grouping key from each item
 * @returns A record where keys are the extracted values and values are arrays of items
 *
 * @example
 * ```typescript
 * const users = [
 *   { id: 1, name: "Ana", role: "admin" },
 *   { id: 2, name: "Juan", role: "user" },
 *   { id: 3, name: "Luis", role: "admin" }
 * ];
 *
 * const byRole = groupBy(users, (u) => u.role);
 * // { admin: [...], user: [...] }
 *
 * const byFirstLetter = groupBy(users, (u) => u.name[0]);
 * // { A: [...], J: [...], L: [...] }
 * ```
 */
export function groupBy<T, K extends PropertyKey>(
  items: readonly T[],
  keySelector: (item: T) => K
): Record<K, T[]> {
  const result = {} as Record<K, T[]>;

  for (const item of items) {
    const key = keySelector(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
  }

  return result;
}

/**
 * Groups an array of items by a specific property key.
 * Type-safe alternative to groupBy when you want to group by a known property.
 *
 * @template T - The type of items in the array
 * @template K - The property key to group by
 *
 * @param items - The array to group
 * @param key - The property name to use for grouping
 * @returns A record where keys are the property values and values are arrays of items
 *
 * @example
 * ```typescript
 * type User = { id: number; role: "admin" | "user"; name: string };
 * const users: User[] = [
 *   { id: 1, role: "admin", name: "Juan" },
 *   { id: 2, role: "user", name: "Ana" },
 *   { id: 3, role: "admin", name: "Luis" }
 * ];
 *
 * const grouped = groupByKey(users, "role");
 * // Type: Record<"admin" | "user", User[]>
 * // Value: { admin: [...], user: [...] }
 * ```
 */
export function groupByKey<T, K extends keyof T>(
  items: readonly T[],
  key: K
): T[K] extends PropertyKey ? Record<PropertyKeyValue<T[K]>, T[]> : never {
  const result = {} as Record<PropertyKeyValue<T[K]>, T[]>;

  for (const item of items) {
    const groupKey = item[key] as PropertyKeyValue<T[K]>;
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
  }

  return result as T[K] extends PropertyKey
    ? Record<PropertyKeyValue<T[K]>, T[]>
    : never;
}

/**
 * Groups an array by multiple keys, creating nested group structures.
 *
 * @template T - The type of items in the array
 * @template Keys - Tuple of property keys to group by
 *
 * @param items - The array to group
 * @param keys - Array of property names to group by (creates nested structure)
 * @returns Nested record structure based on the provided keys
 *
 * @example
 * ```typescript
 * type Sale = { country: string; city: string; amount: number };
 * const sales: Sale[] = [
 *   { country: "USA", city: "NYC", amount: 100 },
 *   { country: "USA", city: "LA", amount: 200 },
 *   { country: "Spain", city: "Madrid", amount: 150 }
 * ];
 *
 * const grouped = groupByMany(sales, ["country", "city"]);
 * // Type: Record<string, Record<string, Sale[]>>
 * // Value: {
 * //   USA: { NYC: [...], LA: [...] },
 * //   Spain: { Madrid: [...] }
 * // }
 * ```
 */
export function groupByMany<T, Keys extends readonly (keyof T)[]>(
  items: readonly T[],
  keys: Keys
): NestedGroupResult<T, Keys> {
  if (keys.length === 0) {
    return items as unknown as NestedGroupResult<T, Keys>;
  }

  if (keys.length === 1) {
    const key = keys[0];
    return groupByKey(items, key) as unknown as NestedGroupResult<T, Keys>;
  }

  const [firstKey, ...restKeys] = keys;
  const firstLevelGroups = groupByKey(items, firstKey);

  const result = {} as Record<PropertyKey, unknown>;

  for (const [groupKey, groupItems] of Object.entries(firstLevelGroups)) {
    result[groupKey] = groupByMany(
      groupItems as readonly T[],
      restKeys as unknown as readonly (keyof T)[]
    );
  }

  return result as NestedGroupResult<T, Keys>;
}

/**
 * Groups items and allows transformation of each group.
 * Useful when you need to aggregate or transform grouped data.
 *
 * @template T - The type of items in the array
 * @template K - The type of the grouping key
 * @template R - The type of the transformed result
 *
 * @param items - The array to group
 * @param keySelector - Function that extracts the grouping key
 * @param valueTransform - Function to transform each group
 * @returns A record with transformed values for each group
 *
 * @example
 * ```typescript
 * type Order = { userId: number; total: number };
 * const orders: Order[] = [
 *   { userId: 1, total: 100 },
 *   { userId: 1, total: 50 },
 *   { userId: 2, total: 200 }
 * ];
 *
 * const totalByUser = groupByTransform(
 *   orders,
 *   (o) => o.userId,
 *   (orders) => orders.reduce((sum, o) => sum + o.total, 0)
 * );
 * // { 1: 150, 2: 200 }
 * ```
 */
export function groupByTransform<T, K extends PropertyKey, R>(
  items: readonly T[],
  keySelector: (item: T) => K,
  valueTransform: (group: T[]) => R
): Record<K, R> {
  const grouped = groupBy(items, keySelector);
  const result = {} as Record<K, R>;

  for (const [key, group] of Object.entries(grouped) as [K, T[]][]) {
    result[key] = valueTransform(group);
  }

  return result;
}

/**
 * Groups an array by multiple properties forming a composite key.
 * Unlike groupByMany which creates nested structures, this creates a flat
 * Record with composite keys.
 *
 * @template T - The type of items in the array
 * @template Keys - Tuple of property keys to use as composite key
 *
 * @param items - The array to group
 * @param keys - Array of property names to use as composite key
 * @returns A record where keys are composite strings and values are arrays of items
 *
 * @example
 * ```typescript
 * type Sale = { country: string; city: string; amount: number };
 * const sales: Sale[] = [
 *   { country: 'USA', city: 'NYC', amount: 100 },
 *   { country: 'USA', city: 'NYC', amount: 50 },
 *   { country: 'USA', city: 'LA', amount: 200 }
 * ];
 *
 * const grouped = groupByComposite(sales, ['country', 'city']);
 * // {
 * //   "USA||~~||NYC": [{ country: 'USA', city: 'NYC', amount: 100 }, ...],
 * //   "USA||~~||LA": [{ country: 'USA', city: 'LA', amount: 200 }]
 * // }
 * ```
 */
export function groupByComposite<T>(
  items: readonly T[],
  keys: ReadonlyArray<keyof T>
): Record<string, T[]> {
  const keyExtractor = makeCompositeKeyExtractor<T>(keys);
  return groupBy(items, keyExtractor);
}
