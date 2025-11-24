/**
 * Ejemplos prácticos de uso de ts-array-joins
 *
 * Este archivo contiene ejemplos reales de cómo usar la librería
 * en diferentes escenarios comunes.
 */

import {
  groupByKey,
  groupBy,
  groupByMany,
  attachChildren,
  attachChild,
  attachChildrenNested,
  joinBySelectors,
} from "./src/index.js";

// ==============================================
// EJEMPLO 1: API de E-commerce
// ==============================================

console.log("\n=== EJEMPLO 1: API de E-commerce ===\n");

type Product = {
  id: number;
  name: string;
  categoryId: number;
  price: number;
};

type Category = {
  id: number;
  name: string;
};

type Review = {
  id: number;
  productId: number;
  rating: number;
  comment: string;
};

const products: Product[] = [
  { id: 1, name: "Laptop", categoryId: 1, price: 999 },
  { id: 2, name: "Mouse", categoryId: 1, price: 25 },
  { id: 3, name: "Desk", categoryId: 2, price: 299 },
];

const categories: Category[] = [
  { id: 1, name: "Electronics" },
  { id: 2, name: "Furniture" },
];

const reviews: Review[] = [
  { id: 1, productId: 1, rating: 5, comment: "Great!" },
  { id: 2, productId: 1, rating: 4, comment: "Good" },
  { id: 3, productId: 2, rating: 3, comment: "OK" },
];

// Enriquecer productos con categoría y reviews
const productsWithData = attachChildren({
  parents: attachChild({
    parents: products,
    children: categories,
    parentKey: "categoryId",
    childKey: "id",
    as: "category",
  }),
  children: reviews,
  parentKey: "id",
  childKey: "productId",
  as: "reviews",
});

console.log("Productos enriquecidos:");
console.log(JSON.stringify(productsWithData, null, 2));

// ==============================================
// EJEMPLO 2: Sistema de Inventario Multi-origen
// ==============================================

console.log("\n=== EJEMPLO 2: Sistema de Inventario Multi-origen ===\n");

type InventoryProduct = {
  sku: string;
  origin: string;
  name: string;
};

type Stock = {
  sku: string;
  origin: string;
  warehouse: string;
  quantity: number;
};

const inventoryProducts: InventoryProduct[] = [
  { sku: "LAPTOP-X1", origin: "US", name: "Gaming Laptop" },
  { sku: "LAPTOP-X1", origin: "EU", name: "Gaming Laptop" },
  { sku: "MOUSE-A1", origin: "US", name: "Wireless Mouse" },
];

const stock: Stock[] = [
  { sku: "LAPTOP-X1", origin: "US", warehouse: "WH1", quantity: 50 },
  { sku: "LAPTOP-X1", origin: "US", warehouse: "WH2", quantity: 30 },
  { sku: "LAPTOP-X1", origin: "EU", warehouse: "WH3", quantity: 20 },
  { sku: "MOUSE-A1", origin: "US", warehouse: "WH1", quantity: 100 },
];

// Join usando claves compuestas (SKU + Origin)
const productsWithStock = attachChildrenNested({
  parents: inventoryProducts,
  children: stock,
  parentKeys: ["sku", "origin"],
  childKeys: ["sku", "origin"],
  as: "stockLocations",
});

console.log("Productos con stock por ubicación:");
console.log(JSON.stringify(productsWithStock, null, 2));

// ==============================================
// EJEMPLO 3: Análisis de Ventas por Región
// ==============================================

console.log("\n=== EJEMPLO 3: Análisis de Ventas por Región ===\n");

type Sale = {
  id: number;
  country: string;
  city: string;
  amount: number;
  date: string;
};

const sales: Sale[] = [
  { id: 1, country: "USA", city: "NYC", amount: 100, date: "2024-01-01" },
  { id: 2, country: "USA", city: "NYC", amount: 150, date: "2024-01-02" },
  { id: 3, country: "USA", city: "LA", amount: 200, date: "2024-01-01" },
  { id: 4, country: "Spain", city: "Madrid", amount: 175, date: "2024-01-01" },
  { id: 5, country: "Spain", city: "Madrid", amount: 125, date: "2024-01-02" },
];

// Agrupar por país y ciudad (estructura anidada)
const salesByLocation = groupByMany(sales, ["country", "city"]);

console.log("Ventas agrupadas por ubicación:");
console.log(JSON.stringify(salesByLocation, null, 2));

// Calcular totales por país
const totalsByCountry = groupBy(sales, (s) => s.country);
const summaryByCountry = Object.entries(totalsByCountry).map(
  ([country, sales]) => ({
    country,
    totalSales: sales.reduce((sum, s) => sum + s.amount, 0),
    averageSale: sales.reduce((sum, s) => sum + s.amount, 0) / sales.length,
    count: sales.length,
  })
);

