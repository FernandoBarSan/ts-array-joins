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
import { groupByKey, attachChildren, attachChildrenWithFilter } from "ts-array-joins";

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
  { id: 2, name: "Tuition", amount: 500 }
];
const payments = [
  { id: 1, enrollmentId: 1, feeId: 1, paid: 100 }
];

const result = attachChildrenWithFilter({
  parents: enrollments,
  middle: periodFees,      // Shared catalog
  children: payments,       // Filtered by enrollment
  parentKey: "id",
  childParentKey: "enrollmentId",
  middleKey: "id",
  childKey: "feeId",
  middleAs: "fees",
  childAs: "payment",
  childCardinality: "one"  // Each fee has at most one payment
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
type Payment = { id: number; enrollmentId: number; feeId: number; paid: number };

const enrollments: Enrollment[] = [
  { id: 1, courseName: "TypeScript Basics" }
];

const periodFees: PeriodFee[] = [
  { id: 1, name: "Registration", amount: 100 },
  { id: 2, name: "Tuition", amount: 500 },
  { id: 3, name: "Materials", amount: 50 }
];

const payments: Payment[] = [
  { id: 1, enrollmentId: 1, feeId: 1, paid: 100 },
  { id: 2, enrollmentId: 1, feeId: 2, paid: 500 }
  // Note: No payment for Materials (feeId: 3)
];

const result = attachChildrenWithFilter({
  parents: enrollments,
  middle: periodFees,        // Shared catalog
  children: payments,         // Filtered by enrollment
  parentKey: "id",
  childParentKey: "enrollmentId",
  middleKey: "id",
  childKey: "feeId",
  middleAs: "fees",
  childAs: "payments"
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
  childAs: "payments"
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
  childAs: "payment",        // ← Singular
  childCardinality: "one"    // ← Returns single object or undefined
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
  middleAs: "category",      // ← Singular
  childAs: "items",
  middleCardinality: "one"   // ← Returns single object or undefined
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
  middleAs: "shipping",       // ← Singular
  childAs: "tracking",        // ← Singular
  middleCardinality: "one",
  childCardinality: "one"
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
  as: "orders"
});

// ✅ Usa attachChildrenWithFilter
// Cuando: Relación parent → catalog → filtered children (3 niveles)
// El array "middle" es compartido por todos los parents
const enrollmentsWithFees = attachChildrenWithFilter({
  parents: enrollments,       // Inscripciones
  middle: periodFees,         // Catálogo de cuotas (shared)
  children: payments,         // Pagos filtrados por inscripción
  parentKey: "id",
  childParentKey: "enrollmentId",
  middleKey: "id",
  childKey: "feeId",
  middleAs: "fees",
  childAs: "payment",
  childCardinality: "one"     // Cada cuota tiene max 1 pago
});

// ✅ Usa attachChildrenNested / attachChildComposite
// Cuando: Claves compuestas (múltiples propiedades)
const productsWithInventory = attachChildrenNested({
  parents: products,
  children: inventory,
  parentKeys: ["sku", "origin"],
  childKeys: ["sku", "origin"],
  as: "stock"
});
```

### Comparativa Detallada

| Función | Niveles | Catálogo Compartido | Cardinalidad | Claves Compuestas |
|---------|---------|---------------------|--------------|-------------------|
| `attachChildren` | 2 | ❌ | many | ❌ |
| `attachChild` | 2 | ❌ | one | ❌ |
| `attachChildrenWithFilter` | 3 | ✅ | configurable | ❌ |
| `attachChildrenNested` | 2 | ❌ | many | ✅ |
| `attachChildNested` | 2 | ❌ | one | ✅ |
| `attachChildrenComposite` | 2 | ❌ | many | ✅ |
| `attachChildComposite` | 2 | ❌ | one | ✅ |

### Casos de Uso Típicos

**📚 Educación/Cursos:**
```typescript
// Inscripciones → Cuotas del periodo (catálogo) → Pagos
attachChildrenWithFilter({
  parents: enrollments,
  middle: periodFees,      // Todas las inscripciones ven las mismas cuotas
  children: payments,       // Pero solo sus propios pagos
  childCardinality: "one"  // Max 1 pago por cuota
});
```

**🛒 E-commerce:**
```typescript
// Usuarios → Productos (catálogo) → Compras del usuario
attachChildrenWithFilter({
  parents: users,
  middle: products,        // Todos ven el mismo catálogo
  children: purchases,      // Pero solo sus propias compras
  middleCardinality: "many"
});
```

**🏥 Salud:**
```typescript
// Pacientes → Tratamientos (catálogo) → Citas del paciente
attachChildrenWithFilter({
  parents: patients,
  middle: treatments,      // Todos los tratamientos disponibles
  children: appointments,   // Citas específicas del paciente
  childCardinality: "many"
});
```

**📦 Inventario Multi-región:**
```typescript
// Productos con clave compuesta [sku, region]
attachChildrenNested({
  parents: products,
  children: stock,
  parentKeys: ["sku", "region"],
  childKeys: ["sku", "region"]
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
