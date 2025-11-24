# Instrucciones de Instalación y Uso - ts-array-joins

## 🚀 Instalación del Proyecto

### 1. Instalar Dependencias

Primero, instala todas las dependencias de desarrollo:

```bash
npm install
```

o con yarn:

```bash
yarn install
```

o con pnpm:

```bash
pnpm install
```

### 2. Build de la Librería

Compila el código TypeScript a JavaScript (ESM y CJS):

```bash
npm run build
```

Esto generará los archivos en la carpeta `dist/`:

- `dist/index.js` - Módulo ESM
- `dist/index.cjs` - Módulo CommonJS
- `dist/index.d.ts` - Declaraciones TypeScript

### 3. Ejecutar Tests

Ejecuta la suite de tests con Vitest:

```bash
npm test
```

Para ejecutar tests en modo watch:

```bash
npm run test:watch
```

### 4. Verificar Tipos

Verifica que no haya errores de tipos:

```bash
npm run typecheck
```

## 📦 Uso de la Librería

### En un Proyecto Node.js/TypeScript

#### 1. Instalación Local (para desarrollo)

Si estás desarrollando localmente y quieres usar esta librería en otro proyecto:

```bash
# En el proyecto ts-array-joins
npm link

# En tu otro proyecto
npm link ts-array-joins
```

#### 2. Importación ESM (Recomendado)

```typescript
import {
  groupByKey,
  attachChildren,
  attachChildrenNested,
} from "ts-array-joins";

const users = [
  { id: 1, role: "admin", name: "Ana" },
  { id: 2, role: "user", name: "Juan" },
];

const grouped = groupByKey(users, "role");
console.log(grouped);
```

#### 3. Importación CommonJS

```javascript
const { groupByKey, attachChildren } = require("ts-array-joins");

const grouped = groupByKey(users, "role");
```

### Ejemplos Rápidos

#### Agrupar por Propiedad

```typescript
import { groupByKey } from "ts-array-joins";

const products = [
  { id: 1, category: "electronics", name: "Phone" },
  { id: 2, category: "books", name: "Novel" },
  { id: 3, category: "electronics", name: "Laptop" },
];

const byCategory = groupByKey(products, "category");
/*
{
  electronics: [
    { id: 1, category: 'electronics', name: 'Phone' },
    { id: 3, category: 'electronics', name: 'Laptop' }
  ],
  books: [
    { id: 2, category: 'books', name: 'Novel' }
  ]
}
*/
```

#### Join One-to-Many

```typescript
import { attachChildren } from "ts-array-joins";

type User = { id: number; name: string };
type Order = { id: number; userId: number; total: number };

const users: User[] = [
  { id: 1, name: "Ana" },
  { id: 2, name: "Juan" },
];

const orders: Order[] = [
  { id: 101, userId: 1, total: 50 },
  { id: 102, userId: 1, total: 100 },
  { id: 103, userId: 2, total: 75 },
];

const usersWithOrders = attachChildren({
  parents: users,
  children: orders,
  parentKey: "id",
  childKey: "userId",
  as: "orders",
});

console.log(usersWithOrders);
/*
[
  { id: 1, name: 'Ana', orders: [
      { id: 101, userId: 1, total: 50 },
      { id: 102, userId: 1, total: 100 }
    ]
  },
  { id: 2, name: 'Juan', orders: [
      { id: 103, userId: 2, total: 75 }
    ]
  }
]
*/
```

#### Join con Claves Compuestas

```typescript
import { attachChildrenNested } from "ts-array-joins";

type Product = { sku: string; origin: string; name: string };
type Inventory = { sku: string; origin: string; quantity: number };

const products: Product[] = [
  { sku: "SKU-A", origin: "origin1", name: "Widget A1" },
  { sku: "SKU-A", origin: "origin2", name: "Widget A2" },
];

const inventory: Inventory[] = [
  { sku: "SKU-A", origin: "origin1", quantity: 100 },
  { sku: "SKU-A", origin: "origin2", quantity: 75 },
];

const result = attachChildrenNested({
  parents: products,
  children: inventory,
  parentKeys: ["sku", "origin"],
  childKeys: ["sku", "origin"],
  as: "stock",
});

console.log(result);
/*
[
  { sku: 'SKU-A', origin: 'origin1', name: 'Widget A1', stock: [
      { sku: 'SKU-A', origin: 'origin1', quantity: 100 }
    ]
  },
  { sku: 'SKU-A', origin: 'origin2', name: 'Widget A2', stock: [
      { sku: 'SKU-A', origin: 'origin2', quantity: 75 }
    ]
  }
]
*/
```

## 🔧 Configuración en tu Proyecto

Para usar esta librería en tu proyecto TypeScript, asegúrate de tener:

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

## 🧪 Testing

La librería incluye tests completos. Para añadir más tests:

1. Crea un archivo en `tests/` con extensión `.test.ts`
2. Importa las funciones desde `../src/`
3. Usa las funciones de Vitest: `describe`, `it`, `expect`

Ejemplo:

```typescript
import { describe, it, expect } from "vitest";
import { groupBy } from "../src/groupBy.js";

describe("groupBy", () => {
  it("should group items", () => {
    const items = [
      { id: 1, type: "A" },
      { id: 2, type: "B" },
      { id: 3, type: "A" },
    ];

    const result = groupBy(items, (item) => item.type);

    expect(result.A).toHaveLength(2);
    expect(result.B).toHaveLength(1);
  });
});
```

## 📚 Recursos Adicionales

- Consulta el `README.md` para documentación completa de la API
- Revisa los tests en `tests/` para más ejemplos de uso
- Los archivos de código fuente en `src/` tienen JSDoc completos

## 🐛 Troubleshooting

### Error: "Cannot find module 'ts-array-joins'"

Asegúrate de haber ejecutado `npm run build` antes de usar la librería.

### Errores de tipo TypeScript

Verifica que tu `tsconfig.json` tenga las opciones correctas (ver arriba).

### Tests fallan

Asegúrate de tener todas las dependencias instaladas:

```bash
npm install
```

## 📝 Scripts Disponibles

- `npm run build` - Compila la librería
- `npm test` - Ejecuta todos los tests
- `npm run test:watch` - Tests en modo watch
- `npm run typecheck` - Verifica tipos sin compilar
- `npm run lint` - Verifica tipos y ejecuta tests

## 🎯 Próximos Pasos

1. Explora los ejemplos en el README
2. Revisa los tests para ver más casos de uso
3. Prueba la librería con tus propios datos
4. Consulta la documentación completa de cada función en el código fuente

¡Disfruta usando ts-array-joins! 🚀
