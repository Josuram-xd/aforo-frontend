# TASKS — aforo-frontend

Dashboard en React + TypeScript (Amplify) que muestra el aforo, el estado del curso y el historial de eventos.

## Cómo usar este archivo

- Cada subtarea es **un commit**. Formato: `tipo(alcance): descripción [x.y]`
  Ejemplo: `git commit -m "feat(ui): add occupancy card [5.2]"`
- En ese mismo commit cambia `[ ]` por `[x]` en este archivo.
- Las subtareas marcadas **(sin commit)** son verificaciones manuales: márcalas en el siguiente commit que hagas.
- Tipos: `feat`, `fix`, `test`, `docs`, `chore`, `perf`, `refactor`.
- **Prioridad 1** = sin esto no hay piloto. **Prioridad 2** = importante para que el piloto salga bien. **Prioridad 3** = extra si sobra tiempo.
- `> Depende de:` indica que antes tienes que avanzar tareas de otro repo.

## Orden global entre los 4 repos

| Fase | aforo-db | aforo-backend | aforo-vision | aforo-frontend |
|---|---|---|---|---|
| A — Arranque (en paralelo) | 1-3 | 1-2 | 1-3 | 1-2 |
| B — Núcleo | 4 | 3-7 | 4-6 | 3-5 (con datos mock) |
| C — Integración | — | — | 7 | 6 |
| D — Ensayo y ajustes | 5 | 8-9, 11 (login) | 8-11 | 7-8, 11 (login) |
| E — Extras | 6 | 10 | 12-13 | 9-10 |

**Hito fin de septiembre:** fase A completa → aquí, la página "hola mundo" publicada en Amplify (task 2).

---

## Prioridad 1 — Crítico

### Task 1 — Inicializar el proyecto
- [x] **1.1** `chore: init vite react typescript project` — Vite 8 + React 19 + TypeScript fijado en `~6.0` (no 7.x mientras `typescript-eslint` no lo soporte).
- [x] **1.2** `chore: add eslint, prettier and strict tsconfig` — Reglas básicas y `"strict": true`.
- [x] **1.3** `docs: add PRD, DESIGN_SYSTEM, ARCHITECTURE and AGENTS` — Subir los documentos a la raíz.

### Task 2 — "Hola mundo" en Amplify **[HITO SEPT]**
- [x] **2.1** `feat(ui): add placeholder home page` — Página con el título "Aforo — Piloto" y el fondo del Design System.
- [x] **2.2** `chore: add amplify build config` — `amplify.yml` con `npm ci` y `npm run build` (salida `dist/`).
- [x] **2.3** (sin commit) Conectar el repo en la consola de Amplify y abrir la URL pública.

### Task 3 — Base visual
- [x] **3.1** `feat(styles): add design tokens as css variables` — `src/styles/tokens.css` con los colores y tipografías de `DESIGN_SYSTEM.md`.
- [ ] **3.2** `feat(i18n): setup react-i18next with spanish strings` — `src/i18n/es.json` con las claves del Design System ("Aforo actual", "Dentro", "Fuera", "Entrada", "Salida", "Rostro", "Cuerpo", "No identificado").
- [ ] **3.3** `feat(layout): add dashboard layout and header` — Dos columnas en escritorio, una en pantallas pequeñas.

### Task 4 — Capa de datos
- [ ] **4.1** `feat(types): add shared event and person types` — `src/types/event.ts`: `Direction`, `EventMethod`, `CameraId`, `AforoEvent`, `PersonStatus`. Mantener sincronizado con la task 3 del repo `aforo-backend`.
- [ ] **4.2** `feat(api): add aforo client` — `src/api/aforoClient.ts`: funciones `getAforo()`, `getEvents(from, to)`, `getPeople()` usando `VITE_API_BASE_URL`.
- [ ] **4.3** `feat(api): add mock mode with fixtures` — Con `VITE_USE_MOCK=true` el cliente devuelve datos de ejemplo; así avanzas sin esperar al backend.
- [ ] **4.4** `feat(query): setup tanstack query provider` — `QueryClientProvider` en `main.tsx`.

