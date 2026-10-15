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

### Versión 2 (después de la primera entrega, octubre 2026)

Retroalimentación del profe: pocas tablas, sin registro ni login, endpoints públicos, AWS sin protección contra abuso y un frontend muy básico. La v2 pasa los datos y el login a **Supabase** (PostgreSQL + Auth con Google + RLS + Realtime). Detalle en la sección "Version 2" de cada `ARCHITECTURE.md`.

| Fase | aforo-db | aforo-backend | aforo-vision | aforo-frontend |
|---|---|---|---|---|
| F — Base v2 | 7 | 12.1-12.2 | — | 12 |
| G — Login, seguridad e integración | 8 | 13 | 14 | 13 |
| H — Producto | 9 | — | 15 (evaluar visión en la nube) | 14-15 |
| I — Cierre | 10 | 12.3-12.4 | 15.3-15.6, 16 | 16 |

Las tareas v1 que la v2 reemplaza quedan marcadas con ~~tachado~~ y una nota; no se borran para conservar el historial.

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
- [x] **3.2** `feat(i18n): setup react-i18next with spanish strings` — `src/i18n/es.json` con las claves del Design System ("Aforo actual", "Dentro", "Fuera", "Entrada", "Salida", "Rostro", "Cuerpo", "No identificado").
- [x] **3.3** `feat(layout): add dashboard layout and header` — Dos columnas en escritorio, una en pantallas pequeñas.

### Task 4 — Capa de datos
- [x] **4.1** `feat(types): add shared event and person types` — `src/types/event.ts`: `Direction`, `EventMethod`, `CameraId`, `AforoEvent`, `PersonStatus`. Mantener sincronizado con la task 3 del repo `aforo-backend`.
- [x] **4.2** `feat(api): add aforo client` — `src/api/aforoClient.ts`: funciones `getAforo()`, `getEvents(from, to)`, `getPeople()` usando `VITE_API_BASE_URL`.
- [x] **4.3** `feat(api): add mock mode with fixtures` — Con `VITE_USE_MOCK=true` el cliente devuelve datos de ejemplo; así avanzas sin esperar al backend.
- [x] **4.4** `feat(query): setup tanstack query provider` — `QueryClientProvider` en `main.tsx`.

### Task 5 — Componentes principales
- [x] **5.1** `feat(hooks): add polling hooks for aforo, events and people` — `useAforo`, `useEvents`, `usePeople` con `refetchInterval` de 2-3 s.
- [x] **5.2** `feat(ui): add occupancy card` — `OccupancyCard`: número grande del aforo actual.
- [x] **5.3** `feat(ui): add people list with status labels` — `PeopleList`: punto de color + nombre + "Dentro"/"Fuera".
- [x] **5.4** `feat(ui): add event timeline with direction and method tags` — `EventTimeline`: hora, "Entrada"/"Salida", nombre o "No identificado", etiqueta "Rostro"/"Cuerpo".
- [x] **5.5** `feat(ui): add loading and error states` — Mensajes en español ("Cargando…", "Sin conexión con el servidor").

### Task 6 — Integración con el backend real
> Depende de: Seguir con las task 1-7 del repo: `aforo-backend`

- [x] **6.1** `chore(config): add env example with api url and mock flag` — `.env.example` con `VITE_API_BASE_URL` y `VITE_USE_MOCK`; en Amplify configurar la URL real como variable de entorno.
- [x] **6.2** (sin commit) Probar el dashboard publicado con el script de eventos falsos (task 7.1 del repo `aforo-backend`).

---

## Prioridad 2 — Importante

### Task 7 — Pulido para proyector
- [ ] ~~**7.1** `feat(ui): pulse occupancy card on change` — Animación corta cuando cambia el número.~~ → incluida en la task 15.4.
- [ ] ~~**7.2** `feat(ui): add last updated indicator` — "Actualizado hace X s", para saber que el polling sigue vivo.~~ → reemplazada por el indicador "En vivo" de Realtime (task 12.5).
- [ ] ~~**7.3** `fix(a11y): check contrast and text labels` — Todo estado tiene texto, no solo color; contraste mínimo 4.5:1.~~ → incluida en la task 15.5.

