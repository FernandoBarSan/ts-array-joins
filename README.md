# ts-array-joins

[![npm version](https://img.shields.io/npm/v/ts-array-joins.svg)](https://www.npmjs.com/package/ts-array-joins)
[![npm downloads](https://img.shields.io/npm/dm/ts-array-joins.svg)](https://www.npmjs.com/package/ts-array-joins)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)

> **Strongly-typed TypeScript utilities for array grouping, SQL-like joins, and data aggregation**

A modern, zero-dependency library for grouping arrays and performing SQL-like joins in TypeScript with full type safety and excellent performance.

## 🔍 Perfect for

- 🗄️ **Database result processing** - Join data from multiple Prisma/TypeORM queries
- 📊 **Data aggregation** - Group and transform arrays with type safety
- 🔄 **API response transformation** - Combine related data from multiple endpoints
- 📈 **Analytics and reporting** - Multi-dimensional data grouping
- 🎯 **Alternative to Lodash/Ramda** - With better TypeScript support

## 🎯 Características

- 🔒 **Type-Safe**: Soporte completo de TypeScript con tipado estricto
- 🎯 **Zero Dependencies**: Sin dependencias externas en runtime
- ⚡ **Performance**: Complejidad O(n + m) para joins
- 🔧 **Inmutable**: Nunca muta los datos de entrada
- 📦 **Tree-Shakeable**: Soporte ESM y CJS
- 🎨 **Composable**: Encadena múltiples operaciones fácilmente
- 🔑 **Composite Keys**: Joins con claves compuestas (múltiples propiedades)
- 🔗 **Three-Level Joins**: Join de 3 niveles con patrón catálogo (`attachChildrenWithFilter`)
- 🎛️ **Cardinality Control**: Controla si quieres arrays o elementos únicos (`"one"` o `"many"`)
- 🔄 **Inner Join**: Excluye padres sin hijos (`innerJoin`)
- 🔍 **Filter Predicates**: Filtra hijos con predicado personalizado (`attachChildrenWhere`)
- 📊 **Aggregation**: Computa valores agregados de hijos (`attachAggregate`)
- ⛓️ **Fluent API**: Encadena múltiples joins con `from().attachChildren().build()`
- 🌳 **Array to Tree**: Convierte arrays planos a árboles en O(n) (`arrayToTree`)
- 🌲 **Tree to Array**: Aplana árboles de vuelta a arrays (`treeToArray`)
- 🔄 **Full Outer Join**: Incluye items sin match de ambos lados (`fullOuterJoin`)
- ✖️ **Cross Join**: Producto cartesiano de dos arrays (`crossJoin`, `crossJoinMerge`)
- 🦥 **Lazy Builder**: Evaluación diferida con pipeline fluent (`lazy`)
- 📦 **Set Operations**: diff, intersect, except por key
- 🔑 **Lookup Utilities**: `uniqueBy`, `keyBy`, `flatMapChildren`
- ✂️ **Array Splitting**: `chunk`, `partition`
- 🗺️ **Record Transform**: `mapValues`, `pick`, `omit`
- ⚡ **Index Cache**: Cache de índices Map con `IndexCache`

## 📦 Instalación

```bash
npm install ts-array-joins
```

```bash
yarn add ts-array-joins
```

```bash
pnpm add ts-array-joins
```

## 🚀 Inicio Rápido

```typescript
import {
  groupByKey,
  attachChildren,
  attachChildrenWithFilter,
} from "ts-array-joins";

// Agrupar arrays
const users = [
  { id: 1, role: "admin", name: "Ana" },
  { id: 2, role: "user", name: "Juan" },
];

const byRole = groupByKey(users, "role");
// { admin: [...], user: [...] }

// Joins (one-to-many)
const orders = [
  { id: 101, userId: 1, total: 50 },
  { id: 102, userId: 1, total: 100 },
];

const usersWithOrders = attachChildren({
  parents: users,
  children: orders,
  parentKey: "id",
  childKey: "userId",
  as: "orders",
});
// Array<User & { orders: Order[] }>

// Three-level joins (catalog pattern) 🆕
const enrollments = [{ id: 1, studentName: "Ana" }];
const periodFees = [
  { id: 1, name: "Registration", amount: 100 },
  { id: 2, name: "Tuition", amount: 500 },
];
const payments = [{ id: 1, enrollmentId: 1, feeId: 1, paid: 100 }];

const result = attachChildrenWithFilter({
  parents: enrollments,
  middle: periodFees, // Shared catalog
  children: payments, // Filtered by enrollment
  parentKey: "id",
  childParentKey: "enrollmentId",
  middleKey: "id",
  childKey: "feeId",
  middleAs: "fees",
  childAs: "payment",
  childCardinality: "one", // Each fee has at most one payment
});
// Array<Enrollment & { fees: Array<Fee & { payment?: Payment }> }>
```

## 📚 API Reference

### Funciones de Agrupación

#### `groupByKey(items, key)`

Agrupa un array por una propiedad con inferencia de tipos completa.

```typescript
type User = { id: number; role: 'admin' | 'user'; name: string };
const users: User[] = [...];

const grouped = groupByKey(users, 'role');
// Type: Record<'admin' | 'user', User[]>
```

#### `groupBy(items, keySelector)`

Agrupa usando una función selectora personalizada.

```typescript
const byFirstLetter = groupBy(users, (u) => u.name[0]);
// Record<string, User[]>
```

#### `groupByMany(items, keys)`

Crea grupos anidados usando múltiples claves.

```typescript
type Sale = { country: string; city: string; amount: number };
const sales: Sale[] = [...];

const nested = groupByMany(sales, ['country', 'city']);
// Record<string, Record<string, Sale[]>>
```

#### `groupByTransform(items, keySelector, valueTransform)`

Agrupa y transforma cada grupo.

```typescript
const totalByUser = groupByTransform(
  orders,
  (o) => o.userId,
  (orders) => orders.reduce((sum, o) => sum + o.total, 0)
);
// Record<number, number>
```

### Funciones de Join

#### `attachChildren(params)` - One-to-Many

Realiza un join uno-a-muchos (como SQL LEFT JOIN con agrupación).

```typescript
type User = { id: number; name: string };
type Order = { id: number; userId: number; total: number };

const result = attachChildren({
  parents: users,
  children: orders,
  parentKey: "id",
  childKey: "userId",
  as: "orders",
});
// Array<User & { orders: Order[] }>
```

**Características:**

- Los padres sin hijos obtienen array vacío `[]`
- Complejidad O(n + m)
- Completamente type-safe

#### `attachChild(params)` - One-to-One

Realiza un join uno-a-uno (como SQL LEFT JOIN).

```typescript
type Address = { id: number; userId: number; city: string };

const result = attachChild({
  parents: users,
  children: addresses,
  parentKey: "id",
  childKey: "userId",
  as: "address",
});
// Array<User & { address: Address | null }>
```

**Características:**

- Se usa el primer match cuando existen múltiples hijos
- Los padres sin match obtienen `null`
- Preserva todos los elementos padre

#### `joinBySelectors(params)`

Join usando funciones selectoras personalizadas.

```typescript
type Product = { sku: string; name: string };
type Review = { productCode: string; rating: number };

const result = joinBySelectors({
  parents: products,
  children: reviews,
  parentSelector: (p) => p.sku,
  childSelector: (r) => r.productCode,
  as: "reviews",
  mode: "many", // o 'one'
});
```

**Casos de uso:**

- Propiedades con nombres diferentes
- Claves de join computadas
- Lógica de matching compleja

#### `attachChildrenWithFilter(params)` - Three-Level Hierarchy with Catalog Pattern

**🆕 Nuevo en v1.1.0**

Realiza joins de 3 niveles donde el array intermedio actúa como un catálogo compartido y los hijos se filtran por cada padre.

```typescript
type Enrollment = { id: number; courseName: string };
type PeriodFee = { id: number; name: string; amount: number };
type Payment = {
  id: number;
  enrollmentId: number;
  feeId: number;
  paid: number;
};

const enrollments: Enrollment[] = [{ id: 1, courseName: "TypeScript Basics" }];

const periodFees: PeriodFee[] = [
  { id: 1, name: "Registration", amount: 100 },
  { id: 2, name: "Tuition", amount: 500 },
  { id: 3, name: "Materials", amount: 50 },
];

const payments: Payment[] = [
  { id: 1, enrollmentId: 1, feeId: 1, paid: 100 },
  { id: 2, enrollmentId: 1, feeId: 2, paid: 500 },
  // Note: No payment for Materials (feeId: 3)
];

const result = attachChildrenWithFilter({
  parents: enrollments,
  middle: periodFees, // Shared catalog
  children: payments, // Filtered by enrollment
  parentKey: "id",
  childParentKey: "enrollmentId",
  middleKey: "id",
  childKey: "feeId",
  middleAs: "fees",
  childAs: "payments",
});

// Result: Array<Enrollment & {
//   fees: Array<PeriodFee & {
//     payments: Payment[]
//   }>
// }>

// Enrollment 1 sees ALL fees (catalog), but only its own payments:
// {
//   id: 1,
//   courseName: "TypeScript Basics",
//   fees: [
//     { id: 1, name: "Registration", amount: 100, payments: [payment1] },
//     { id: 2, name: "Tuition", amount: 500, payments: [payment2] },
//     { id: 3, name: "Materials", amount: 50, payments: [] }  // ← No payment yet
//   ]
// }
```

**🎯 Cardinality Control**

Controla si quieres arrays o elementos únicos con `middleCardinality` y `childCardinality`:

```typescript
// Default: many-to-many (arrays)
const result1 = attachChildrenWithFilter({
  parents: enrollments,
  middle: periodFees,
  children: payments,
  parentKey: "id",
  childParentKey: "enrollmentId",
  middleKey: "id",
  childKey: "feeId",
  middleAs: "fees",
  childAs: "payments",
  // middleCardinality: "many" (default)
  // childCardinality: "many" (default)
});
// Type: { fees: Array<{ payments: Payment[] }> }

// many-to-one: Each fee has at most ONE payment
const result2 = attachChildrenWithFilter({
  parents: enrollments,
  middle: periodFees,
  children: payments,
  parentKey: "id",
  childParentKey: "enrollmentId",
  middleKey: "id",
  childKey: "feeId",
  middleAs: "fees",
  childAs: "payment", // ← Singular
  childCardinality: "one", // ← Returns single object or undefined
});
// Type: { fees: Array<{ payment?: Payment }> }

// one-to-many: Enrollment has ONE category with MANY items
const result3 = attachChildrenWithFilter({
  parents: users,
  middle: categories,
  children: items,
  parentKey: "id",
  childParentKey: "userId",
  middleKey: "id",
  childKey: "categoryId",
  middleAs: "category", // ← Singular
  childAs: "items",
  middleCardinality: "one", // ← Returns single object or undefined
});
// Type: { category?: { items: Item[] } }

// one-to-one: Both singular
const result4 = attachChildrenWithFilter({
  parents: orders,
  middle: shippingInfo,
  children: trackings,
  parentKey: "id",
  childParentKey: "orderId",
  middleKey: "id",
  childKey: "shippingId",
  middleAs: "shipping", // ← Singular
  childAs: "tracking", // ← Singular
  middleCardinality: "one",
  childCardinality: "one",
});
// Type: { shipping?: { tracking?: Tracking } }
```

**Características:**

- **Catálogo compartido**: Todos los padres ven los mismos items del `middle`
- **Filtrado eficiente**: Los hijos se filtran automáticamente por padre
- **Complejidad**: O(p × m + c) donde p=parents, m=middle, c=children
- **Control de cardinalidad**: `"one"` o `"many"` para `middle` y `children`
- **Type-safe**: Inferencia completa de tipos según cardinalidad

**Casos de uso perfectos:**

- 📚 **Cursos → Cuotas del periodo → Pagos por inscripción**
- 🛒 **Usuarios → Productos (catálogo) → Compras del usuario**
- 📦 **Órdenes → Items disponibles → Items de la orden**
- 🏥 **Pacientes → Tratamientos (catálogo) → Citas del paciente**

#### `innerJoin(params)` - Inner Join

**🆕 Nuevo en v1.2.0**

Solo retorna padres que tienen al menos un hijo que haga match. Los padres sin hijos se excluyen del resultado (equivalente a SQL INNER JOIN).

```typescript
type User = { id: number; name: string };
type Order = { id: number; userId: number; total: number };

const users: User[] = [
  { id: 1, name: "Ana" },
  { id: 2, name: "Juan" },
  { id: 3, name: "Luis" }, // sin órdenes
];

const orders: Order[] = [
  { id: 101, userId: 1, total: 50 },
  { id: 102, userId: 2, total: 75 },
];

const result = innerJoin({
  parents: users,
  children: orders,
  parentKey: "id",
  childKey: "userId",
  as: "orders",
});

// Result: solo Ana y Juan (Luis excluido - sin órdenes)
// Array<User & { orders: Order[] }>
// [
//   { id: 1, name: "Ana", orders: [{ id: 101, userId: 1, total: 50 }] },
//   { id: 2, name: "Juan", orders: [{ id: 102, userId: 2, total: 75 }] }
// ]
```

**Diferencia con `attachChildren`:**

| Función          | Padres sin hijos  | Equivalente SQL |
| ---------------- | ----------------- | --------------- |
| `attachChildren` | Incluidos (`[]`)  | LEFT JOIN       |
| `innerJoin`      | **Excluidos**     | INNER JOIN      |

#### `attachChildrenWhere(params)` - Join con Filtro

**🆕 Nuevo en v1.2.0**

Adjunta hijos filtrados con un predicado personalizado. Primero hace match por key (O(n+m)), luego filtra con el predicado.

```typescript
type User = { id: number; name: string; minAmount: number };
type Order = { id: number; userId: number; total: number; status: string };

const users: User[] = [
  { id: 1, name: "Ana", minAmount: 60 },
  { id: 2, name: "Juan", minAmount: 0 },
];

const orders: Order[] = [
  { id: 101, userId: 1, total: 50, status: "active" },
  { id: 102, userId: 1, total: 100, status: "active" },
  { id: 103, userId: 1, total: 200, status: "cancelled" },
  { id: 104, userId: 2, total: 75, status: "active" },
];

const result = attachChildrenWhere({
  parents: users,
  children: orders,
  parentKey: "id",
  childKey: "userId",
  as: "activeOrders",
  where: (order, user) => order.status === "active" && order.total > user.minAmount,
});

// Ana solo obtiene la orden 102 (activa y > 60)
// Juan obtiene la orden 104 (activa y > 0)
// Array<User & { activeOrders: Order[] }>
```

**Características:**

- El predicado `where` recibe `(child, parent)` — permite filtrar según datos del padre
- Se combina con indexación por key para máxima eficiencia
- Padres sin match obtienen array vacío `[]`

#### `attachAggregate(params)` - Valor Agregado

**🆕 Nuevo en v1.2.0**

En vez de adjuntar un array de hijos, computa un valor agregado. Útil para counts, sums, averages, min/max, o cualquier agregación personalizada.

```typescript
type User = { id: number; name: string };
type Order = { id: number; userId: number; total: number };

const result = attachAggregate({
  parents: users,
  children: orders,
  parentKey: "id",
  childKey: "userId",
  as: "orderTotal",
  aggregate: (orders) => orders.reduce((sum, o) => sum + o.total, 0),
});
// Array<User & { orderTotal: number }>
// [
//   { id: 1, name: "Ana", orderTotal: 150 },
//   { id: 2, name: "Juan", orderTotal: 75 }
// ]
```

**Más ejemplos de agregaciones:**

```typescript
// Contar hijos
attachAggregate({
  ...params,
  as: "orderCount",
  aggregate: (orders) => orders.length,
});
// Array<User & { orderCount: number }>

// Promedio
attachAggregate({
  ...params,
  as: "avgTotal",
  aggregate: (orders) => orders.length > 0
    ? orders.reduce((s, o) => s + o.total, 0) / orders.length
    : 0,
});

// Objeto resumen
attachAggregate({
  ...params,
  as: "summary",
  aggregate: (orders) => ({
    count: orders.length,
    total: orders.reduce((s, o) => s + o.total, 0),
    max: Math.max(0, ...orders.map((o) => o.total)),
  }),
});
// Array<User & { summary: { count: number; total: number; max: number } }>
```

## 🔑 Claves Compuestas (Composite Keys)

Cuando tus relaciones se definen por múltiples propiedades (ej: SKU + Origen), la librería ofrece **dos estrategias**:

### Estrategia 1: Estructura Anidada (Recomendada para 2-3 claves)

Crea objetos anidados similar a `groupByMany` - intuitivo y fácil de depurar.

```typescript
import { attachChildrenNested, attachChildNested } from "ts-array-joins";

type Product = { sku: string; origin: string; name: string };
type Inventory = { sku: string; origin: string; quantity: number };

const products: Product[] = [
  { sku: "SKU-A", origin: "origin1", name: "Widget A1" },
  { sku: "SKU-A", origin: "origin2", name: "Widget A2" },
  { sku: "SKU-B", origin: "origin1", name: "Gadget B1" },
];

const inventory: Inventory[] = [
  { sku: "SKU-A", origin: "origin1", quantity: 100 },
  { sku: "SKU-A", origin: "origin1", quantity: 50 },
  { sku: "SKU-A", origin: "origin2", quantity: 75 },
];

// One-to-many con claves compuestas anidadas
const result = attachChildrenNested({
  parents: products,
  children: inventory,
  parentKeys: ["sku", "origin"],
  childKeys: ["sku", "origin"],
  as: "inventoryRecords",
});

// Estructura interna:
// {
//   "SKU-A": {
//     "origin1": [inv1, inv2],
//     "origin2": [inv3]
//   },
//   "SKU-B": {
//     "origin1": []
//   }
// }

// Result: Array<Product & { inventoryRecords: Inventory[] }>
```

**One-to-one con claves anidadas:**

```typescript
type Price = { sku: string; origin: string; amount: number };

const prices: Price[] = [
  { sku: "SKU-A", origin: "origin1", amount: 99.99 },
  { sku: "SKU-A", origin: "origin2", amount: 89.99 },
];

const withPrices = attachChildNested({
  parents: products,
  children: prices,
  parentKeys: ["sku", "origin"],
  childKeys: ["sku", "origin"],
  as: "price",
});
// Array<Product & { price: Price | null }>
```

### Estrategia 2: Claves Serializadas (Recomendada para 4+ claves)

Usa claves compuestas serializadas para máxima eficiencia.

```typescript
import { attachChildrenComposite, attachChildComposite } from "ts-array-joins";

const result = attachChildrenComposite({
  parents: products,
  children: inventory,
  parentKeys: ["sku", "origin"],
  childKeys: ["sku", "origin"],
  as: "inventoryRecords",
});

// Estructura interna:
// {
//   "SKU-A||~~||origin1": [inv1, inv2],
//   "SKU-A||~~||origin2": [inv3]
// }

// Mismo resultado que la estrategia anidada
```

### Comparación de Estrategias

| Característica    | Anidada            | Serializada        |
| ----------------- | ------------------ | ------------------ |
| **Performance**   | O(n + m)           | O(n + m)           |
| **Memoria**       | Ligeramente más    | Ligeramente menos  |
| **Claves máx**    | 2-3 óptimo         | Cualquier cantidad |
| **Debugging**     | ✅ Intuitivo       | ⚠️ Menos claro     |
| **Similitud API** | Como `groupByMany` | Enfoque único      |

**Ambas producen resultados idénticos** - elige según tus preferencias:

- **Usa Anidada** cuando: 2-3 claves, la legibilidad importa, similar a `groupByMany`
- **Usa Serializada** cuando: 4+ claves, máxima performance, datasets muy grandes

### Ejemplo Real: Inventario Multi-Región

```typescript
type Product = {
  sku: string;
  region: string;
  supplier: string;
  name: string;
};

type Stock = {
  sku: string;
  region: string;
  supplier: string;
  quantity: number;
  warehouse: string;
};

type Price = {
  sku: string;
  region: string;
  supplier: string;
  amount: number;
  currency: string;
};

const products: Product[] = [...];
const stock: Stock[] = [...];
const prices: Price[] = [...];

// Componer múltiples joins con clave compuesta de 3 elementos
const enriched = attachChildNested({
  parents: attachChildrenNested({
    parents: products,
    children: stock,
    parentKeys: ['sku', 'region', 'supplier'],
    childKeys: ['sku', 'region', 'supplier'],
    as: 'stockRecords'
  }),
  children: prices,
  parentKeys: ['sku', 'region', 'supplier'],
  childKeys: ['sku', 'region', 'supplier'],
  as: 'pricing'
});

// Type: Array<Product & {
//   stockRecords: Stock[];
//   pricing: Price | null
// }>
```

## 🔀 Ordenamiento (sortBy)

**🆕 Nuevo en v1.2.0**

Utilidad de ordenamiento type-safe. Retorna una copia ordenada sin mutar el original.

```typescript
import { sortBy, comparatorBy } from "ts-array-joins";

type User = { id: number; name: string; age: number };

const users: User[] = [
  { id: 3, name: "Carlos", age: 30 },
  { id: 1, name: "Ana", age: 25 },
  { id: 2, name: "Bruno", age: 35 },
  { id: 4, name: "Ana", age: 20 },
];

// Ascendente por nombre
sortBy(users, "name");
// [Ana(25), Ana(20), Bruno, Carlos]

// Descendente con prefijo -
sortBy(users, "-age");
// [Bruno(35), Carlos(30), Ana(25), Ana(20)]

// Múltiples criterios: nombre asc, luego edad desc
sortBy(users, "name", "-age");
// [Ana(25), Ana(20), Bruno(35), Carlos(30)]

// Objeto con opciones explícitas
sortBy(users, { key: "name", order: "desc", caseInsensitive: true });

// Mezcla de string y objeto
sortBy(users, { key: "name", caseInsensitive: true }, "-age");
```

**Comparador para `.sort()` nativo:**

```typescript
// comparatorBy retorna una función (a, b) => number
users.sort(comparatorBy("name", "-age"));
users.sort(comparatorBy<User>({ key: "name", caseInsensitive: true }));
```

**Características:**

- **Type-safe**: Valida nombres de propiedad con `keyof T` en compilación
- **Inmutable**: `sortBy` retorna copia nueva, no muta el original
- **Múltiples criterios**: Soporta ordenamiento primario, secundario, etc.
- **Strings**: Usa `localeCompare` para comparación correcta de strings
- **Nulls**: Valores `null`/`undefined` siempre van al final
- **Case-insensitive**: Opción `caseInsensitive` para strings
- **Prefijo `-`**: Convención simple para orden descendente

## ⛓️ API Fluent (JoinBuilder)

**🆕 Nuevo en v1.2.0**

Encadena múltiples joins de forma legible usando el patrón builder. Cada método retorna un nuevo builder con el tipo acumulado.

```typescript
import { from } from "ts-array-joins";

type User = { id: number; name: string };
type Order = { id: number; userId: number; total: number };
type Address = { id: number; userId: number; city: string };

const result = from(users)
  .attachChildren({
    children: orders,
    parentKey: "id",
    childKey: "userId",
    as: "orders",
  })
  .attachChild({
    children: addresses,
    parentKey: "id",
    childKey: "userId",
    as: "address",
  })
  .attachAggregate({
    children: orders,
    parentKey: "id",
    childKey: "userId",
    as: "totalSpent",
    aggregate: (o) => o.reduce((s, x) => s + x.total, 0),
  })
  .build();

// Type: Array<User & { orders: Order[]; address: Address | null; totalSpent: number }>
```

**Métodos disponibles:**

| Método             | Descripción                          | Tipo del valor          |
| ------------------ | ------------------------------------ | ----------------------- |
| `attachChildren`   | Join one-to-many                     | `TChild[]`              |
| `attachChild`      | Join one-to-one                      | `TChild \| null`        |
| `attachAggregate`  | Valor agregado de hijos              | `TResult`               |
| `where`            | Filtra items con predicado           | mismo tipo              |
| `build`            | Ejecuta la cadena y retorna el array | `T[]`                   |

**Ejemplo con filtro:**

```typescript
const activeUsersWithOrders = from(users)
  .attachChildren({
    children: orders,
    parentKey: "id",
    childKey: "userId",
    as: "orders",
  })
  .where((user) => user.orders.length > 0) // Solo usuarios con órdenes
  .build();
```

## 🌳 Array to Tree

**🆕 Nuevo en v1.2.0**

Convierte un array plano con relaciones `id`/`parentId` en una estructura de árbol en O(n). Inspirado en `performant-array-to-tree` pero con tipado fuerte de TypeScript.

```typescript
import { arrayToTree } from "ts-array-joins";

type Employee = { id: number; managerId: number | null; name: string };

const employees: Employee[] = [
  { id: 1, managerId: null, name: "CEO" },
  { id: 2, managerId: 1, name: "CTO" },
  { id: 3, managerId: 1, name: "CFO" },
  { id: 4, managerId: 2, name: "Dev Lead" },
  { id: 5, managerId: 4, name: "Developer" },
];

const tree = arrayToTree({
  items: employees,
  idKey: "id",
  parentIdKey: "managerId",
});

// Type: TreeNode<Employee, "children">[]
// [
//   {
//     id: 1, managerId: null, name: "CEO",
//     children: [
//       {
//         id: 2, managerId: 1, name: "CTO",
//         children: [
//           {
//             id: 4, managerId: 2, name: "Dev Lead",
//             children: [
//               { id: 5, managerId: 4, name: "Developer", children: [] }
//             ]
//           }
//         ]
//       },
//       { id: 3, managerId: 1, name: "CFO", children: [] }
//     ]
//   }
// ]
```

**Opciones de configuración:**

```typescript
// Nombre personalizado para la propiedad de hijos
const tree = arrayToTree({
  items: employees,
  idKey: "id",
  parentIdKey: "managerId",
  childrenField: "subordinates" as const,
});
// tree[0].subordinates[0].subordinates... ← fully typed!

// IDs raíz personalizados (por defecto: null, undefined, "")
const tree2 = arrayToTree({
  items: departments,
  idKey: "id",
  parentIdKey: "parentDeptId",
  rootParentIds: [0, -1], // Tratar 0 y -1 como raíz
});

// Detección de huérfanos
const tree3 = arrayToTree({
  items: employees,
  idKey: "id",
  parentIdKey: "managerId",
  throwIfOrphans: true, // Lanza error si hay nodos sin padre válido
});
```

**Características:**

- **O(n)**: Una sola pasada para construir el árbol
- **Type-safe**: `TreeNode<T, ChildrenField>` preserva el tipo original + propiedad de hijos recursiva
- **Inmutable**: No muta el array original
- **Flexible**: Configurable `childrenField`, `rootParentIds`, y `throwIfOrphans`
- **Hojas**: Nodos sin hijos obtienen array vacío `[]`

## 🔄 Full Outer Join

**🆕 Nuevo en v1.4.0**

Retorna todos los items de ambos arrays, haciendo match donde sea posible. Items sin match aparecen con `null` en el otro lado (equivalente a SQL FULL OUTER JOIN).

```typescript
import { fullOuterJoin } from "ts-array-joins";

type User = { id: number; name: string };
type Order = { orderId: number; userId: number; total: number };

const users: User[] = [
  { id: 1, name: "Ana" },
  { id: 2, name: "Juan" },
  { id: 3, name: "Luis" },
];

const orders: Order[] = [
  { orderId: 101, userId: 1, total: 50 },
  { orderId: 102, userId: 99, total: 200 }, // usuario no existe
];

const result = fullOuterJoin({
  left: users,
  right: orders,
  leftKey: "id",
  rightKey: "userId",
});

// [
//   { left: { id: 1, name: "Ana" }, right: { orderId: 101, userId: 1, total: 50 } },
//   { left: { id: 2, name: "Juan" }, right: null },       // sin órdenes
//   { left: { id: 3, name: "Luis" }, right: null },       // sin órdenes
//   { left: null, right: { orderId: 102, userId: 99, ... } }, // orden huérfana
// ]
```

## ✖️ Cross Join (Producto Cartesiano)

**🆕 Nuevo en v1.4.0**

Combina cada item del array izquierdo con cada item del derecho.

```typescript
import { crossJoin, crossJoinMerge } from "ts-array-joins";

const sizes = [{ size: "S" }, { size: "M" }];
const colors = [{ color: "red" }, { color: "blue" }];

// crossJoin: retorna { left, right } pairs
const pairs = crossJoin(sizes, colors);
// [
//   { left: { size: "S" }, right: { color: "red" } },
//   { left: { size: "S" }, right: { color: "blue" } },
//   { left: { size: "M" }, right: { color: "red" } },
//   { left: { size: "M" }, right: { color: "blue" } },
// ]

// crossJoinMerge: fusiona en un solo objeto
const combos = crossJoinMerge(sizes, colors);
// [
//   { size: "S", color: "red" },
//   { size: "S", color: "blue" },
//   { size: "M", color: "red" },
//   { size: "M", color: "blue" },
// ]
```

## 🦥 Lazy Builder (Evaluación Diferida)

**🆕 Nuevo en v1.4.0**

Construye un pipeline de operaciones que se ejecutan solo al llamar `.run()`. Útil para componer múltiples transformaciones de forma legible.

```typescript
import { lazy } from "ts-array-joins";

type User = { id: number; name: string; active: boolean };
type Order = { orderId: number; userId: number; total: number };

const result = lazy(users)
  .filter((u) => u.active)
  .attachChildren({
    children: orders,
    parentKey: "id",
    childKey: "userId",
    as: "orders",
  })
  .filter((u) => u.orders.length > 0)
  .sortBy("name")
  .take(10)
  .run();
```

**Métodos disponibles:**

| Método           | Descripción                        |
| ---------------- | ---------------------------------- |
| `filter`         | Filtra items con predicado         |
| `map`            | Transforma cada item               |
| `sortBy`         | Ordena por propiedades             |
| `take(n)`        | Toma los primeros N items          |
| `skip(n)`        | Salta los primeros N items         |
| `attachChildren` | Join one-to-many diferido          |
| `run()`          | Ejecuta el pipeline y retorna `T[]`|

## 📦 Operaciones de Conjuntos

**🆕 Nuevo en v1.4.0**

Operaciones de conjuntos basadas en key con complejidad O(n + m).

```typescript
import { diff, intersect, except } from "ts-array-joins";

type User = { id: number; name: string };

const oldUsers: User[] = [
  { id: 1, name: "Ana" },
  { id: 2, name: "Juan" },
  { id: 3, name: "Luis" },
];

const newUsers: User[] = [
  { id: 2, name: "Juan" },
  { id: 3, name: "Luis" },
  { id: 4, name: "Maria" },
];

// Items en newUsers que no existen en oldUsers
const added = diff(newUsers, oldUsers, "id");
// [{ id: 4, name: "Maria" }]

// Items que existen en ambos arrays
const common = intersect(oldUsers, newUsers, "id");
// [{ id: 2, name: "Juan" }, { id: 3, name: "Luis" }]

// Alias de diff con semántica "excluir estos"
const removed = except(oldUsers, newUsers, "id");
// [{ id: 1, name: "Ana" }]
```

## 🔑 Utilidades de Array

**🆕 Nuevo en v1.4.0**

### `uniqueBy(items, key)` — Deduplicar

Elimina duplicados por key, manteniendo la primera ocurrencia.

```typescript
import { uniqueBy } from "ts-array-joins";

const users = [
  { id: 1, name: "Ana" },
  { id: 2, name: "Juan" },
  { id: 1, name: "Ana Duplicada" },
];

const unique = uniqueBy(users, "id");
// [{ id: 1, name: "Ana" }, { id: 2, name: "Juan" }]
```

### `keyBy(items, key)` — Crear lookup

Crea un `Record<key, item>` para lookups O(1).

```typescript
import { keyBy } from "ts-array-joins";

const usersById = keyBy(users, "id");
// { 1: { id: 1, name: "Ana" }, 2: { id: 2, name: "Juan" } }

const ana = usersById[1]; // acceso O(1)
```

### `treeToArray(tree, childrenField)` — Aplanar árbol

Inverso de `arrayToTree`. Convierte un árbol de vuelta a array plano (depth-first).

```typescript
import { treeToArray } from "ts-array-joins";

const flat = treeToArray(tree, "children");
// [{ id: 1, name: "CEO" }, { id: 2, name: "CTO" }, { id: 4, name: "Dev Lead" }, ...]
// La propiedad "children" se elimina de cada item
```

### `flatMapChildren(items, childrenKey)` — Desnormalizar

Convierte datos parent-children en filas planas (como un SQL JOIN denormalizado).

```typescript
import { flatMapChildren } from "ts-array-joins";

const usersWithOrders = [
  {
    id: 1,
    name: "Ana",
    orders: [
      { orderId: 101, total: 50 },
      { orderId: 102, total: 100 },
    ],
  },
  { id: 2, name: "Juan", orders: [{ orderId: 103, total: 75 }] },
];

const rows = flatMapChildren(usersWithOrders, "orders");
// [
//   { id: 1, name: "Ana", orderId: 101, total: 50 },
//   { id: 1, name: "Ana", orderId: 102, total: 100 },
//   { id: 2, name: "Juan", orderId: 103, total: 75 },
// ]
```

### `chunk(items, size)` — Dividir en grupos

Divide un array en chunks del tamaño especificado.

```typescript
import { chunk } from "ts-array-joins";

chunk([1, 2, 3, 4, 5], 2);
// [[1, 2], [3, 4], [5]]
```

### `partition(items, predicate)` — Dividir por condición

Divide un array en dos grupos: los que cumplen el predicado y los que no.

```typescript
import { partition } from "ts-array-joins";

const [active, inactive] = partition(users, (u) => u.active);
```

### `mapValues(record, transform)` — Transformar valores de Record

Transforma los valores de un record preservando las keys. Ideal para post-procesar resultados de `groupByKey`.

```typescript
import { mapValues, groupByKey } from "ts-array-joins";

const grouped = groupByKey(users, "role");
// { admin: User[], user: User[] }

const counts = mapValues(grouped, (users) => users.length);
// { admin: 3, user: 15 }

const names = mapValues(grouped, (users) => users.map((u) => u.name));
// { admin: ["Ana", "Bob"], user: ["Carol", ...] }
```

### `pick(items, keys)` / `omit(items, keys)` — Seleccionar propiedades

```typescript
import { pick, omit } from "ts-array-joins";

const users = [
  { id: 1, name: "Ana", email: "ana@test.com", password: "secret" },
  { id: 2, name: "Juan", email: "juan@test.com", password: "hidden" },
];

// Mantener solo las propiedades especificadas
const clean = pick(users, ["id", "name"]);
// [{ id: 1, name: "Ana" }, { id: 2, name: "Juan" }]

// Eliminar propiedades sensibles
const safe = omit(users, ["password"]);
// [{ id: 1, name: "Ana", email: "ana@test.com" }, ...]
```

## ⚡ IndexCache — Cache de Índices

**🆕 Nuevo en v1.4.0**

Cache para índices Map pre-construidos. Evita reconstruir el índice cuando se usa la misma combinación array + key múltiples veces.

```typescript
import { IndexCache } from "ts-array-joins";

const cache = new IndexCache();

// Primera llamada construye el índice, las siguientes lo reusan
const ordersByUserId = cache.indexMany(orders, "userId");
const ordersByUserId2 = cache.indexMany(orders, "userId"); // cache hit

// indexOne: lookup one-to-one
const userById = cache.indexOne(users, "id");
const ana = userById.get(1); // O(1)
```

**Características:**

- **WeakMap-based**: Los índices se liberan automáticamente cuando el array se deja de referenciar
- **indexMany**: Retorna `Map<key, T[]>` (one-to-many, como groupBy)
- **indexOne**: Retorna `Map<key, T>` (one-to-one, como keyBy)

## 🎨 Uso Avanzado

### Composición de Múltiples Joins

```typescript
type User = { id: number; name: string };
type Order = { id: number; userId: number; total: number };
type Address = { id: number; userId: number; city: string };

const users: User[] = [...];
const orders: Order[] = [...];
const addresses: Address[] = [...];

// Encadenar múltiples joins
const enrichedUsers = attachChild({
  parents: attachChildren({
    parents: users,
    children: orders,
    parentKey: 'id',
    childKey: 'userId',
    as: 'orders',
  }),
  children: addresses,
  parentKey: 'id',
  childKey: 'userId',
  as: 'address',
});

// Type: Array<User & { orders: Order[]; address: Address | null }>
```

### Usando con Funciones Pipe

```typescript
import { pipe } from "./utils"; // Tu utilidad pipe

const result = pipe(
  users,
  (u) =>
    attachChildren({
      parents: u,
      children: orders,
      parentKey: "id",
      childKey: "userId",
      as: "orders",
    }),
  (u) =>
    attachChild({
      parents: u,
      children: addresses,
      parentKey: "id",
      childKey: "userId",
      as: "address",
    })
);
```

### Ejemplo de API Real

```typescript
// Endpoint de API para obtener usuarios con sus datos relacionados
async function getUsersWithRelations() {
  const [users, orders, addresses] = await Promise.all([
    db.users.findMany(),
    db.orders.findMany(),
    db.addresses.findMany(),
  ]);

  return attachChild({
    parents: attachChildren({
      parents: users,
      children: orders,
      parentKey: "id",
      childKey: "userId",
      as: "orders",
    }),
    children: addresses,
    parentKey: "id",
    childKey: "userId",
    as: "primaryAddress",
  });
}
```

## 🧭 ¿Qué Función Usar?

### Guía Rápida de Selección

```typescript
// ✅ Usa attachChildren / attachChild
// Cuando: Relación directa parent → children (2 niveles)
const usersWithOrders = attachChildren({
  parents: users,
  children: orders,
  parentKey: "id",
  childKey: "userId",
  as: "orders",
});

// ✅ Usa attachChildrenWithFilter
// Cuando: Relación parent → catalog → filtered children (3 niveles)
// El array "middle" es compartido por todos los parents
const enrollmentsWithFees = attachChildrenWithFilter({
  parents: enrollments, // Inscripciones
  middle: periodFees, // Catálogo de cuotas (shared)
  children: payments, // Pagos filtrados por inscripción
  parentKey: "id",
  childParentKey: "enrollmentId",
  middleKey: "id",
  childKey: "feeId",
  middleAs: "fees",
  childAs: "payment",
  childCardinality: "one", // Cada cuota tiene max 1 pago
});

// ✅ Usa attachChildrenNested / attachChildComposite
// Cuando: Claves compuestas (múltiples propiedades)
const productsWithInventory = attachChildrenNested({
  parents: products,
  children: inventory,
  parentKeys: ["sku", "origin"],
  childKeys: ["sku", "origin"],
  as: "stock",
});
```

### Comparativa Detallada

| Función                    | Niveles | Cardinalidad | Filtro | Claves Compuestas | Descripción                  |
| -------------------------- | ------- | ------------ | ------ | ----------------- | ---------------------------- |
| `attachChildren`           | 2       | many         | ❌     | ❌                | LEFT JOIN one-to-many        |
| `attachChild`              | 2       | one          | ❌     | ❌                | LEFT JOIN one-to-one         |
| `innerJoin`                | 2       | many         | ❌     | ❌                | INNER JOIN (excluye sin match) |
| `attachChildrenWhere`      | 2       | many         | ✅     | ❌                | JOIN con predicado           |
| `attachAggregate`          | 2       | agregado     | ❌     | ❌                | Valor computado de hijos     |
| `attachChildrenWithFilter` | 3       | configurable | ✅     | ❌                | Patrón catálogo              |
| `attachChildrenNested`     | 2       | many         | ❌     | ✅                | Composite key (anidada)      |
| `attachChildNested`        | 2       | one          | ❌     | ✅                | Composite key (anidada)      |
| `attachChildrenComposite`  | 2       | many         | ❌     | ✅                | Composite key (serializada)  |
| `attachChildComposite`     | 2       | one          | ❌     | ✅                | Composite key (serializada)  |
| `arrayToTree`              | N       | tree         | ❌     | ❌                | Array plano → árbol O(n)     |
| `treeToArray`              | N       | flat         | ❌     | ❌                | Árbol → array plano          |
| `fullOuterJoin`            | 2       | paired       | ❌     | ❌                | FULL OUTER JOIN              |
| `crossJoin`                | 2       | n×m          | ❌     | ❌                | Producto cartesiano          |
| `from` / `JoinBuilder`     | 2       | any          | ✅     | ❌                | API fluent/chainable         |
| `lazy` / `LazyBuilder`     | 2       | deferred     | ✅     | ❌                | Pipeline diferido            |

### Casos de Uso Típicos

**📚 Educación/Cursos:**

```typescript
// Inscripciones → Cuotas del periodo (catálogo) → Pagos
attachChildrenWithFilter({
  parents: enrollments,
  middle: periodFees, // Todas las inscripciones ven las mismas cuotas
  children: payments, // Pero solo sus propios pagos
  childCardinality: "one", // Max 1 pago por cuota
});
```

**🛒 E-commerce:**

```typescript
// Usuarios → Productos (catálogo) → Compras del usuario
attachChildrenWithFilter({
  parents: users,
  middle: products, // Todos ven el mismo catálogo
  children: purchases, // Pero solo sus propias compras
  middleCardinality: "many",
});
```

**🏥 Salud:**

```typescript
// Pacientes → Tratamientos (catálogo) → Citas del paciente
attachChildrenWithFilter({
  parents: patients,
  middle: treatments, // Todos los tratamientos disponibles
  children: appointments, // Citas específicas del paciente
  childCardinality: "many",
});
```

**📦 Inventario Multi-región:**

```typescript
// Productos con clave compuesta [sku, region]
attachChildrenNested({
  parents: products,
  children: stock,
  parentKeys: ["sku", "region"],
  childKeys: ["sku", "region"],
});
```

## ⚡ Consideraciones de Performance

Todas las operaciones de join usan `Map` para lookups O(1):

- **Complejidad Temporal**: O(n + m) donde n = padres, m = hijos
- **Complejidad Espacial**: O(m) para el índice + O(n) para resultados
- **Mejores Prácticas**:
  - Pre-filtrar arrays cuando sea posible
  - Usar `attachChild` en lugar de `attachChildren` para relaciones one-to-one
  - Considerar usar `groupByTransform` para agregar datos durante la agrupación

## 🔧 Configuración TypeScript

Esta librería requiere TypeScript 5.0+ con modo estricto:

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

## 📊 Comparación con Alternativas

### vs. lodash/groupBy

- ✅ Tipado más fuerte
- ✅ Zero dependencies
- ✅ Menor tamaño de bundle
- ✅ Operaciones de join incluidas

### vs. Loops FOR manuales

- ✅ Más legible
- ✅ Menos propenso a errores
- ✅ Mejor performance (uso optimizado de Map)
- ✅ Composable

### vs. ORMs SQL

- ✅ Funciona con cualquier dato de array
- ✅ No requiere base de datos
- ✅ Type-safe en tiempo de compilación
- ❌ No optimiza consultas de base de datos

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor lee nuestra Guía de Contribución para detalles.

## 📄 Licencia

MIT © Fernando Barrón

## 🔗 Enlaces

- 📖 [Documentación](https://github.com/FernandoBarSan/ts-array-joins)
- 🐛 [Issue Tracker](https://github.com/FernandoBarSan/ts-array-joins/issues)
- 💬 [Discussions](https://github.com/FernandoBarSan/ts-array-joins/discussions)
