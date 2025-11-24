/**
 * Creates a composite key from multiple property values.
 * Uses a separator that's unlikely to appear in data.
 *
 * @param values - Array of values to combine into a key
 * @returns A string key representing the combination
 *
 * @example
 * ```typescript
 * const key = createCompositeKey(['SKU-A', 'origin1']);
 * // Returns: "SKU-A||~~||origin1"
 * ```
 */
export function createCompositeKey(values: unknown[]): string {
  // Using a separator unlikely to appear in normal data
  return values.map((v) => String(v ?? "")).join("||~~||");
}

/**
 * Creates a function that extracts a composite key from an object.
 *
 * @template T - The type of object
 * @param keys - Array of property names to use as composite key
 * @returns Function that extracts the composite key from an item
 *
 * @example
 * ```typescript
 * type Product = { sku: string; origin: string; name: string };
 *
 * const keyExtractor = makeCompositeKeyExtractor<Product>(['sku', 'origin']);
 * const key = keyExtractor({ sku: 'SKU-A', origin: 'origin1', name: 'Widget' });
 * // Returns: "SKU-A||~~||origin1"
 * ```
 */
export function makeCompositeKeyExtractor<T>(
  keys: ReadonlyArray<keyof T>
): (item: T) => string {
  return (item: T) => {
    const values = keys.map((key) => item[key]);
    return createCompositeKey(values);
  };
}

/**
 * Creates a composite key directly from an object and keys.
 *
 * @template T - The type of object
 * @param item - The object to extract key from
 * @param keys - Array of property names to use as composite key
 * @returns The composite key string
 *
 * @example
 * ```typescript
 * type Product = { sku: string; origin: string };
 * const product = { sku: 'SKU-A', origin: 'origin1' };
 *
 * const key = getCompositeKey(product, ['sku', 'origin']);
 * // Returns: "SKU-A||~~||origin1"
 * ```
 */
export function getCompositeKey<T>(
  item: T,
  keys: ReadonlyArray<keyof T>
): string {
  const values = keys.map((key) => item[key]);
  return createCompositeKey(values);
}