### Task 5 — Componentes principales
- [ ] **5.1** `feat(hooks): add polling hooks for aforo, events and people` — `useAforo`, `useEvents`, `usePeople` con `refetchInterval` de 2-3 s.
- [ ] **5.2** `feat(ui): add occupancy card` — `OccupancyCard`: número grande del aforo actual.
- [ ] **5.3** `feat(ui): add people list with status labels` — `PeopleList`: punto de color + nombre + "Dentro"/"Fuera".
- [ ] **5.4** `feat(ui): add event timeline with direction and method tags` — `EventTimeline`: hora, "Entrada"/"Salida", nombre o "No identificado", etiqueta "Rostro"/"Cuerpo".
- [ ] **5.5** `feat(ui): add loading and error states` — Mensajes en español ("Cargando…", "Sin conexión con el servidor").

### Task 6 — Integración con el backend real
> Depende de: Seguir con las task 1-7 del repo: `aforo-backend`

- [ ] **6.1** `chore(config): add env example with api url and mock flag` — `.env.example` con `VITE_API_BASE_URL` y `VITE_USE_MOCK`; en Amplify configurar la URL real como variable de entorno.
- [ ] **6.2** (sin commit) Probar el dashboard publicado con el script de eventos falsos (task 7.1 del repo `aforo-backend`).

---

## Prioridad 2 — Importante

### Task 7 — Pulido para proyector
- [ ] **7.1** `feat(ui): pulse occupancy card on change` — Animación corta cuando cambia el número.
- [ ] **7.2** `feat(ui): add last updated indicator` — "Actualizado hace X s", para saber que el polling sigue vivo.
- [ ] **7.3** `fix(a11y): check contrast and text labels` — Todo estado tiene texto, no solo color; contraste mínimo 4.5:1.

### Task 8 — Resumen del piloto
- [ ] **8.1** `feat(ui): add pilot summary card` — Total de entradas, salidas y % identificado por rostro, calculado en el cliente a partir de `GET /events` (métrica de éxito del PRD).

### Task 11 — Login de usuarios
> Depende de: Seguir con la task 11 del repo: `aforo-backend` (User Pool de Cognito).

- [ ] **11.1** `feat(auth): add cognito oidc login with pkce` — `src/auth/authConfig.ts` con `VITE_COGNITO_AUTHORITY`, `VITE_COGNITO_CLIENT_ID` y `VITE_COGNITO_DOMAIN`; botón "Iniciar sesión" / "Cerrar sesión". Agregar las variables a `.env.example`.
- [ ] **11.2** `feat(auth): protect routes by cognito group` — `RequireGroup`: sin sesión → login; sin el grupo → "No tienes permiso para ver esta página".
- [ ] **11.3** `feat(api): send bearer token on api requests` — `aforoClient` agrega `Authorization: Bearer <access token>`; ante un 401 vuelve al login. El modo mock (4.3) no exige login.
- [ ] **11.4** (sin commit) Probar con un usuario `viewer` y uno `dev` creados con la task 11.3 de `aforo-backend`.

---

## Prioridad 3 — Extras

### Task 9 — Vista de cámara en vivo
> Depende de: Seguir con la task 12 del repo: `aforo-vision`

> Depende de: task 11 de este repo (login).

- [ ] **9.1** `feat(ui): add cameras page with live streams` — Ruta `/camaras` (`viewer` y `dev`) con `LiveCameraPreview` por cámara (`/stream/<cameraId>?token=...`). Solo funciona abierta desde la red del laptop por HTTP: desde Amplify (HTTPS) el navegador bloquea una imagen `http://` de la red local; mostrar el mensaje `cameras.lanOnly` en ese caso.
- [ ] **9.2** `feat(ui): add dev analysis page` — Ruta `/dev` (solo grupo `dev`) con los streams anotados (`/stream/<cameraId>/dev`) de las dos cámaras lado a lado.

### Task 10 — Tests
- [ ] **10.1** `test: add component tests with vitest` — Vitest + Testing Library para `OccupancyCard`, `PeopleList` y `EventTimeline` con los fixtures de 4.3.
