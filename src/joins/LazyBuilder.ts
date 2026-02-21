import type { WithProperty } from "../types/index.js";
import { indexMany } from "../utils/indexBy.js";

/**
 * A deferred step in the lazy pipeline.
 */
interface LazyStep<TParent> {
  execute: (parents: readonly TParent[]) => TParent[];
}

/**
 * Lazy join builder that defers execution until `.run()` is called.
 * Collects operations and executes them in a single pass over the data.
 *
 * @template T - Current type of items in the pipeline
 *
 * @example
 * ```typescript
 * const result = lazy(users)
 *   .attachChildren({
 *     children: orders,
 *     parentKey: "id",
 *     childKey: "userId",
 *     as: "orders",
 *   })
 *   .filter(u => u.orders.length > 0)
 *   .sortBy("name")
 *   .run();
 * ```
 */
export class LazyBuilder<T> {
  private readonly source: readonly T[];
  private readonly steps: LazyStep<unknown>[] = [];

  constructor(source: readonly T[]) {
    this.source = source;
  }

  /**
   * Attach children to each parent by matching keys.
   * Execution is deferred until `.run()`.
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
  }): LazyBuilder<WithProperty<T, PropName, TChild[]>> {
    type Result = WithProperty<T, PropName, TChild[]>;

    this.steps.push({
      execute: (parents: readonly unknown[]) => {
        const { children, parentKey, childKey, as } = params;
        const childrenByKey = indexMany(children, (c) => c[childKey] as unknown);

        return (parents as readonly T[]).map((parent) => {
          const matching = childrenByKey.get(parent[parentKey] as unknown) ?? [];
          return { ...parent, [as]: matching } as unknown;
        }) as unknown[];
      },
    });

    return this as unknown as LazyBuilder<Result>;
  }

  /**
   * Filter items. Execution is deferred until `.run()`.
   */
  filter(predicate: (item: T) => boolean): LazyBuilder<T> {
    this.steps.push({
      execute: (items: readonly unknown[]) => {
        return (items as readonly T[]).filter(predicate) as unknown[];
      },
    });

    return this;
  }

  /**
   * Map/transform items. Execution is deferred until `.run()`.
   */
  map<R>(transform: (item: T) => R): LazyBuilder<R> {
    this.steps.push({
      execute: (items: readonly unknown[]) => {
        return (items as readonly T[]).map(transform) as unknown[];
      },
    });

    return this as unknown as LazyBuilder<R>;
  }

  /**
   * Sort items by criteria. Execution is deferred until `.run()`.
   */
  sortBy(...keys: (keyof T)[]): LazyBuilder<T> {
    this.steps.push({
      execute: (items: readonly unknown[]) => {
        const copy = [...(items as readonly T[])];
        copy.sort((a, b) => {
          for (const key of keys) {
            const aVal = a[key];
            const bVal = b[key];
            if (aVal < bVal) return -1;
            if (aVal > bVal) return 1;
          }
          return 0;
        });
        return copy as unknown[];
      },
    });

    return this;
  }

  /**
   * Take only the first `count` items. Execution is deferred until `.run()`.
   */
  take(count: number): LazyBuilder<T> {
    this.steps.push({
      execute: (items: readonly unknown[]) => {
        return (items as unknown[]).slice(0, count);
      },
    });

    return this;
  }

  /**
   * Skip the first `count` items. Execution is deferred until `.run()`.
   */
  skip(count: number): LazyBuilder<T> {
    this.steps.push({
      execute: (items: readonly unknown[]) => {
        return (items as unknown[]).slice(count);
      },
    });

    return this;
  }

  /**
   * Execute all deferred operations and return the final result.
   */
  run(): T[] {
    let current: unknown[] = [...this.source];

    for (const step of this.steps) {
      current = step.execute(current);
    }

    return current as T[];
  }
}

/**
 * Creates a lazy builder for deferred array operations.
 *
 * @template T - Type of items
 * @param source - Source array
 * @returns LazyBuilder instance
 *
 * @example
 * ```typescript
 * const result = lazy(users)
 *   .filter(u => u.active)
 *   .sortBy("name")
 *   .take(10)
 *   .run();
 * ```
 */
export function lazy<T>(source: readonly T[]): LazyBuilder<T> {
  return new LazyBuilder(source);
}
