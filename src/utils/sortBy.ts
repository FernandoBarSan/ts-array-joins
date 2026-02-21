/**
 * Object form for sort criteria with explicit options.
 */
export interface SortKey<T> {
  /** Property name to sort by */
  key: keyof T;
  /** Sort direction. @default "asc" */
  order?: "asc" | "desc";
  /** When true, string comparison is case-insensitive. @default false */
  caseInsensitive?: boolean;
}

/**
 * Sort criterion: either a property key (with optional `-` prefix for descending)
 * or an object with explicit options.
 *
 * @example
 * ```typescript
 * "name"                              // ascending by name
 * "-age"                              // descending by age (prefix -)
 * { key: "name", order: "desc" }      // descending by name
 * { key: "name", caseInsensitive: true } // case-insensitive
 * ```
 */
export type SortCriterion<T> = keyof T | SortKey<T>;

interface NormalizedKey<T> {
  key: keyof T;
  order: 1 | -1;
  caseInsensitive: boolean;
}

/**
 * Normalizes a string or object criterion into a consistent internal form.
 */
function normalizeCriterion<T>(criterion: SortCriterion<T>): NormalizedKey<T> {
  if (typeof criterion === "object" && criterion !== null && "key" in criterion) {
    return {
      key: criterion.key,
      order: criterion.order === "desc" ? -1 : 1,
      caseInsensitive: criterion.caseInsensitive ?? false,
    };
  }

  const str = String(criterion);
  if (str.startsWith("-")) {
    return {
      key: str.slice(1) as keyof T,
      order: -1,
      caseInsensitive: false,
    };
  }

  return {
    key: criterion as keyof T,
    order: 1,
    caseInsensitive: false,
  };
}

/**
 * Compares two values with type-appropriate logic.
 * Strings use localeCompare, numbers use arithmetic, nulls sort last.
 */
function compareValues(a: unknown, b: unknown, caseInsensitive: boolean): number {
  // Nulls/undefined always sort last
  const aIsNull = a === null || a === undefined;
  const bIsNull = b === null || b === undefined;

  if (aIsNull && bIsNull) return 0;
  if (aIsNull) return 1;
  if (bIsNull) return -1;

  // String comparison
  if (typeof a === "string" && typeof b === "string") {
    if (caseInsensitive) {
      return a.localeCompare(b, undefined, { sensitivity: "base" });
    }
    return a.localeCompare(b);
  }

  // Numeric comparison
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * Creates a comparator function for use with `Array.prototype.sort()`.
 *
 * @template T - Type of items to compare
 * @param criteria - One or more sort criteria (property keys or objects)
 * @returns A comparator function `(a: T, b: T) => number`
 *
 * @example
 * ```typescript
 * type User = { id: number; name: string; age: number };
 *
 * // Sort ascending by name
 * users.sort(comparatorBy<User>("name"));
 *
 * // Sort by name asc, then age desc
 * users.sort(comparatorBy<User>("name", "-age"));
 *
 * // With explicit options
 * users.sort(comparatorBy<User>({ key: "name", caseInsensitive: true }));
 * ```
 */
export function comparatorBy<T>(...criteria: SortCriterion<T>[]): (a: T, b: T) => number {
  const normalized = criteria.map(normalizeCriterion);

  return (a: T, b: T): number => {
    for (const { key, order, caseInsensitive } of normalized) {
      const result = compareValues(a[key], b[key], caseInsensitive);
      if (result !== 0) return result * order;
    }
    return 0;
  };
}

/**
 * Returns a new sorted copy of the array. Does not mutate the original.
 *
 * Supports ascending/descending order, multiple sort keys, and case-insensitive string comparison.
 *
 * @template T - Type of items in the array
 * @param items - Array to sort (not mutated)
 * @param criteria - One or more sort criteria
 * @returns A new sorted array
 *
 * @example
 * ```typescript
 * type User = { id: number; name: string; age: number };
 *
 * // Sort ascending by name
 * sortBy(users, "name");
 *
 * // Sort by name asc, then age desc
 * sortBy(users, "name", "-age");
 *
 * // Descending with object syntax
 * sortBy(users, { key: "age", order: "desc" });
 *
 * // Case-insensitive
 * sortBy(users, { key: "name", caseInsensitive: true });
 *
 * // Mix string and object criteria
 * sortBy(users, { key: "name", caseInsensitive: true }, "-age");
 * ```
 */
export function sortBy<T>(items: readonly T[], ...criteria: SortCriterion<T>[]): T[] {
  return [...items].sort(comparatorBy(...criteria));
}
