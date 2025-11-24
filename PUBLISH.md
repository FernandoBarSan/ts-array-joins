# 📦 Guía de Publicación en npm - ts-array-joins

## ✅ Pre-requisitos Completados

- ✅ Proyecto compilado correctamente
- ✅ Tests pasando (10/10)
- ✅ package.json configurado con:
  - ✅ Autor y repositorio
  - ✅ Licencia MIT
  - ✅ Keywords para búsqueda
  - ✅ Script `prepublishOnly` para validación

## 🔐 Paso 1: Autenticación en npm

Si no tienes cuenta en npm, créala en: https://www.npmjs.com/signup

### Opción A: Iniciar sesión (si ya tienes cuenta)

```bash
npm login
```

Te pedirá:

- **Username**: Tu usuario de npm
- **Password**: Tu contraseña
- **Email**: Tu email (público)
- **OTP**: Código de autenticación de dos factores (si lo tienes habilitado)

### Opción B: Crear cuenta y autenticar

```bash
npm adduser
```

Sigue el mismo proceso de arriba.

### Verificar autenticación

```bash
npm whoami
```

Debería mostrar tu usuario de npm.

## 📋 Paso 2: Verificar que el nombre esté disponible

Antes de publicar, verifica que el nombre `ts-array-joins` esté disponible:

```bash
npm search ts-array-joins
```

Si aparecen resultados, el nombre ya está tomado y necesitarás cambiarlo.

### Si necesitas cambiar el nombre:

Edita `package.json` y cambia el campo `name`:

```json
{
  "name": "@tu-usuario/ts-array-joins",
  // o
  "name": "ts-array-joins-v2"
  // ...
}
```

**Nota:** Si usas scope (`@tu-usuario/`), necesitarás publicar como público:

```bash
npm publish --access public
```

## 🔍 Paso 3: Verificar contenido del paquete

Verifica qué archivos se incluirán en el paquete:

```bash
npm pack --dry-run
```

Esto te mostrará:

- Tamaño total del paquete
- Lista de archivos que se incluirán
- Advertencias si hay algo mal configurado

Debería incluir principalmente:

- `package.json`
- `README.md`
- `dist/` (archivos compilados)

**NO** debería incluir:

- `node_modules/`
- `src/` (código fuente)
- `tests/`
- Archivos de configuración

## ✅ Paso 4: Commit de los cambios

Antes de publicar, haz commit de los cambios en package.json:

```bash
git add package.json
git commit -m "chore: prepare package.json for npm publication

- Add author information
- Add repository URLs
- Add prepublishOnly script"
git push
```

## 🚀 Paso 5: Publicar en npm

### Publicación normal:

```bash
npm publish
```

### Si usas scope (@usuario/):

```bash
npm publish --access public
```

El script `prepublishOnly` automáticamente:

1. Ejecutará `npm run build`
2. Ejecutará `npm test`
3. Si todo pasa, publicará el paquete

## 🏷️ Paso 6: Crear tag de versión

Después de publicar exitosamente:

```bash
git tag v1.0.0
git push origin v1.0.0
```

## ✅ Paso 7: Verificar la publicación

1. **Busca tu paquete en npm:**

   ```bash
   npm view ts-array-joins
   ```

2. **Visita la página en npm:**
   https://www.npmjs.com/package/ts-array-joins

3. **Prueba la instalación en otro proyecto:**
   ```bash
   npm install ts-array-joins
   ```

## 📊 Información del Paquete

**Nombre:** ts-array-joins  
**Versión inicial:** 1.0.0  
**Tamaño estimado:** ~30 KB  
**Licencia:** MIT  
**Node:** >= 20.0.0

## 🔄 Actualizaciones Futuras

Para publicar nuevas versiones:

### 1. Actualizar versión

```bash
# Patch (1.0.0 -> 1.0.1) - Bugfixes
npm version patch

# Minor (1.0.0 -> 1.1.0) - Nuevas features (sin breaking changes)
npm version minor

# Major (1.0.0 -> 2.0.0) - Breaking changes
npm version major
```

Esto automáticamente:

- Actualiza `package.json`
- Crea un commit
- Crea un tag de git

### 2. Publicar

```bash
npm publish
git push
git push --tags
```

## ⚠️ Solución de Problemas

### Error: Package name already exists

El nombre ya está tomado. Opciones:

1. Cambia el nombre en `package.json`
2. Usa un scope: `@tu-usuario/ts-array-joins`

### Error: Need to authenticate

```bash
npm logout
npm login
```

### Error: No permission to publish

Si el paquete ya existe y no eres el owner:

1. Cambia el nombre
2. O contacta al owner actual

### Error: Package.json missing required fields

Verifica que tengas:

- `name`
- `version`
- `description`
- `main` o `exports`

### Build o tests fallan

El script `prepublishOnly` detendrá la publicación. Revisa:

```bash
npm run build
npm test
```

## 📝 Checklist Final

Antes de publicar, verifica:

- [ ] ✅ Estás autenticado en npm (`npm whoami`)
- [ ] ✅ El nombre está disponible (`npm search ts-array-joins`)
- [ ] ✅ Build compiló exitosamente (`npm run build`)
- [ ] ✅ Tests pasando (`npm test`)
- [ ] ✅ `package.json` tiene toda la información
- [ ] ✅ README.md es claro y completo
- [ ] ✅ Licencia definida (MIT)
- [ ] ✅ Cambios commiteados en git
- [ ] ✅ Versión correcta (1.0.0 para primera publicación)

## 🎉 Después de Publicar

1. **Comparte tu paquete:**

   - Twitter/X
   - Reddit (r/typescript, r/javascript)
   - Dev.to
   - LinkedIn

2. **Añade badges al README:**

   ```markdown
   ![npm version](https://badge.fury.io/js/ts-array-joins.svg)
   ![npm downloads](https://img.shields.io/npm/dm/ts-array-joins.svg)
   ![license](https://img.shields.io/npm/l/ts-array-joins.svg)
   ```

3. **Monitorea:**
   - Descargas en npm
   - Issues en GitHub
   - Pull requests

## 🔗 Enlaces Útiles

- **npm package:** https://www.npmjs.com/package/ts-array-joins (después de publicar)
- **GitHub repo:** https://github.com/FernandoBarSan/ts-array-joins
- **npm docs:** https://docs.npmjs.com/cli/v10/commands/npm-publish
- **Semantic Versioning:** https://semver.org/

---

## 🚀 Comando Rápido (una vez autenticado)

```bash
# Verificar autenticación
npm whoami

# Verificar contenido
npm pack --dry-run

# Publicar
npm publish

# Crear tag
git tag v1.0.0
git push origin v1.0.0
```

**¡Buena suerte con tu publicación!** 🎉