### Task 8 — Resumen del piloto
- [ ] ~~**8.1** `feat(ui): add pilot summary card` — Total de entradas, salidas y % identificado por rostro, calculado en el cliente a partir de `GET /events` (métrica de éxito del PRD).~~ → incluida en la task 14.1 (tarjetas del Inicio).

### Task 11 — Login de usuarios
> Depende de: Seguir con la task 11 del repo: `aforo-backend` (User Pool de Cognito).

- [ ] ~~**11.1** `feat(auth): add cognito oidc login with pkce` — `src/auth/authConfig.ts` con `VITE_COGNITO_AUTHORITY`, `VITE_COGNITO_CLIENT_ID` y `VITE_COGNITO_DOMAIN`; botón "Iniciar sesión" / "Cerrar sesión". Agregar las variables a `.env.example`.~~ → reemplazada por Supabase Auth (task 13).
- [ ] ~~**11.2** `feat(auth): protect routes by cognito group` — `RequireGroup`: sin sesión → login; sin el grupo → "No tienes permiso para ver esta página".~~ → reemplazada por Supabase Auth (task 13).
- [ ] ~~**11.3** `feat(api): send bearer token on api requests` — `aforoClient` agrega `Authorization: Bearer <access token>`; ante un 401 vuelve al login. El modo mock (4.3) no exige login.~~ → reemplazada por Supabase Auth (task 13).
- [ ] ~~**11.4** (sin commit) Probar con un usuario `viewer` y uno `dev` creados con la task 11.3 de `aforo-backend`.~~ → reemplazada por Supabase Auth (task 13).

---

## Prioridad 3 — Extras

### Task 9 — Vista de cámara en vivo
> Depende de: Seguir con la task 12 del repo: `aforo-vision`

> Depende de: task 11 de este repo (login).

- [ ] ~~**9.1** `feat(ui): add cameras page with live streams` — Ruta `/camaras` (`viewer` y `dev`) con `LiveCameraPreview` por cámara (`/stream/<cameraId>?token=...`). Solo funciona abierta desde la red del laptop por HTTP: desde Amplify (HTTPS) el navegador bloquea una imagen `http://` de la red local; mostrar el mensaje `cameras.lanOnly` en ese caso.~~ → el estado de cámaras quedó en la task 14.6; el video pasa a la task 17.1.
- [ ] ~~**9.2** `feat(ui): add dev analysis page` — Ruta `/dev` (solo grupo `dev`) con los streams anotados (`/stream/<cameraId>/dev`) de las dos cámaras lado a lado.~~ → pasa a la task 17.2 (solo `admin`; el grupo `dev` de Cognito ya no existe).

### Task 10 — Tests
- [ ] ~~**10.1** `test: add component tests with vitest` — Vitest + Testing Library para `OccupancyCard`, `PeopleList` y `EventTimeline` con los fixtures de 4.3.~~ → ampliada en la task 16.3.

---

## Versión 2 — App con login, roles, tiempo real y diseño nuevo

> Ver `ARCHITECTURE.md` sección 8 y `DESIGN_SYSTEM.md` sección 8.
> Depende de: `aforo-db` task 7 (proyecto Supabase y esquema). Mientras no exista, se avanza con `VITE_USE_MOCK=true`.

