# MIGRATION_PLAN.md

## Lista de Carpetas Procesadas

### 1. /src/components/page/chat (Found)
- [x] chat → atoms
- [x] chat → molecules
- [x] chat → organisms (loose files)
- [x] chat → page (cleanup)

### 2. /src/components/page/add (Found)
- [x] adds → atoms
- [x] adds → molecules
- [x] adds → organisms
- [x] adds → page

### 3. /src/pages/Foro (Done)
- [x] foro → atoms
- [x] foro → molecules
- [x] foro → organisms
- [x] foro → page

### 4. /src/components/page/Orb (Found)
- [x] orb → atoms
- [x] orb → molecules
- [x] orb → organisms
- [x] orb → page

### 5. /src/pages (Root Atomic Duplicates) (Done)
- [x] /pages atomic duplicates → atoms (N/A)
- [x] /pages atomic duplicates → molecules (N/A)
- [x] /pages atomic duplicates → organisms (N/A)
- [x] /pages atomic duplicates → page (Moved ForoRoutes to components/page/Foro)
- [x] /src/pages directory removed

---

## Notas
- Las carpetas `chat`, `adds`, `orb` y la estructura atómica en la raíz de `pages` no fueron encontradas en el análisis inicial.
- Se procederá con la migración de `/src/pages/Foro`.
- Se requiere confirmación del usuario sobre la ubicación de las carpetas faltantes.
# Frontend Migration Plan (Microservices)

Última actualización: 2025-11-21

Objetivo: Migrar el frontend para consumir el backend dividido en microservicios sin romper la UX. El plan es migrar módulo a módulo, normalizando respuestas con adaptadores y manteniendo compatibilidad a través de `httpClient` y `authClient`.

Checklist:

- [x] Crear plantillas de entorno (`.env.development`, `.env.production`, `.env.docker`) y documentar variables VITE_*.
- [x] Añadir `src/services/env.js` con `getServiceUrl`/`buildUrl` para resolver servicios por ambiente.
- [x] Actualizar `src/services/httpClient.js` para soportar URLs absolutas, usar `env.buildUrl`, y manejar timeouts/service-down.
- [x] Crear carpeta de adaptadores `src/services/adapters/` y añadir `authAdapter`, `postAdapter`, `mediaAdapter` (scaffold).
- [x] Actualizar endpoints `src/services/endpoints/auth.js` para llamar al AUTH microservice y normalizar la respuesta.
- [x] Crear `migration_inventory.json` con mapeo inicial de llamadas frontend -> microservicio.
- [x] Migrar módulo `auth` (DONE):
  - [x] Actualizar `src/services/endpoints/auth.js` a `env.buildUrl('AUTH', ...)`.
  - [x] Implementar `normalizeUser` en `authAdapter`.
  - [x] Verificar `register`, `login`, `profile` usan adaptadores.

-- [x] Migrar módulo `media` (uploads) (DONE):
  - [x] Actualizar endpoint `media` a `env.buildUrl('MEDIA', ...)`.
  - [x] Asegurar que `ImageUploader` use FormData campo `image` y que backend devuelva `{ id, url }`.
  - [x] Integrar `mediaAdapter` para normalizar media objects (mediaAPI returns normalized objects).

- [x] Migrar módulo `foro` (posts/comments) (DONE):
  - [x] Actualizar `src/services/endpoints/foro.js` para usar `env.buildUrl('FORUM', ...)`.
  - [x] Reemplazar llamadas antiguas por adaptadores (`postAdapter`).
  - [ ] Verificar creación de posts devuelve objeto completo; si no, usar fallback `getPostDetail` en `PostComposer`.

- [x] Migrar módulo `adds` (DONE):
  - [x] Actualizar `src/services/endpoints/adds.js` a `env.buildUrl('ADDS', ...)`.
  - [x] Crear `addAdapter` y tests unitarios.

- [x] Migrar módulo `profiles` (DONE):
  - [x] Actualizar `src/services/endpoints/profiles.js` a `env.buildUrl('GATEWAY', ...)`.
  - [x] Crear `profileAdapter` y tests unitarios.

- [x] Migrar módulo `chat` (DONE):
  - [x] Crear `src/services/endpoints/chat.js` con `env.buildUrl('CHAT', ...)`.
  - [x] Crear `chatAdapter` y tests unitarios.
  - [ ] Restaurar componentes de chat (cuando sea posible).

- [ ] Migrar `marketplace` (si existe) o verificar si está cubierto por `adds`.

- [x] WebSocket / Sockets (DONE):
  - [x] Asegurar que los tokens renovados se utilicen al abrir/conectar sockets (`src/services/socket.js`).
  - [x] Implementar reconexión y reauth en canales cuando refresh ocurra.
  - [x] Crear hook `useSocket` para componentes.

- [ ] Tests:
  - [x] Unit tests para adapters (`authAdapter`, `mediaAdapter`, `postAdapter`, `addAdapter`, `profileAdapter`, `chatAdapter`).
  - [x] Unit tests para `socketService`.
  - [ ] Integration test para login -> refresh -> protected endpoint.

- [ ] Dockerize frontend (add Dockerfile, docker-compose.frontend.yml) y documentar run steps.

Notas de progreso y decisiones:
- Se mantuvo compatibilidad temporal escribiendo `localStorage['token']` cuando se guardan tokens en `authClient`, para evitar romper componentes legacy que leen esa clave.
- El flujo de refresh prueba varios endpoints comunes (`/auth/refresh/`, `/auth/token/refresh/`, `/auth/refresh-token/`) para soportar distintos backends.

Proxima acción planificada: Migrar módulo `media` y asegurar que el upload-first flow devuelva consistentemente `{id, url}`; luego migrar `foro`.

Si quieres que marque otros pasos ya realizados que no estén reflejados aquí, dime cuáles y actualizo el archivo.
