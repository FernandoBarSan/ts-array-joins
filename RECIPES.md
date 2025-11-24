# 🍳 Cookbook - Real-World Recipes

> **Practical examples solving common data manipulation problems**

This cookbook contains real-world scenarios and solutions using `ts-array-joins`. Each recipe solves a specific problem you might encounter in your applications.

## 📖 Table of Contents

- [Database & ORM](#-database--orm)
  - [Prisma: Join Multiple Tables](#recipe-1-prisma-join-multiple-tables)
  - [TypeORM: Combine Query Results](#recipe-2-typeorm-combine-query-results)
  - [MongoDB: Aggregate Related Documents](#recipe-3-mongodb-aggregate-related-documents)
- [API & Backend](#-api--backend)
  - [REST API: Combine Multiple Endpoints](#recipe-4-rest-api-combine-multiple-endpoints)
  - [GraphQL: Resolve Nested Relations](#recipe-5-graphql-resolve-nested-relations)
  - [Microservices: Merge Service Responses](#recipe-6-microservices-merge-service-responses)
- [E-commerce](#-e-commerce)
  - [Product Catalog with Variants](#recipe-7-product-catalog-with-variants)
  - [Shopping Cart Totals](#recipe-8-shopping-cart-totals)
  - [Multi-warehouse Inventory](#recipe-9-multi-warehouse-inventory)
- [Analytics & Reporting](#-analytics--reporting)
  - [Sales Dashboard](#recipe-10-sales-dashboard)
  - [User Activity Report](#recipe-11-user-activity-report)
  - [Multi-dimensional Analytics](#recipe-12-multi-dimensional-analytics)
- [Data Import/Export](#-data-importexport)
  - [CSV to Hierarchical JSON](#recipe-13-csv-to-hierarchical-json)
  - [Normalize Flat Data](#recipe-14-normalize-flat-data)

---

## 🗄️ Database & ORM

### Recipe 1: Prisma - Join Multiple Tables

**Problem:** You need to fetch users with their orders and order items from Prisma, but making separate queries.

**Solution:**

```typescript
import { attachChildren } from 'ts-array-joins';

async function getUsersWithOrders() {
  // Fetch all data in parallel (faster than nested includes)
  const [users, orders, orderItems] = await Promise.all([
    prisma.user.findMany(),
    prisma.order.findMany(),
    prisma.orderItem.findMany()
  ]);

  // Join orders to users
  const usersWithOrders = attachChildren({
    parents: users,
    children: orders,
    parentKey: "id",
    childKey: "userId",
    as: "orders"
  });

  // Join order items to the result
  return usersWithOrders.map(user => ({
    ...user,
    orders: user.orders.map(order => {
      const items = orderItems.filter(item => item.orderId === order.id);
      return { ...order, items };
    })
  }));
}

// Usage
const result = await getUsersWithOrders();
/* Result:
[
  {
    id: 1,
    name: "Alice",
    orders: [
      { id: 101, total: 100, items: [{ product: "Laptop" }, ...] },
      { id: 102, total: 50, items: [{ product: "Mouse" }] }
    ]
  }
]
*/
```

**Benefits:**
- ✅ Faster than nested `include` queries
- ✅ Better control over what data is fetched
- ✅ Type-safe results

---

### Recipe 2: TypeORM - Combine Query Results

**Problem:** You have separate queries for entities and need to combine them.

```typescript
import { attachChild, attachChildren } from 'ts-array-joins';

async function getProductsWithDetails() {
  const [products, prices, inventory, categories] = await Promise.all([
    productRepo.find(),
    priceRepo.find(),
    inventoryRepo.find(),
    categoryRepo.find()
  ]);

  // Attach category (one-to-one)
  let result = attachChild({
    parents: products,
    children: categories,
    parentKey: "categoryId",
    childKey: "id",
    as: "category"
  });

  // Attach prices (one-to-many)
  result = attachChildren({
    parents: result,
    children: prices,
    parentKey: "id",
    childKey: "productId",
    as: "prices"
  });

  // Attach inventory (one-to-many)
  result = attachChildren({
    parents: result,
    children: inventory,
    parentKey: "id",
    childKey: "productId",
    as: "inventory"
  });

  return result;
}
```

---

### Recipe 3: MongoDB - Aggregate Related Documents

**Problem:** You fetched documents from multiple collections and need to combine them.

```typescript
import { attachChildren, groupByKey } from 'ts-array-joins';

async function getBlogsWithAuthors() {
  const [posts, comments, users] = await Promise.all([
    db.collection('posts').find().toArray(),
    db.collection('comments').find().toArray(),
    db.collection('users').find().toArray()
  ]);

  // Create author lookup
  const authorsById = groupByKey(users, "_id");

  // Attach comments to posts
  const postsWithComments = attachChildren({
    parents: posts,
    children: comments,
    parentKey: "_id",
    childKey: "postId",
    as: "comments"
  });

  // Add author info to each post
  return postsWithComments.map(post => ({
    ...post,
    author: authorsById[post.authorId]?.[0] || null,
    comments: post.comments.map(comment => ({
      ...comment,
      author: authorsById[comment.authorId]?.[0] || null
    }))
  }));
}
```

---

## 🌐 API & Backend

### Recipe 4: REST API - Combine Multiple Endpoints

**Problem:** You need to fetch related data from multiple API endpoints and combine them.

```typescript
import { attachChildren, attachChild } from 'ts-array-joins';

async function getUserDashboard(userId: string) {
  // Fetch from multiple endpoints in parallel
  const [user, orders, payments, addresses] = await Promise.all([
    fetch(`/api/users/${userId}`).then(r => r.json()),
    fetch(`/api/orders?userId=${userId}`).then(r => r.json()),
    fetch(`/api/payments?userId=${userId}`).then(r => r.json()),
    fetch(`/api/addresses?userId=${userId}`).then(r => r.json())
  ]);

  // Combine into single object
  const userWithOrders = attachChildren({
    parents: [user],
    children: orders,
    parentKey: "id",
    childKey: "userId",
    as: "orders"
  })[0];

  const userWithPayments = attachChildren({
    parents: [userWithOrders],
    children: payments,
    parentKey: "id",
    childKey: "userId",
    as: "payments"
  })[0];

  const result = attachChild({
    parents: [userWithPayments],
    children: addresses,
    parentKey: "id",
    childKey: "userId",
    as: "primaryAddress"
  })[0];

  return result;
}

// Usage
const dashboard = await getUserDashboard("user123");
/* Result:
{
  id: "user123",
  name: "Alice",
  orders: [...],
  payments: [...],
  primaryAddress: { street: "...", city: "..." }
}
*/
```

---

### Recipe 5: GraphQL - Resolve Nested Relations

**Problem:** Efficiently resolve nested GraphQL queries without N+1 problem.

```typescript
import { attachChildren, groupByKey } from 'ts-array-joins';
import DataLoader from 'dataloader';

// GraphQL resolver
const resolvers = {
  Query: {
    users: async () => {
      const [users, orders] = await Promise.all([
        db.users.findMany(),
        db.orders.findMany()
      ]);

      return attachChildren({
        parents: users,
        children: orders,
        parentKey: "id",
        childKey: "userId",
        as: "orders"
      });
    }
  },
  
  User: {
    orders: async (parent, args, context) => {
      // Already loaded via dataloader/join
      return parent.orders || [];
    }
  }
};

// Usage in GraphQL query
/*
query {
  users {
    id
    name
    orders {
      id
      total
    }
  }
}
*/
```

---

### Recipe 6: Microservices - Merge Service Responses

**Problem:** Combine data from multiple microservices.

```typescript
import { joinBySelectors } from 'ts-array-joins';

async function getUsersWithProfiles() {
  // Call different microservices
  const [usersFromAuthService, profilesFromProfileService] = await Promise.all([
    authService.getUsers(),
    profileService.getProfiles()
  ]);

  // Join by normalized email (case-insensitive)
  return joinBySelectors({
    parents: usersFromAuthService,
    children: profilesFromProfileService,
    parentSelector: user => user.email.toLowerCase(),
    childSelector: profile => profile.email.toLowerCase(),
    as: "profile"
  });
}
```

---

## 🛒 E-commerce

### Recipe 7: Product Catalog with Variants

**Problem:** Display products with their variants, prices, and inventory.

```typescript
import { attachChildren, attachChildComposite } from 'ts-array-joins';

async function getProductCatalog() {
  const [products, variants, prices, inventory] = await Promise.all([
    db.products.findMany(),
    db.variants.findMany(),
    db.prices.findMany(),
    db.inventory.findMany()
  ]);

  // Attach variants to products
  let catalog = attachChildren({
    parents: products,
    children: variants,
    parentKey: "id",
    childKey: "productId",
    as: "variants"
  });

  // For each variant, attach price and inventory
  catalog = catalog.map(product => ({
    ...product,
    variants: product.variants.map(variant => {
      const price = prices.find(p => 
        p.variantId === variant.id && p.currency === "USD"
      );
      const stock = inventory.find(i => i.variantId === variant.id);
      
      return {
        ...variant,
        price: price?.amount || 0,
        inStock: stock?.quantity || 0
      };
    })
  }));

  return catalog;
}

// Usage
const catalog = await getProductCatalog();
/* Result:
[
  {
    id: 1,
    name: "T-Shirt",
    variants: [
      { id: 101, size: "S", color: "Red", price: 19.99, inStock: 10 },
      { id: 102, size: "M", color: "Red", price: 19.99, inStock: 5 },
      { id: 103, size: "L", color: "Blue", price: 19.99, inStock: 0 }
    ]
  }
]
*/
```

---

### Recipe 8: Shopping Cart Totals

**Problem:** Calculate cart totals with products, quantities, and discounts.

```typescript
import { attachChild, groupByTransform } from 'ts-array-joins';

interface CartItem {
  productId: string;
  quantity: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

async function getCartTotal(cartItems: CartItem[]) {
  const productIds = cartItems.map(item => item.productId);
  const products = await db.products.findMany({
    where: { id: { in: productIds } }
  });

  // Attach product info to cart items
  const itemsWithProducts = attachChild({
    parents: cartItems,
    children: products,
    parentKey: "productId",
    childKey: "id",
    as: "product"
  });

  // Calculate totals
  const total = itemsWithProducts.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + (price * item.quantity);
  }, 0);

  return {
    items: itemsWithProducts,
    subtotal: total,
    tax: total * 0.10,
    total: total * 1.10
  };
}

// Usage
const cart = await getCartTotal([
  { productId: "1", quantity: 2 },
  { productId: "2", quantity: 1 }
]);
/* Result:
{
  items: [
    { productId: "1", quantity: 2, product: { name: "Laptop", price: 999 } },
    { productId: "2", quantity: 1, product: { name: "Mouse", price: 29 } }
  ],
  subtotal: 2027,
  tax: 202.70,
  total: 2229.70
}
*/
```

---

### Recipe 9: Multi-warehouse Inventory

**Problem:** Track inventory across multiple warehouses with composite keys.

```typescript
import { attachChildrenComposite, groupByComposite } from 'ts-array-joins';

async function getProductInventory() {
  const [products, inventory] = await Promise.all([
    db.products.findMany(),
    db.inventory.findMany() // { sku, warehouseId, quantity, location }
  ]);

  // Group inventory by product
  const productsWithInventory = attachChildren({
    parents: products,
    children: inventory,
    parentKey: "sku",
    childKey: "sku",
    as: "inventory"
  });

  // Calculate totals per warehouse
  return productsWithInventory.map(product => ({
    ...product,
    totalStock: product.inventory.reduce((sum, inv) => sum + inv.quantity, 0),
    warehouses: groupByKey(product.inventory, "warehouseId")
  }));
}

// Usage
const inventory = await getProductInventory();
/* Result:
[
  {
    sku: "A123",
    name: "Laptop",
    totalStock: 25,
    warehouses: {
      "WH-NY": [{ quantity: 10, location: "A1" }, { quantity: 5, location: "A2" }],
      "WH-LA": [{ quantity: 10, location: "B1" }]
    }
  }
]
*/
```

---

## 📊 Analytics & Reporting

### Recipe 10: Sales Dashboard

**Problem:** Create a sales dashboard with aggregated metrics.

```typescript
import { groupByTransform, groupByMany } from 'ts-array-joins';

interface Sale {
  id: string;
  date: string;
  amount: number;
  region: string;
  category: string;
  salesperson: string;
}

async function getSalesDashboard(sales: Sale[]) {
  // Group by salesperson with stats
  const bySelesperson = groupByTransform(
    sales,
    sale => sale.salesperson,
    sales => ({
      totalSales: sales.length,
      totalRevenue: sales.reduce((sum, s) => sum + s.amount, 0),
      avgOrderValue: sales.reduce((sum, s) => sum + s.amount, 0) / sales.length,
      topCategory: Object.entries(
        groupByKey(sales, "category")
      ).sort((a, b) => b[1].length - a[1].length)[0]?.[0]
    })
  );

  // Multi-dimensional grouping
  const byRegionAndCategory = groupByMany(sales, ["region", "category"]);

  // Time series (by month)
  const byMonth = groupByTransform(
    sales,
    sale => sale.date.slice(0, 7), // "2025-01"
    sales => sales.reduce((sum, s) => sum + s.amount, 0)
  );

  return {
    bySelesperson,
    byRegionAndCategory,
    byMonth,
    totals: {
      revenue: sales.reduce((sum, s) => sum + s.amount, 0),
      orders: sales.length,
      avgOrderValue: sales.reduce((sum, s) => sum + s.amount, 0) / sales.length
    }
  };
}

// Usage
const dashboard = await getSalesDashboard(salesData);
/* Result:
{
  bySelesperson: {
    "Alice": { totalSales: 50, totalRevenue: 50000, avgOrderValue: 1000, topCategory: "Electronics" }
  },
  byRegionAndCategory: {
    "North": { "Electronics": [...], "Clothing": [...] },
    "South": { "Electronics": [...] }
  },
  byMonth: {
    "2025-01": 100000,
    "2025-02": 150000
  },
  totals: { revenue: 250000, orders: 250, avgOrderValue: 1000 }
}
*/
```

---

### Recipe 11: User Activity Report

**Problem:** Analyze user activity across multiple actions.

```typescript
import { groupByKey, groupByTransform } from 'ts-array-joins';

interface Activity {
  userId: string;
  action: string;
  timestamp: string;
  metadata?: any;
}

async function getUserActivityReport(activities: Activity[]) {
  // Group by user with action counts
  const userActivity = groupByTransform(
    activities,
    activity => activity.userId,
    activities => {
      const actionCounts = groupByTransform(
        activities,
        a => a.action,
        actions => actions.length
      );

      return {
        totalActions: activities.length,
        actions: actionCounts,
        firstActivity: activities[0]?.timestamp,
        lastActivity: activities[activities.length - 1]?.timestamp,
        mostFrequentAction: Object.entries(actionCounts)
          .sort((a, b) => b[1] - a[1])[0]?.[0]
      };
    }
  );

  // Get users data
  const userIds = Object.keys(userActivity);
  const users = await db.users.findMany({
    where: { id: { in: userIds } }
  });

  // Combine with user info
  return users.map(user => ({
    ...user,
    activity: userActivity[user.id]
  }));
}

// Usage
const report = await getUserActivityReport(activityLogs);
/* Result:
[
  {
    id: "user1",
    name: "Alice",
    activity: {
      totalActions: 150,
      actions: { login: 50, view: 75, purchase: 25 },
      firstActivity: "2025-01-01T00:00:00Z",
      lastActivity: "2025-01-31T23:59:59Z",
      mostFrequentAction: "view"
    }
  }
]
*/
```

---

### Recipe 12: Multi-dimensional Analytics

**Problem:** Analyze data across multiple dimensions (time, region, category).

```typescript
import { groupByMany, groupByTransform } from 'ts-array-joins';

async function getMultiDimensionalReport(sales: Sale[]) {
  // 3-level grouping: Year → Month → Category
  const temporal = groupByMany(
    sales.map(s => ({
      ...s,
      year: s.date.slice(0, 4),
      month: s.date.slice(5, 7)
    })),
    ["year", "month", "category"]
  );

  // Geographic analysis
  const geographic = groupByTransform(
    sales,
    s => s.region,
    sales => ({
      revenue: sales.reduce((sum, s) => sum + s.amount, 0),
      orders: sales.length,
      topProducts: Object.entries(groupByKey(sales, "category"))
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 5)
        .map(([category, items]) => ({
          category,
          sales: items.length,
          revenue: items.reduce((sum, s) => sum + s.amount, 0)
        }))
    })
  );

  return { temporal, geographic };
}
```

---

## 📥 Data Import/Export

### Recipe 13: CSV to Hierarchical JSON

**Problem:** Convert flat CSV data to hierarchical JSON structure.

```typescript
import { groupByMany } from 'ts-array-joins';

interface CSVRow {
  country: string;
  state: string;
  city: string;
  population: number;
}

function csvToHierarchy(rows: CSVRow[]) {
  // Group by country → state → city
  return groupByMany(rows, ["country", "state", "city"]);
}

// Usage
const csvData = [
  { country: "USA", state: "NY", city: "NYC", population: 8000000 },
  { country: "USA", state: "NY", city: "Buffalo", population: 250000 },
  { country: "USA", state: "CA", city: "LA", population: 4000000 }
];

const hierarchy = csvToHierarchy(csvData);
/* Result:
{
  USA: {
    NY: {
      NYC: [{ population: 8000000 }],
      Buffalo: [{ population: 250000 }]
    },
    CA: {
      LA: [{ population: 4000000 }]
    }
  }
}
*/
```

---

### Recipe 14: Normalize Flat Data

**Problem:** Convert denormalized data into normalized relations.

```typescript
import { groupByKey } from 'ts-array-joins';

interface FlatOrder {
  orderId: string;
  orderDate: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  quantity: number;
}

function normalizeOrders(flatData: FlatOrder[]) {
  // Extract unique customers
  const customersMap = new Map();
  flatData.forEach(row => {
    if (!customersMap.has(row.customerId)) {
      customersMap.set(row.customerId, {
        id: row.customerId,
        name: row.customerName
      });
    }
  });
  const customers = Array.from(customersMap.values());

  // Extract unique products
  const productsMap = new Map();
  flatData.forEach(row => {
    if (!productsMap.has(row.productId)) {
      productsMap.set(row.productId, {
        id: row.productId,
        name: row.productName
      });
    }
  });
  const products = Array.from(productsMap.values());

  // Extract orders
  const ordersMap = new Map();
  flatData.forEach(row => {
    if (!ordersMap.has(row.orderId)) {
      ordersMap.set(row.orderId, {
        id: row.orderId,
        date: row.orderDate,
        customerId: row.customerId
      });
    }
  });
  const orders = Array.from(ordersMap.values());

  // Extract order items
  const orderItems = flatData.map(row => ({
    orderId: row.orderId,
    productId: row.productId,
    quantity: row.quantity
  }));

  return { customers, products, orders, orderItems };
}

// Usage
const flatData = [
  {
    orderId: "O1", orderDate: "2025-01-01",
    customerId: "C1", customerName: "Alice",
    productId: "P1", productName: "Laptop",
    quantity: 1
  },
  {
    orderId: "O1", orderDate: "2025-01-01",
    customerId: "C1", customerName: "Alice",
    productId: "P2", productName: "Mouse",
    quantity: 2
  }
];

const normalized = normalizeOrders(flatData);
/* Result:
{
  customers: [{ id: "C1", name: "Alice" }],
  products: [{ id: "P1", name: "Laptop" }, { id: "P2", name: "Mouse" }],
  orders: [{ id: "O1", date: "2025-01-01", customerId: "C1" }],
  orderItems: [
    { orderId: "O1", productId: "P1", quantity: 1 },
    { orderId: "O1", productId: "P2", quantity: 2 }
  ]
}
*/
```

---

## 🎯 Tips & Best Practices

### 1. Fetch Data in Parallel
```typescript
// ✅ Good: Parallel fetching
const [users, orders] = await Promise.all([
  db.users.findMany(),
  db.orders.findMany()
]);

// ❌ Bad: Sequential fetching
const users = await db.users.findMany();
const orders = await db.orders.findMany();
```

### 2. Use Appropriate Join Type
```typescript
// One-to-many: Use attachChildren
const usersWithOrders = attachChildren({...});

// One-to-one: Use attachChild
const usersWithProfile = attachChild({...});
```

### 3. Composite Keys Performance
```typescript
// ✅ Better: Use Nested for large datasets
attachChildrenNested({ parentKeys: ["sku", "warehouse"], ... });

// ✅ Good: Use Composite for simple cases
attachChildrenComposite({ parentKeys: ["sku", "warehouse"], ... });
```

### 4. Pre-filter Data
```typescript
// ✅ Good: Filter before joining
const activeOrders = orders.filter(o => o.status === "active");
const result = attachChildren({ children: activeOrders, ... });

// ❌ Bad: Join all then filter
const result = attachChildren({ children: orders, ... });
const filtered = result.filter(...)
```

---

## 📚 See Also

- [Complete Function Guide](./GUIDE.md) - Detailed API documentation
- [Installation Guide](./INSTALL.md) - Setup instructions
- [README](./README.md) - Main documentation

---

**Happy coding! 🚀**