### Task 12 — Base de la app **(Prioridad 1)**
- [x] **12.1** `chore(deps): add supabase js, react router, recharts and lucide` — Verificar versiones vigentes antes de fijarlas (regla 7).
- [x] **12.2** `feat(api): add supabase client and generated types` — `src/lib/supabase.ts` con `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`; `src/types/database.ts` generado con `supabase gen types typescript`. Actualizar `.env.example` y quitar `VITE_API_BASE_URL`.
- [x] **12.3** `feat(layout): add app shell with sidebar and topbar` — `AppShell` con menú lateral por rol, título de página, campana de alertas, selector de tema y menú de usuario. Responsive (cajón en móvil).
- [x] **12.4** `feat(ui): add skeleton loaders and empty states` — `Skeleton` (texto, círculo, tarjeta, tabla, gráfica) con shimmer y `aria-busy`; `EmptyState`; barra de progreso superior para recargas en segundo plano.
- [x] **12.5** `feat(realtime): invalidate queries on database changes` — Suscripción a `events`, `classrooms`, `cameras` y `alerts`; cada cambio invalida las queries afectadas. Indicador "En vivo" / "Reconectando…" y polling de 30 s como respaldo.
- [x] **12.6** `feat(ui): add design tokens v2 and light theme` — Tokens de `DESIGN_SYSTEM.md` 8.1, fuente Inter, tema claro/oscuro recordado por usuario.

### Task 13 — Registro e inicio de sesión **(Prioridad 1)**
- [x] **13.1** `feat(auth): add auth provider and session hooks` — `AuthProvider`, `useSession`, `useRole` (lee `user_roles` una vez por sesión).
- [x] **13.2** `feat(auth): add login page with email and password` — Errores de Supabase traducidos al español.
- [x] **13.3** `feat(auth): add sign up page with email confirmation` — Nombre, correo, contraseña (mínimo 8 caracteres); mensaje de "revisa tu correo".
- [x] **13.4** `feat(auth): add google sign in` — Botón "Continuar con Google" y ruta `/auth/callback`.
- [ ] **13.5** (sin commit) Configurar Google: crear el cliente OAuth en Google Cloud Console, pegar client ID y secret en Supabase (Authentication → Providers → Google) y agregar las URLs de redirección de Amplify y `localhost:5173`.
- [x] **13.6** `feat(auth): add password reset flow` — `/recuperar` y la pantalla para definir la nueva contraseña.
- [x] **13.7** `feat(auth): protect routes by role` — `RequireRole`: sin sesión → `/login`; sin el rol → página "No tienes permiso".
- [x] **13.8** `feat(audit): log logins and sensitive views` — Llamar `log_access` en LOGIN, LOGOUT y al abrir Estudiantes, Eventos y Auditoría.
- [x] **13.9** `feat(profile): add profile page` — Nombre, avatar (Google o iniciales), rol y cerrar sesión.

### Task 14 — Páginas **(Prioridad 1-2)**
- [x] **14.1** `feat(dashboard): add stat cards and capacity bar` — Aforo actual vs. máximo con barra de capacidad, entradas y salidas de hoy, % identificado por rostro.
- [x] **14.2** `feat(dashboard): add entries per hour chart` — Recharts: entradas y salidas por hora del día (zona `America/Bogota`).
- [x] **14.3** `feat(dashboard): add live latest events and open alerts` — Lista en vivo de los últimos 10 eventos con animación de entrada; alertas abiertas.
- [x] **14.4** `feat(events): add events history page with filters` — Filtros por fecha, dirección, método y estudiante; paginación; botón "Exportar CSV" (Edge Function de `aforo-backend` task 13.1).
- [x] **14.5** `feat(students): add students page` — Lista con presencia y último evento; crear, editar y desactivar (solo `admin`).
- [x] **14.6** `feat(cameras): add cameras status page` — Estado online/offline y último latido de cada cámara, en vivo.
- [x] **14.7** `feat(alerts): add alerts page and badge` — Abiertas y resueltas; resolver (`teacher`, `admin`); contador en la campana del topbar.
- [x] **14.8** `feat(sessions): add class sessions and attendance page` — Crear/editar sesiones; asistencia por sesión (presente, salió, hora de entrada y salida).
- [x] **14.9** `feat(admin): add users and roles page` — Lista de usuarios, cambiar rol (`set_user_role`), activar/desactivar (`set_user_active`), invitar (Edge Function `invite-user`).
- [x] **14.10** `feat(admin): add audit log page` — Tabla con filtros por usuario, acción, tabla y fecha; detalle con el antes/después.
- [x] **14.11** `feat(admin): add settings page for courses rooms and cameras` — CRUD de cursos y salones (aforo máximo) y nombres de cámaras.

