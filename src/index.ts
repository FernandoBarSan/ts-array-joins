/**
 * ts-array-joins
 *
 * A strongly-typed TypeScript library for array grouping and SQL-like joins.
 *
 * @packageDocumentation
 */

// Grouping functions
export {
  groupBy,
  groupByKey,
  groupByMany,
  groupByTransform,
  groupByComposite,
} from "./groupBy.js";

// Simple join functions (single key)
export {
  attachChildren,
  type AttachChildrenParams,
} from "./joins/attachChildren.js";

export { attachChild, type AttachChildParams } from "./joins/attachChild.js";

export {
  attachChildrenWithFilter,
  type AttachChildrenWithFilterParams,
  type Cardinality,
} from "./joins/attachChildrenWithFilter.js";

export {
  joinBySelectors,
  type JoinBySelectorsParams,
} from "./joins/joinBySelectors.js";

export { innerJoin, type InnerJoinParams } from "./joins/innerJoin.js";

export {
  attachChildrenWhere,
  type AttachChildrenWhereParams,
} from "./joins/attachChildrenWhere.js";

export {
  attachAggregate,
  type AttachAggregateParams,
} from "./joins/attachAggregate.js";

// Tree transformation
export {
  arrayToTree,
  type ArrayToTreeParams,
} from "./joins/arrayToTree.js";

// Full outer join
export {
  fullOuterJoin,
  type FullOuterJoinParams,
  type FullOuterJoinRow,
} from "./joins/fullOuterJoin.js";

// Cross join (Cartesian product)
export { crossJoin, crossJoinMerge } from "./joins/crossJoin.js";

// Fluent API
export { from, JoinBuilder } from "./joins/JoinBuilder.js";

// Lazy builder (deferred evaluation)
export { lazy, LazyBuilder } from "./joins/LazyBuilder.js";

// Composite key joins - Serialized approach
export {
  attachChildrenComposite,
  type AttachChildrenCompositeParams,
} from "./joins/attachChildrenComposite.js";

export {
  attachChildComposite,
  type AttachChildCompositeParams,
} from "./joins/attachChildComposite.js";

// Composite key joins - Nested approach
export {
  attachChildrenNested,
  type AttachChildrenNestedParams,
} from "./joins/attachChildrenNested.js";

export {
  attachChildNested,
  type AttachChildNestedParams,
} from "./joins/attachChildNested.js";

// Utilities
export {
  createCompositeKey,
  makeCompositeKeyExtractor,
  getCompositeKey,
} from "./utils/compositeKey.js";

export {
  createNestedGroups,
  getFromNestedGroups,
} from "./utils/nestedGroup.js";

export { indexMany, indexOne } from "./utils/indexBy.js";

export {
  sortBy,
  comparatorBy,
  type SortCriterion,
  type SortKey,
} from "./utils/sortBy.js";

// Array utilities
export { uniqueBy } from "./utils/uniqueBy.js";
export { keyBy } from "./utils/keyBy.js";
export { treeToArray } from "./utils/treeToArray.js";
export { diff, intersect, except } from "./utils/setOperations.js";
export { flatMapChildren } from "./utils/flatMapChildren.js";
export { chunk, partition } from "./utils/chunk.js";
export { mapValues } from "./utils/mapValues.js";
export { pick, omit } from "./utils/pickOmit.js";

// Performance
export { IndexCache } from "./utils/IndexCache.js";

// Type utilities
export type {
  ArrayElement,
  PropertyKeyValue,
  NestedGroupResult,
  WithProperty,
  KeysOf,
  CompositeKey,
  CompositeKeyValue,
  CompositeKeySelector,
  TreeNode,
} from "./types/index.js";
