# 📚 Complete Function Guide - ts-array-joins

> **Strongly-typed TypeScript utilities for array grouping and SQL-like joins**

This guide helps you choose the right function for your use case with practical examples.

## Table of Contents

- [Grouping Functions](#-grouping-functions)
  - [groupBy](#1-groupby---basic-grouping-with-selector-function)
  - [groupByKey](#2-groupbykey---group-by-direct-property)
  - [groupByMany](#3-groupbymany---multilevel-nested-grouping)
  - [groupByTransform](#4-groupbytransform---grouping-with-transformation)
  - [groupByComposite](#5-groupbycomposite---grouping-by-multiple-keys)
- [Join Functions (SQL-like)](#-join-functions-sql-like)
  - [attachChildren](#6-attachchildren---one-to-many-join-1n)
  - [attachChild](#7-attachchild---one-to-one-join-11)
  - [attachChildrenComposite](#8-attachchildrencomposite---1n-join-with-composite-key)
  - [attachChildComposite](#9-attachchildcomposite---11-join-with-composite-key)
  - [attachChildrenNested](#10-attachchildrennested---1n-join-with-nested-grouping)
  - [attachChildNested](#11-attachchildnested---11-join-with-nested-grouping)
  - [joinBySelectors](#12-joinbyselectors---join-with-custom-selectors)
- [Utilities](#-utilities)
  - [compositeKey](#13-compositekey---create-composite-keys)
- [Quick Reference Table](#-quick-reference-table)

---

## 🔷 Grouping Functions

### 1. `groupBy` - Basic grouping with selector function

**When to use:**
- ✅ You need custom grouping logic
- ✅ The grouping key requires transformation
- ✅ You want to extract part of a value

**Examples:**

```typescript
import { groupBy } from 'ts-array-joins';

// Group by first letter
const users = [
  { name: "Alice", age: 25 },
  { name: "Anna", age: 30 },
  { name: "Bob", age: 35 }
];

const byFirstLetter = groupBy(users, user => user.name[0]);
// Result: { A: [Alice, Anna], B: [Bob] }

// Group by age range
const byAgeRange = groupBy(users, user => 
  user.age < 18 ? "minor" : user.age < 65 ? "adult" : "senior"
);
// Result: { adult: [Alice, Anna, Bob] }

// Group orders by month
const orders = [
  { id: 1, createdAt: "2025-01-15", amount: 100 },
  { id: 2, createdAt: "2025-01-20", amount: 50 },
  { id: 3, createdAt: "2025-02-10", amount: 75 }
];

const ordersByMonth = groupBy(orders, order => 
  new Date(order.createdAt).toISOString().slice(0, 7)
);
// Result: { "2025-01": [order1, order2], "2025-02": [order3] }
```

**Type signature:**
```typescript
function groupBy<T, K extends PropertyKey>(
  items: readonly T[],
  selector: (item: T) => K
): Record<K, T[]>
```

---

### 2. `groupByKey` - Group by direct property

**When to use:**
- ✅ Group by an existing property
- ✅ Fastest and simplest option
- ✅ No transformation needed

**Examples:**

```typescript
import { groupByKey } from 'ts-array-joins';

// Group orders by userId
const orders = [
  { id: 1, userId: "1", amount: 100 },
  { id: 2, userId: "1", amount: 50 },
  { id: 3, userId: "2", amount: 75 }
];

const ordersByUser = groupByKey(orders, "userId");
// Result: { "1": [order1, order2], "2": [order3] }

// Group products by category
const products = [
  { id: 1, name: "Laptop", category: "electronics" },
  { id: 2, name: "Shirt", category: "clothing" },
  { id: 3, name: "Phone", category: "electronics" }
];

const productsByCategory = groupByKey(products, "category");
// Result: { electronics: [Laptop, Phone], clothing: [Shirt] }

// Group students by grade
const students = [
  { name: "Alice", grade: "1st" },
  { name: "Bob", grade: "2nd" },
  { name: "Charlie", grade: "1st" }
];

const studentsByGrade = groupByKey(students, "grade");
// Result: { "1st": [Alice, Charlie], "2nd": [Bob] }
```

**Type signature:**
```typescript
function groupByKey<T, K extends keyof T>(
  items: readonly T[],
  key: K
): Record<PropertyKey, T[]>
```

---

### 3. `groupByMany` - Multilevel nested grouping

**When to use:**
- ✅ You need multiple levels of grouping
- ✅ You want hierarchical structure
- ✅ Multidimensional data analysis

**Examples:**

```typescript
import { groupByMany } from 'ts-array-joins';

// Group sales by region → city → category
const sales = [
  { region: "North", city: "NYC", category: "Electronics", amount: 100 },
  { region: "North", city: "NYC", category: "Clothing", amount: 50 },
  { region: "North", city: "Boston", category: "Electronics", amount: 75 },
  { region: "South", city: "Miami", category: "Electronics", amount: 60 }
];

const grouped = groupByMany(sales, ["region", "city", "category"]);
/* Result:
{
  North: {
    NYC: {
      Electronics: [{ amount: 100 }],
      Clothing: [{ amount: 50 }]
    },
    Boston: {
      Electronics: [{ amount: 75 }]
    }
  },
  South: {
    Miami: {
      Electronics: [{ amount: 60 }]
    }
  }
}
*/

// Group logs by year → month → day
const logs = [
  { year: "2025", month: "01", day: "15", event: "login" },
  { year: "2025", month: "01", day: "16", event: "logout" },
  { year: "2025", month: "02", day: "01", event: "login" }
];

const logsByDate = groupByMany(logs, ["year", "month", "day"]);

// Group employees by department → team → role
const employees = [
  { dept: "Engineering", team: "Backend", role: "Senior", name: "Alice" },
  { dept: "Engineering", team: "Backend", role: "Junior", name: "Bob" },
  { dept: "Engineering", team: "Frontend", role: "Senior", name: "Charlie" }
];

const orgChart = groupByMany(employees, ["dept", "team", "role"]);
```

**Type signature:**
```typescript
function groupByMany<T, K extends keyof T>(
  items: readonly T[],
  keys: readonly K[]
): NestedGroup<T>
```

---

### 4. `groupByTransform` - Grouping with transformation

**When to use:**
- ✅ You need to add/calculate statistics
- ✅ You want to transform grouped values
- ✅ Aggregations (sum, avg, count, etc.)

**Examples:**

```typescript
import { groupByTransform } from 'ts-array-joins';

// Calculate statistics per user
const orders = [
  { userId: "1", amount: 100 },
  { userId: "1", amount: 50 },
  { userId: "2", amount: 200 }
];

const userStats = groupByTransform(
  orders,
  order => order.userId,
  orders => ({
    totalOrders: orders.length,
    totalAmount: orders.reduce((sum, o) => sum + o.amount, 0),
    avgAmount: orders.reduce((sum, o) => sum + o.amount, 0) / orders.length,
    maxAmount: Math.max(...orders.map(o => o.amount))
  })
);
/* Result: {
  "1": { totalOrders: 2, totalAmount: 150, avgAmount: 75, maxAmount: 100 },
  "2": { totalOrders: 1, totalAmount: 200, avgAmount: 200, maxAmount: 200 }
} */

// Count products by category
const products = [
  { name: "Laptop", category: "electronics" },
  { name: "Phone", category: "electronics" },
  { name: "Shirt", category: "clothing" }
];

const categoryCount = groupByTransform(
  products,
  p => p.category,
  products => products.length
);
// Result: { electronics: 2, clothing: 1 }

// Get unique names by department
const employees = [
  { name: "Alice", department: "engineering" },
  { name: "Bob", department: "engineering" },
  { name: "Charlie", department: "sales" }
];

const namesByDept = groupByTransform(
  employees,
  e => e.department,
  employees => employees.map(e => e.name)
);
// Result: { engineering: ["Alice", "Bob"], sales: ["Charlie"] }

// Get earliest order date by user
const ordersWithDates = [
  { userId: "1", date: "2025-01-15" },
  { userId: "1", date: "2025-01-10" },
  { userId: "2", date: "2025-02-01" }
];

const earliestOrderByUser = groupByTransform(
  ordersWithDates,
  o => o.userId,
  orders => orders.reduce((earliest, curr) => 
    curr.date < earliest.date ? curr : earliest
  ).date
);
// Result: { "1": "2025-01-10", "2": "2025-02-01" }
```

**Type signature:**
```typescript
function groupByTransform<T, K extends PropertyKey, V>(
  items: readonly T[],
  selector: (item: T) => K,
  transform: (group: readonly T[]) => V
): Record<K, V>
```

---

### 5. `groupByComposite` - Grouping by multiple keys

**When to use:**
- ✅ The key is a combination of multiple properties
- ✅ You need to identify by multiple attributes
- ✅ Composite indexes

**Examples:**

```typescript
import { groupByComposite } from 'ts-array-joins';

// Group inventory by SKU + origin
const inventory = [
  { sku: "A123", origin: "US", qty: 10 },
  { sku: "A123", origin: "MX", qty: 5 },
  { sku: "B456", origin: "US", qty: 8 },
  { sku: "A123", origin: "US", qty: 3 }
];

const bySkuOrigin = groupByComposite(inventory, ["sku", "origin"]);
/* Result: {
  "A123|US": [{ qty: 10 }, { qty: 3 }],
  "A123|MX": [{ qty: 5 }],
  "B456|US": [{ qty: 8 }]
} */

// Group transactions by account + currency
const transactions = [
  { accountId: "ACC1", currency: "USD", amount: 100 },
  { accountId: "ACC1", currency: "EUR", amount: 50 },
  { accountId: "ACC2", currency: "USD", amount: 200 }
];

const txByAccountCurrency = groupByComposite(
  transactions,
  ["accountId", "currency"]
);
/* Result: {
  "ACC1|USD": [{ amount: 100 }],
  "ACC1|EUR": [{ amount: 50 }],
  "ACC2|USD": [{ amount: 200 }]
} */

// Group bookings by hotel + date + room type
const reservations = [
  { hotelId: "H1", date: "2025-01-15", roomType: "single", guest: "Alice" },
  { hotelId: "H1", date: "2025-01-15", roomType: "double", guest: "Bob" },
  { hotelId: "H1", date: "2025-01-16", roomType: "single", guest: "Charlie" }
];

const bookings = groupByComposite(
  reservations,
  ["hotelId", "date", "roomType"]
);
/* Result: {
  "H1|2025-01-15|single": [Alice],
  "H1|2025-01-15|double": [Bob],
  "H1|2025-01-16|single": [Charlie]
} */
```

**Type signature:**
```typescript
function groupByComposite<T, K extends keyof T>(
  items: readonly T[],
  keys: readonly K[]
): Record<string, T[]>
```

---

## 🔷 Join Functions (SQL-like)

### 6. `attachChildren` - One-to-many join (1:N)

**When to use:**
- ✅ One parent has MULTIPLE children
- ✅ One-to-many relationship
- ✅ User → Orders, Post → Comments

**Examples:**

```typescript
import { attachChildren } from 'ts-array-joins';

// User with all their orders
const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" }
];

const orders = [
  { id: 101, userId: 1, amount: 100 },
  { id: 102, userId: 1, amount: 50 },
  { id: 103, userId: 2, amount: 75 }
];

const usersWithOrders = attachChildren({
  parents: users,
  children: orders,
  parentKey: "id",
  childKey: "userId",
  as: "orders"
});
/* Result: [
  { id: 1, name: "Alice", orders: [{ id: 101, amount: 100 }, { id: 102, amount: 50 }] },
  { id: 2, name: "Bob", orders: [{ id: 103, amount: 75 }] }
] */

// Posts with all their comments
const posts = [
  { id: 1, title: "First Post" },
  { id: 2, title: "Second Post" }
];

const comments = [
  { id: 1, postId: 1, text: "Great!" },
  { id: 2, postId: 1, text: "Thanks!" },
  { id: 3, postId: 2, text: "Nice!" }
];

const postsWithComments = attachChildren({
  parents: posts,
  children: comments,
  parentKey: "id",
  childKey: "postId",
  as: "comments"
});

// Categories with all their products
const categories = [
  { id: 1, name: "Electronics" },
  { id: 2, name: "Clothing" }
];

const products = [
  { id: 1, categoryId: 1, name: "Laptop" },
  { id: 2, categoryId: 1, name: "Phone" },
  { id: 3, categoryId: 2, name: "Shirt" }
];

const categoriesWithProducts = attachChildren({
  parents: categories,
  children: products,
  parentKey: "id",
  childKey: "categoryId",
  as: "products"
});
```

**Type signature:**
```typescript
function attachChildren<P, C, PK extends keyof P, CK extends keyof C, A extends string>(
  options: {
    parents: readonly P[];
    children: readonly C[];
    parentKey: PK;
    childKey: CK;
    as: A;
  }
): (P & Record<A, C[]>)[]
```

---

### 7. `attachChild` - One-to-one join (1:1)

**When to use:**
- ✅ One parent has ONE child
- ✅ One-to-one relationship
- ✅ User → Profile, Order → Shipping Address

**Examples:**

```typescript
import { attachChild } from 'ts-array-joins';

// User with their profile (one-to-one)
const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" }
];

const profiles = [
  { userId: 1, bio: "Software engineer", avatar: "alice.jpg" },
  { userId: 2, bio: "Designer", avatar: "bob.jpg" }
];

const usersWithProfile = attachChild({
  parents: users,
  children: profiles,
  parentKey: "id",
  childKey: "userId",
  as: "profile"
});
/* Result: [
  { id: 1, name: "Alice", profile: { bio: "Software engineer", avatar: "alice.jpg" } },
  { id: 2, name: "Bob", profile: { bio: "Designer", avatar: "bob.jpg" } }
] */

// Order with its shipping address (first one)
const orders = [
  { id: 101, total: 100 },
  { id: 102, total: 200 }
];

const addresses = [
  { orderId: 101, street: "123 Main St", city: "NYC" },
  { orderId: 102, street: "456 Oak Ave", city: "LA" }
];

const ordersWithAddress = attachChild({
  parents: orders,
  children: addresses,
  parentKey: "id",
  childKey: "orderId",
  as: "shippingAddress"
});

// User with their primary address
const usersData = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" }
];

const addressesData = [
  { userId: 1, type: "home", street: "123 Main" },
  { userId: 1, type: "work", street: "456 Office" },
  { userId: 2, type: "home", street: "789 Road" }
];

const usersWithPrimaryAddress = attachChild({
  parents: usersData,
  children: addressesData,
  parentKey: "id",
  childKey: "userId",
  as: "primaryAddress" // Takes the first address
});
```

**Type signature:**
```typescript
function attachChild<P, C, PK extends keyof P, CK extends keyof C, A extends string>(
  options: {
    parents: readonly P[];
    children: readonly C[];
    parentKey: PK;
    childKey: CK;
    as: A;
  }
): (P & Record<A, C | null>)[]
```

---

### 8. `attachChildrenComposite` - 1:N join with composite key

**When to use:**
- ✅ One-to-many relationship with composite key
- ✅ The relationship requires multiple properties
- ✅ Inventory, multi-currency prices

**Examples:**

```typescript
import { attachChildrenComposite } from 'ts-array-joins';

// Products with inventory by warehouse + lot
const products = [
  { sku: "A123", warehouse: "NY" },
  { sku: "B456", warehouse: "LA" }
];

const inventory = [
  { sku: "A123", warehouse: "NY", lot: "L1", qty: 10 },
  { sku: "A123", warehouse: "NY", lot: "L2", qty: 5 },
  { sku: "B456", warehouse: "LA", lot: "L1", qty: 8 }
];

const productsWithInventory = attachChildrenComposite({
  parents: products,
  children: inventory,
  parentKeys: ["sku", "warehouse"],
  childKeys: ["sku", "warehouse"],
  as: "inventory"
});
/* Result: [
  { sku: "A123", warehouse: "NY", inventory: [{ lot: "L1", qty: 10 }, { lot: "L2", qty: 5 }] },
  { sku: "B456", warehouse: "LA", inventory: [{ lot: "L1", qty: 8 }] }
] */

// Orders with items by orderId + storeId
const orders = [
  { orderId: "O1", storeId: "S1", customer: "Alice" },
  { orderId: "O2", storeId: "S2", customer: "Bob" }
];

const orderItems = [
  { orderId: "O1", storeId: "S1", product: "Laptop", qty: 1 },
  { orderId: "O1", storeId: "S1", product: "Mouse", qty: 2 },
  { orderId: "O2", storeId: "S2", product: "Phone", qty: 1 }
];

const ordersWithItems = attachChildrenComposite({
  parents: orders,
  children: orderItems,
  parentKeys: ["orderId", "storeId"],
  childKeys: ["orderId", "storeId"],
  as: "items"
});

// Projects with tasks by project + sprint
const projects = [
  { projectId: "P1", sprint: "S1" },
  { projectId: "P1", sprint: "S2" }
];

const tasks = [
  { projectId: "P1", sprint: "S1", task: "Setup", status: "done" },
  { projectId: "P1", sprint: "S1", task: "Design", status: "done" },
  { projectId: "P1", sprint: "S2", task: "Development", status: "in-progress" }
];

const projectsWithTasks = attachChildrenComposite({
  parents: projects,
  children: tasks,
  parentKeys: ["projectId", "sprint"],
  childKeys: ["projectId", "sprint"],
  as: "tasks"
});
```

**Type signature:**
```typescript
function attachChildrenComposite<P, C, PK extends keyof P, CK extends keyof C, A extends string>(
  options: {
    parents: readonly P[];
    children: readonly C[];
    parentKeys: readonly PK[];
    childKeys: readonly CK[];
    as: A;
  }
): (P & Record<A, C[]>)[]
```

---

### 9. `attachChildComposite` - 1:1 join with composite key

**When to use:**
- ✅ One-to-one relationship with composite key
- ✅ Only the first matching child
- ✅ Current price, specific configuration

**Examples:**

```typescript
import { attachChildComposite } from 'ts-array-joins';

// Product with current price (SKU + currency)
const products = [
  { sku: "A123", currency: "USD" },
  { sku: "A123", currency: "EUR" },
  { sku: "B456", currency: "USD" }
];

const prices = [
  { sku: "A123", currency: "USD", price: 99.99, date: "2025-01-01" },
  { sku: "A123", currency: "EUR", price: 89.99, date: "2025-01-01" },
  { sku: "B456", currency: "USD", price: 149.99, date: "2025-01-01" }
];

const productsWithPrice = attachChildComposite({
  parents: products,
  children: prices,
  parentKeys: ["sku", "currency"],
  childKeys: ["sku", "currency"],
  as: "currentPrice"
});
/* Result: [
  { sku: "A123", currency: "USD", currentPrice: { price: 99.99, date: "2025-01-01" } },
  { sku: "A123", currency: "EUR", currentPrice: { price: 89.99, date: "2025-01-01" } },
  { sku: "B456", currency: "USD", currentPrice: { price: 149.99, date: "2025-01-01" } }
] */

// Booking with specific configuration
const bookings = [
  { hotelId: "H1", roomType: "single" },
  { hotelId: "H1", roomType: "double" }
];

const configs = [
  { hotelId: "H1", roomType: "single", maxGuests: 1, price: 100 },
  { hotelId: "H1", roomType: "double", maxGuests: 2, price: 150 }
];

const bookingsWithConfig = attachChildComposite({
  parents: bookings,
  children: configs,
  parentKeys: ["hotelId", "roomType"],
  childKeys: ["hotelId", "roomType"],
  as: "config"
});

// Employee with department settings
const employees = [
  { empId: "E1", deptId: "D1", region: "US" },
  { empId: "E2", deptId: "D1", region: "EU" }
];

const deptSettings = [
  { deptId: "D1", region: "US", policy: "PolicyA" },
  { deptId: "D1", region: "EU", policy: "PolicyB" }
];

const employeesWithSettings = attachChildComposite({
  parents: employees,
  children: deptSettings,
  parentKeys: ["deptId", "region"],
  childKeys: ["deptId", "region"],
  as: "settings"
});
```

**Type signature:**
```typescript
function attachChildComposite<P, C, PK extends keyof P, CK extends keyof C, A extends string>(
  options: {
    parents: readonly P[];
    children: readonly C[];
    parentKeys: readonly PK[];
    childKeys: readonly CK[];
    as: A;
  }
): (P & Record<A, C | null>)[]
```

---

### 10. `attachChildrenNested` - 1:N join with nested grouping

**When to use:**
- ✅ Composite key with better performance
- ✅ Efficient nested groups
- ✅ Avoid key serialization

**Examples:**

```typescript
import { attachChildrenNested } from 'ts-array-joins';

// Same result as attachChildrenComposite but more efficient
const products = [
  { sku: "A123", warehouse: "NY" },
  { sku: "B456", warehouse: "LA" }
];

const inventory = [
  { sku: "A123", warehouse: "NY", lot: "L1", qty: 10 },
  { sku: "A123", warehouse: "NY", lot: "L2", qty: 5 },
  { sku: "B456", warehouse: "LA", lot: "L1", qty: 8 }
];

const productsWithInventory = attachChildrenNested({
  parents: products,
  children: inventory,
  parentKeys: ["sku", "warehouse"],
  childKeys: ["sku", "warehouse"],
  as: "inventory"
});
/* Result: Same as attachChildrenComposite
  [
    { sku: "A123", warehouse: "NY", inventory: [{ lot: "L1", qty: 10 }, { lot: "L2", qty: 5 }] },
    { sku: "B456", warehouse: "LA", inventory: [{ lot: "L1", qty: 8 }] }
  ]
*/

// Advantage: Uses nested objects internally instead of serialized strings
// Internal structure: { A123: { NY: [...], LA: [...] } }
// vs attachChildrenComposite: { "A123|NY": [...], "A123|LA": [...] }
```

**Performance comparison:**
```typescript
// attachChildrenComposite: Creates string keys like "A123|NY|L1"
// attachChildrenNested: Creates nested structure { A123: { NY: { L1: [...] } } }
// Result: Better memory usage and faster lookups for large datasets
```

**Type signature:**
```typescript
function attachChildrenNested<P, C, PK extends keyof P, CK extends keyof C, A extends string>(
  options: {
    parents: readonly P[];
    children: readonly C[];
    parentKeys: readonly PK[];
    childKeys: readonly CK[];
    as: A;
  }
): (P & Record<A, C[]>)[]
```

---

### 11. `attachChildNested` - 1:1 join with nested grouping

**When to use:**
- ✅ Same as `attachChildComposite` but more efficient
- ✅ Composite key with better lookup

**Examples:**

```typescript
import { attachChildNested } from 'ts-array-joins';

// Same result as attachChildComposite but more efficient
const products = [
  { sku: "A123", currency: "USD" },
  { sku: "A123", currency: "EUR" }
];

const prices = [
  { sku: "A123", currency: "USD", price: 99.99 },
  { sku: "A123", currency: "EUR", price: 89.99 }
];

const productsWithPrice = attachChildNested({
  parents: products,
  children: prices,
  parentKeys: ["sku", "currency"],
  childKeys: ["sku", "currency"],
  as: "currentPrice"
});
/* Result: Same as attachChildComposite
  [
    { sku: "A123", currency: "USD", currentPrice: { price: 99.99 } },
    { sku: "A123", currency: "EUR", currentPrice: { price: 89.99 } }
  ]
*/

// Advantage: Better performance for large datasets with composite keys
```

**Type signature:**
```typescript
function attachChildNested<P, C, PK extends keyof P, CK extends keyof C, A extends string>(
  options: {
    parents: readonly P[];
    children: readonly C[];
    parentKeys: readonly PK[];
    childKeys: readonly CK[];
    as: A;
  }
): (P & Record<A, C | null>)[]
```

---

### 12. `joinBySelectors` - Join with custom selectors

**When to use:**
- ✅ Complex join logic
- ✅ Join by similarity, ranges, etc.
- ✅ Transform keys before joining

**Examples:**

```typescript
import { joinBySelectors } from 'ts-array-joins';

// Join by email (case-insensitive)
const users = [
  { id: 1, email: "Alice@Example.com" },
  { id: 2, email: "bob@example.com" }
];

const accounts = [
  { email: "alice@example.com", verified: true },
  { email: "BOB@EXAMPLE.COM", verified: false }
];

const usersWithAccounts = joinBySelectors({
  parents: users,
  children: accounts,
  parentSelector: user => user.email.toLowerCase(),
  childSelector: account => account.email.toLowerCase(),
  as: "account"
});
/* Result: [
  { id: 1, email: "Alice@Example.com", account: [{ verified: true }] },
  { id: 2, email: "bob@example.com", account: [{ verified: false }] }
] */

// Join by date range (month)
const orders = [
  { id: 1, date: "2025-01-15", amount: 100 },
  { id: 2, date: "2025-01-20", amount: 50 },
  { id: 3, date: "2025-02-10", amount: 75 }
];

const promotions = [
  { month: "2025-01", discount: 10 },
  { month: "2025-02", discount: 15 }
];

const ordersWithPromotions = joinBySelectors({
  parents: orders,
  children: promotions,
  parentSelector: order => order.date.slice(0, 7), // "2025-01"
  childSelector: promo => promo.month,
  as: "promotions"
});

// Join by name similarity
const products = [
  { id: 1, name: "iPhone-14-Pro" },
  { id: 2, name: "Samsung-S23-Ultra" }
];

const variants = [
  { baseName: "iPhone", color: "black", storage: "128GB" },
  { baseName: "iPhone", color: "white", storage: "256GB" },
  { baseName: "Samsung", color: "green", storage: "256GB" }
];

const productsWithVariants = joinBySelectors({
  parents: products,
  children: variants,
  parentSelector: p => p.name.split("-")[0], // "iPhone"
  childSelector: v => v.baseName,
  as: "variants"
});

// Join by truncated values
const sales = [
  { id: 1, amount: 99.99 },
  { id: 2, amount: 149.50 }
];

const priceRanges = [
  { range: 90, label: "90-100" },
  { range: 140, label: "140-150" }
];

const salesWithRanges = joinBySelectors({
  parents: sales,
  children: priceRanges,
  parentSelector: sale => Math.floor(sale.amount / 10) * 10,
  childSelector: range => range.range,
  as: "priceRange"
});
```

**Type signature:**
```typescript
function joinBySelectors<P, C, K extends PropertyKey, A extends string>(
  options: {
    parents: readonly P[];
    children: readonly C[];
    parentSelector: (parent: P) => K;
    childSelector: (child: C) => K;
    as: A;
  }
): (P & Record<A, C[]>)[]
```

---

## 🔷 Utilities

### 13. `compositeKey` - Create composite keys

**When to use:**
- ✅ You need to manually create keys
- ✅ Debugging
- ✅ Create custom indexes

**Examples:**

```typescript
import { compositeKey } from 'ts-array-joins';

// Create key manually
const key = compositeKey(["A123", "US", "2025"]);
// Result: "A123|US|2025"

// Create search index
const products = [
  { sku: "A123", warehouse: "NY", qty: 10 },
  { sku: "B456", warehouse: "LA", qty: 5 }
];

const index = new Map();
products.forEach(p => {
  const key = compositeKey([p.sku, p.warehouse]);
  index.set(key, p);
});

// Fast lookup
const found = index.get(compositeKey(["A123", "NY"]));
// Result: { sku: "A123", warehouse: "NY", qty: 10 }

// Create cache keys
function getCacheKey(userId: string, resource: string, action: string) {
  return compositeKey([userId, resource, action]);
}

const cacheKey = getCacheKey("user123", "posts", "read");
// Result: "user123|posts|read"

// Debug grouping
const inventory = [
  { sku: "A123", origin: "US" },
  { sku: "A123", origin: "MX" }
];

inventory.forEach(item => {
  const key = compositeKey([item.sku, item.origin]);
  console.log(`Key for ${item.sku}: ${key}`);
});
// Output:
// Key for A123: A123|US
// Key for A123: A123|MX
```

**Type signature:**
```typescript
function compositeKey(values: readonly PropertyKey[]): string
```

---

## 🎯 Quick Reference Table

| Function | Type | Primary Use | Example |
|----------|------|-------------|---------|
| `groupBy` | Grouping | Custom logic | By first letter, range |
| `groupByKey` | Grouping | By property | By userId, category |
| `groupByMany` | Grouping | Multilevel | Region → City → Category |
| `groupByTransform` | Grouping | With aggregation | Statistics, sums |
| `groupByComposite` | Grouping | Multiple keys | SKU + Origin |
| `attachChildren` | Join 1:N | Many children | User → Orders |
| `attachChild` | Join 1:1 | One child | User → Profile |
| `attachChildrenComposite` | Join 1:N | Composite key | Multi-warehouse inventory |
| `attachChildComposite` | Join 1:1 | Composite key | Price by currency |
| `attachChildrenNested` | Join 1:N | Fast composite key | Better performance |
| `attachChildNested` | Join 1:1 | Fast composite key | Better performance |
| `joinBySelectors` | Join custom | Complex logic | Case-insensitive, ranges |
| `compositeKey` | Utility | Create keys | Debugging, indexes |

---

## 🚀 Performance Tips

1. **Use `groupByKey` instead of `groupBy`** when possible (direct property access is faster)
2. **Use `attachChildrenNested`/`attachChildNested` for composite keys** (better than serialized strings)
3. **Chain joins efficiently** - avoid multiple passes over the same data
4. **Pre-filter data** before joining to reduce dataset size
5. **Use `groupByTransform`** to calculate aggregations in one pass

---

## 📖 Common Patterns

### Pattern 1: Nested Joins (SQL-like)
```typescript
// Users with orders and order items
const result = attachChildren({
  parents: attachChildren({
    parents: users,
    children: orders,
    parentKey: "id",
    childKey: "userId",
    as: "orders"
  }),
  children: orderItems,
  parentKey: "id", // Note: Still uses user.id
  childKey: "userId",
  as: "orderItems"
});
```

### Pattern 2: Aggregate then Join
```typescript
// Calculate user stats, then join
const userStats = groupByTransform(
  orders,
  o => o.userId,
  orders => ({
    totalOrders: orders.length,
    totalSpent: orders.reduce((sum, o) => sum + o.amount, 0)
  })
);

// Convert to array for joining
const statsArray = Object.entries(userStats).map(([userId, stats]) => ({
  userId,
  ...stats
}));

// Join with users
const usersWithStats = attachChild({
  parents: users,
  children: statsArray,
  parentKey: "id",
  childKey: "userId",
  as: "stats"
});
```

### Pattern 3: Multiple Relationships
```typescript
// Fetch all data in parallel
const [users, orders, addresses, profiles] = await Promise.all([
  db.users.findMany(),
  db.orders.findMany(),
  db.addresses.findMany(),
  db.profiles.findMany()
]);

// Join multiple relationships
const result = attachChild({
  parents: attachChild({
    parents: attachChildren({
      parents: users,
      children: orders,
      parentKey: "id",
      childKey: "userId",
      as: "orders"
    }),
    children: addresses,
    parentKey: "id",
    childKey: "userId",
    as: "primaryAddress"
  }),
  children: profiles,
  parentKey: "id",
  childKey: "userId",
  as: "profile"
});
```

---

## 📚 Additional Resources

- [Installation Guide](./INSTALL.md)
- [Real-world Recipes](./RECIPES.md)
- [API Documentation](./README.md)
- [GitHub Repository](https://github.com/FernandoBarSan/ts-array-joins)
- [npm Package](https://www.npmjs.com/package/ts-array-joins)

---

## 💡 Need Help?

- 🐛 [Report a Bug](https://github.com/FernandoBarSan/ts-array-joins/issues)
- 💬 [Ask a Question](https://github.com/FernandoBarSan/ts-array-joins/discussions)
- ⭐ [Star on GitHub](https://github.com/FernandoBarSan/ts-array-joins)

---

**Made with ❤️ for TypeScript developers**
