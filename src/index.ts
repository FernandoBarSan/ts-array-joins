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
  joinBySelectors,
  type JoinBySelectorsParams,
} from "./joins/joinBySelectors.js";

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
} from "./types/index.js";
