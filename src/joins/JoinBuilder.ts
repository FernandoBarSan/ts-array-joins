import type { WithProperty } from "../types/index.js";
import { indexMany, indexOne } from "../utils/indexBy.js";

/**
 * Fluent builder for composing multiple join operations on an array.
 * Each method returns a new JoinBuilder with the augmented type.
 *
 * @template T - Current type of items in the builder
 *
 * @example
 * ```typescript
 * const result = from(users)
 *   .attachChildren({ children: orders, parentKey: "id", childKey: "userId", as: "orders" })
 *   .attachChild({ children: profiles, parentKey: "id", childKey: "userId", as: "profile" })
 *   .attachAggregate({
 *     children: orders,
 *     parentKey: "id",
 *     childKey: "userId",
 *     as: "orderTotal",
 *     aggregate: (o) => o.reduce((s, x) => s + x.total, 0)
 *   })
 *   .build();
 * ```
 */
export class JoinBuilder<T> {
  private readonly items: readonly T[];

  constructor(items: readonly T[]) {
    this.items = items;
  }

  /**
   * Attach children (one-to-many) to each item.
   */
  attachChildren<
    TChild,
    ParentKey extends keyof T,
    ChildKey extends keyof TChild,
    PropName extends PropertyKey,
  >(params: {
    children: readonly TChild[];
    parentKey: ParentKey;
    childKey: ChildKey;
    as: PropName;
  }): JoinBuilder<WithProperty<T, PropName, TChild[]>> {
    const { children, parentKey, childKey, as } = params;
    const childrenByKey = indexMany(children, (c) => c[childKey] as unknown);

    const result = this.items.map((item) => ({
      ...item,
      [as]:
        childrenByKey.get((item as Record<string, unknown>)[parentKey as string] as unknown) ?? [],
    })) as Array<WithProperty<T, PropName, TChild[]>>;

    return new JoinBuilder(result);
  }

  /**
   * Attach a single child (one-to-one) to each item.
   */
  attachChild<
    TChild,
    ParentKey extends keyof T,
    ChildKey extends keyof TChild,
    PropName extends PropertyKey,
  >(params: {
    children: readonly TChild[];
    parentKey: ParentKey;
    childKey: ChildKey;
    as: PropName;
  }): JoinBuilder<WithProperty<T, PropName, TChild | null>> {
    const { children, parentKey, childKey, as } = params;
    const childByKey = indexOne(children, (c) => c[childKey] as unknown);

    const result = this.items.map((item) => ({
      ...item,
      [as]:
        childByKey.get((item as Record<string, unknown>)[parentKey as string] as unknown) ?? null,
    })) as Array<WithProperty<T, PropName, TChild | null>>;

    return new JoinBuilder(result);
  }

  /**
   * Attach an aggregated value from matching children.
   */
  attachAggregate<
    TChild,
    ParentKey extends keyof T,
    ChildKey extends keyof TChild,
    PropName extends PropertyKey,
    TResult,
  >(params: {
    children: readonly TChild[];
    parentKey: ParentKey;
    childKey: ChildKey;
    as: PropName;
    aggregate: (children: TChild[]) => TResult;
  }): JoinBuilder<WithProperty<T, PropName, TResult>> {
    const { children, parentKey, childKey, as, aggregate } = params;
    const childrenByKey = indexMany(children, (c) => c[childKey] as unknown);

    const result = this.items.map((item) => ({
      ...item,
      [as]: aggregate(
        childrenByKey.get((item as Record<string, unknown>)[parentKey as string] as unknown) ?? [],
      ),
    })) as Array<WithProperty<T, PropName, TResult>>;

    return new JoinBuilder(result);
  }

  /**
   * Filter items using a predicate.
   */
  where(predicate: (item: T) => boolean): JoinBuilder<T> {
    return new JoinBuilder(this.items.filter(predicate));
  }

  /**
   * Execute the chain and return the final array.
   */
  build(): T[] {
    return [...this.items];
  }
}

/**
 * Creates a fluent join builder starting from a parent array.
 *
 * @param items - The starting array
 * @returns A JoinBuilder instance for chaining operations
 *
 * @example
 * ```typescript
 * const result = from(users)
 *   .attachChildren({ children: orders, parentKey: "id", childKey: "userId", as: "orders" })
 *   .build();
 * ```
 */
export function from<T>(items: readonly T[]): JoinBuilder<T> {
  return new JoinBuilder(items);
}
