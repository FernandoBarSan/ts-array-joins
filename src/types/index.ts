/**
 * Utility type to extract the type of array elements
 */
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

/**
 * Utility type to ensure a value is a valid PropertyKey (string | number | symbol)
 */
export type PropertyKeyValue<T> = T extends PropertyKey ? T : never;

/**
 * Type for nested grouping result
 * When grouping by multiple keys, creates nested Record structures
 */
export type NestedGroupResult<
  T,
  Keys extends readonly PropertyKey[]
> = Keys extends readonly [infer First, ...infer Rest]
  ? First extends keyof T
    ? Rest extends readonly PropertyKey[]
      ? Rest["length"] extends 0
        ? Record<PropertyKeyValue<T[First]>, T[]>
        : Record<PropertyKeyValue<T[First]>, NestedGroupResult<T, Rest>>
      : never
    : never
  : T[];

/**
 * Type helper to add a new property to an object type
 */
export type WithProperty<T, K extends PropertyKey, V> = T & { [P in K]: V };

/**
 * Utility to create a union of all possible property keys from an object
 */
export type KeysOf<T> = T extends unknown ? keyof T : never;

/**
 * Type for a composite key - array of property names
 */
export type CompositeKey<T> = ReadonlyArray<keyof T>;

/**
 * Type for the serialized composite key value
 */
export type CompositeKeyValue = string;

/**
 * Helper to create a composite key selector function
 */
export type CompositeKeySelector<T> = (item: T) => CompositeKeyValue;