### Task 15 — Diseño visual **(Prioridad 2)**
- [x] **15.1** `feat(auth): add split layout and illustration for auth pages` — Panel con nombre del producto e ilustración SVG (sin fotos de personas).
- [x] **15.2** `feat(ui): add toasts and confirm dialogs` — Toast en cada mutación; confirmación en acciones destructivas.
- [x] **15.3** `feat(ui): add icons and badges across pages` — lucide-react en menú, tarjetas, estados vacíos y badges.
- [x] **15.4** `feat(ui): animate occupancy and new events` — Pulso del número al cambiar y entrada deslizada de eventos nuevos; respetar `prefers-reduced-motion`.
- [x] **15.5** `fix(a11y): audit contrast labels and keyboard navigation` — Contraste 4.5:1 en ambos temas, todo estado con texto, foco visible, navegación con teclado en menú, tablas y diálogos.

### Task 16 — Despliegue y pruebas **(Prioridad 1 al final)**
- [ ] **16.1** (sin commit) En Amplify: variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`; quitar `VITE_API_BASE_URL`. En Supabase: agregar la URL de Amplify en Authentication → URL Configuration.
- [ ] **16.2** (sin commit) Probar con un usuario de cada rol: `viewer` no ve nombres ni la página de estudiantes, `teacher` no ve Admin, `admin` ve todo; sin sesión nada.
- [x] **16.3** `test: add component and auth guard tests with vitest` — Vitest + Testing Library: skeletons, `RequireRole`, tarjetas del Inicio y filtros de Eventos con datos mock.

### Task 17 — Video en vivo de las cámaras **(Prioridad 3)**
> Depende de: `aforo-vision` tasks 12.1 y 12.3 (servidor de video) y la decisión de la task 15.2 (dónde corre el pipeline).

- [ ] **17.1** `feat(cameras): add live stream per camera` — En la página de Cámaras (14.6), el video de cada cámara para `viewer`, `teacher` y `admin`, enviando el JWT de Supabase al servidor de `aforo-vision`. Si el servidor está en la red local por `http://`, desde Amplify (HTTPS) el navegador bloquea la imagen: mostrar un mensaje que lo explique en vez de un cuadro vacío.
- [ ] **17.2** `feat(cameras): add admin analysis overlay view` — Solo `admin`: los streams con cajas, IDs de track, nombre + confianza y dirección (`/stream/<cameraId>/dev`) de las dos cámaras lado a lado.

### Task 18 — Ajustes después de la primera prueba en Amplify **(Prioridad 1)**
- [x] **18.1** `feat(auth): validate name length and email format` — Reglas compartidas en `src/lib/validation.ts`: nombre de 3 a 60 caracteres, solo letras, espacios, puntos, apóstrofes y guiones, con contador visible; correo con `@`, dominio y extensión de al menos 2 letras (máx. 254). Se usan en registro, login, recuperar contraseña, perfil, invitar usuario y estudiantes.
- [x] **18.2** `refactor(theme): remove light theme` — Solo tema oscuro: quitar el botón de tema, `src/theme/theme.ts`, los tokens y estilos `[data-theme='light']` y los colores claros de las gráficas.
- [ ] **18.3** `feat(auth): add emblem above auth form` — En escritorio, un emblema SVG (logo con anillos de detección y las dos cámaras) arriba del formulario y un brillo de fondo, para que el lado derecho no se vea vacío frente al panel izquierdo.