console.log("\nResumen por país:");
console.log(JSON.stringify(summaryByCountry, null, 2));

// ==============================================
// EJEMPLO 4: Sistema de Usuarios y Permisos
// ==============================================

console.log("\n=== EJEMPLO 4: Sistema de Usuarios y Permisos ===\n");

type User = {
  id: number;
  name: string;
  email: string;
};

type Permission = {
  id: number;
  userId: number;
  resource: string;
  action: string;
};

type AuditLog = {
  id: number;
  userId: number;
  action: string;
  timestamp: string;
};

const users: User[] = [
  { id: 1, name: "Ana Admin", email: "ana@example.com" },
  { id: 2, name: "Juan User", email: "juan@example.com" },
];

const permissions: Permission[] = [
  { id: 1, userId: 1, resource: "users", action: "read" },
  { id: 2, userId: 1, resource: "users", action: "write" },
  { id: 3, userId: 1, resource: "products", action: "read" },
  { id: 4, userId: 2, resource: "products", action: "read" },
];

const auditLogs: AuditLog[] = [
  { id: 1, userId: 1, action: "login", timestamp: "2024-01-01T10:00:00Z" },
  {
    id: 2,
    userId: 1,
    action: "create_user",
    timestamp: "2024-01-01T10:05:00Z",
  },
  { id: 3, userId: 2, action: "login", timestamp: "2024-01-01T11:00:00Z" },
];

// Enriquecer usuarios con permisos y logs
const enrichedUsers = attachChildren({
  parents: attachChildren({
    parents: users,
    children: permissions,
    parentKey: "id",
    childKey: "userId",
    as: "permissions",
  }),
  children: auditLogs,
  parentKey: "id",
  childKey: "userId",
  as: "activityLog",
});

console.log("Usuarios con permisos y actividad:");
console.log(JSON.stringify(enrichedUsers, null, 2));

// ==============================================
// EJEMPLO 5: Join con Selectores Personalizados
// ==============================================

console.log("\n=== EJEMPLO 5: Join con Selectores Personalizados ===\n");

type Order = {
  orderId: string; // Formato: "ORD-123"
  customerName: string;
  total: number;
};

type Payment = {
  paymentId: string;
  orderReference: string; // Solo el número: "123"
  amount: number;
  method: string;
};

const orders: Order[] = [
  { orderId: "ORD-123", customerName: "Ana", total: 100 },
  { orderId: "ORD-456", customerName: "Juan", total: 200 },
];

const payments: Payment[] = [
  { paymentId: "PAY-1", orderReference: "123", amount: 100, method: "card" },
  { paymentId: "PAY-2", orderReference: "456", amount: 200, method: "paypal" },
];

// Join usando selectores para transformar las claves
const ordersWithPayments = joinBySelectors({
  parents: orders,
  children: payments,
  parentSelector: (order) => order.orderId.split("-")[1], // "ORD-123" -> "123"
  childSelector: (payment) => payment.orderReference, // "123"
  as: "payment",
  mode: "one",
});

console.log("Órdenes con pagos (usando selectores):");
console.log(JSON.stringify(ordersWithPayments, null, 2));

// ==============================================
// EJEMPLO 6: Agrupación con Transformación
// ==============================================

console.log("\n=== EJEMPLO 6: Agrupación con Transformación ===\n");

type Transaction = {
  id: number;
  userId: number;
  amount: number;
  type: "deposit" | "withdrawal";
};

const transactions: Transaction[] = [
  { id: 1, userId: 1, amount: 100, type: "deposit" },
  { id: 2, userId: 1, amount: 50, type: "withdrawal" },
  { id: 3, userId: 1, amount: 200, type: "deposit" },
  { id: 4, userId: 2, amount: 300, type: "deposit" },
  { id: 5, userId: 2, amount: 100, type: "withdrawal" },
];

// Calcular balance por usuario con groupByTransform
import { groupByTransform } from "./src/groupBy.js";

const balanceByUser = groupByTransform(
  transactions,
  (t) => t.userId,
  (txns) => {
    const deposits = txns
      .filter((t) => t.type === "deposit")
      .reduce((sum, t) => sum + t.amount, 0);
    const withdrawals = txns
      .filter((t) => t.type === "withdrawal")
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      deposits,
      withdrawals,
      balance: deposits - withdrawals,
      transactionCount: txns.length,
    };
  }
);

console.log("Balance por usuario:");
console.log(JSON.stringify(balanceByUser, null, 2));

console.log("\n=== FIN DE EJEMPLOS ===\n");
