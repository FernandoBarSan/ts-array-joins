# ts-array-joins

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Una librería TypeScript moderna y fuertemente tipada para agrupar arrays y realizar joins tipo SQL de manera declarativa y eficiente.

## 🎯 Características

- 🔒 **Type-Safe**: Soporte completo de TypeScript con tipado estricto
- 🎯 **Zero Dependencies**: Sin dependencias externas en runtime
- ⚡ **Performance**: Complejidad O(n + m) para joins
- 🔧 **Inmutable**: Nunca muta los datos de entrada
- 📦 **Tree-Shakeable**: Soporte ESM y CJS
- 🎨 **Composable**: Encadena múltiples operaciones fácilmente
- 🔑 **Composite Keys**: Joins con claves compuestas (múltiples propiedades)

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
import { groupByKey, attachChildren } from "ts-array-joins";

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
