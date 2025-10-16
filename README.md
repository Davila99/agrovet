# React + Vite — Guía de instalación

Esta guía explica paso a paso cómo preparar el entorno, instalar dependencias y ejecutar la aplicación React creada con Vite. Incluye comandos, configuración básica y soluciones a problemas comunes.

## Requisitos previos

- Node.js v16 o superior (recomendado LTS).
- npm, yarn o pnpm (uno de ellos).
- Git (para clonar el repositorio).
- Editor (VS Code u otro).

## Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd <NOMBRE_DEL_REPOSITORIO>
```

## Instalar dependencias

Usa el gestor que prefieras:

npm:

```bash
npm install
```

yarn:

```bash
yarn install
```

pnpm:

```bash
pnpm install
```

## Variables de entorno

Vite expone variables que deben usar el prefijo `VITE_`. Crea archivos `.env` según el entorno:

.env (ejemplo)

```
VITE_API_URL=https://api.ejemplo.com
VITE_APP_NAME=MiApp
```

Para desarrollo, usa `.env.development`. No subir secretos al repositorio.

## Scripts útiles

- Iniciar en modo desarrollo (con HMR):
  - npm: `npm run dev`
  - yarn: `yarn dev`
  - pnpm: `pnpm dev`
- Construir para producción:
  - `npm run build`
- Previsualizar la build localmente:
  - `npm run preview`
- Lint / formateo (si están configurados):
  - `npm run lint`
  - `npm run format`
- Ejecutar tests:
  - `npm run test`

(Consulta `package.json` para ver los nombres exactos de los scripts del proyecto.)

## Configuración de Vite y plugins React

En `vite.config.*` se definen los plugins. Opciones comunes:

- `@vitejs/plugin-react` (Babel)
- `@vitejs/plugin-react-swc` (SWC, más rápido)

Ejemplo mínimo de configuración (TypeScript/JS):

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
```

Cambia el plugin instalando el paquete correspondiente y actualizando `vite.config`.

## TypeScript y ESLint (opcional pero recomendado)

- Para añadir TypeScript:
  ```bash
  npm install --save-dev typescript @types/react @types/react-dom
  npx tsc --init
  ```
- Para ESLint:
  `bash
    npm install --save-dev eslint eslint-plugin-react @typescript-eslint/parser @typescript-eslint/eslint-plugin
    `
  Configura `.eslintrc.*` y añade reglas de linting. Usar `typescript-eslint` permite reglas con conocimiento de tipos si se usa `parserOptions.project`.

## Desarrollo local

- HMR (Hot Module Replacement) activo por defecto en `npm run dev`.
- Puerto por defecto: 5173. Cambiar con `--port` o en `vite.config`.
- Acceder: `http://localhost:5173`

## Build y despliegue

- Ejecuta `npm run build`. La salida se genera en `dist/`.
- Verificar build local:
  ```bash
  npm run preview
  ```
- Subir contenido de `dist/` a tu proveedor (Netlify, Vercel, surge, GitHub Pages, S3, etc.). Revisa la configuración específica del host para rutas base (`base` en `vite.config`).

## Solución de problemas comunes

- “Port already in use”: cambiar puerto o cerrar proceso que lo ocupa.
- Error de versión de Node: usar la versión recomendada (nvm o nvm-windows para gestionar versiones).
- Dependencias rotas: eliminar `node_modules` y `package-lock.json`/`yarn.lock`/`pnpm-lock.yaml`, luego reinstalar.
- Cache de Vite: ejecutar con `--force` o limpiar `node_modules/.vite`.

## Buenas prácticas

- No commitear `.env` con secretos.
- Añadir script de predeploy que haga build y pruebas.
- Mantener dependencias actualizadas y revisar alertas de seguridad.

## Contribuir

- Crear branch descriptivo: `feature/nombre` o `fix/descripcion`.
- Abrir PR con descripción, pasos para reproducir y screenshots si aplica.
- Añadir tests o actualizar documentación si corresponde.

## Licencia

Revisar archivo `LICENSE` del repositorio para detalles legales.

Si necesitas que adapte esta guía al flujo exacto del proyecto (scripts concretos, variables env, o configuración de CI/CD), proporciona el `package.json` y `vite.config` y lo actualizo.
