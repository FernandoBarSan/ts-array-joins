/**
 * Groups items by multiple keys creating a nested structure.
 * Similar to groupByMany but more generic for internal use.
 *
 * @template T - Type of items to group
 * @param items - Array of items to group
 * @param keys - Array of property names to group by (in order)
 * @returns Nested record structure
 */
export function createNestedGroups<T>(
  items: readonly T[],
  keys: ReadonlyArray<keyof T>
): any {
  if (keys.length === 0) {
    return items;
  }

  if (keys.length === 1) {
    const [key] = keys;
    const result: Record<PropertyKey, T[]> = {};

    for (const item of items) {
      const groupKey = item[key] as PropertyKey;
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
    }

    return result;
  }

  const [firstKey, ...restKeys] = keys;
  const firstLevelGroups: Record<PropertyKey, T[]> = {};

  // First level grouping
  for (const item of items) {
    const groupKey = item[firstKey] as PropertyKey;
    if (!firstLevelGroups[groupKey]) {
      firstLevelGroups[groupKey] = [];
    }
    firstLevelGroups[groupKey].push(item);
  }

  // Recursive grouping for remaining keys
  const result: Record<PropertyKey, any> = {};
  for (const [groupKey, groupItems] of Object.entries(firstLevelGroups)) {
    result[groupKey] = createNestedGroups(groupItems, restKeys);
  }

  return result;
}

/**
 * Retrieves items from a nested group structure using a path of keys.
 *
 * @template T - Type of items stored in the structure
 * @param nestedGroups - The nested group structure
 * @param path - Array of key values to navigate the structure
 * @returns Array of items at that path, or empty array if not found
 */
export function getFromNestedGroups<T>(
  nestedGroups: any,
  path: readonly unknown[]
): T[] {
  if (path.length === 0) {
    return Array.isArray(nestedGroups) ? nestedGroups : [];
  }

  let current = nestedGroups;

  for (const key of path) {
    const safeKey = key as PropertyKey;
    if (
      current &&
      typeof current === "object" &&
      safeKey !== null &&
      safeKey !== undefined &&
      safeKey in current
    ) {
      current = current[safeKey];
    } else {
      return [];
    }
  }

  return Array.isArray(current) ? current : [];
}
