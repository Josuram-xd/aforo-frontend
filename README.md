# aforo-frontend

Dashboard web del sistema de aforo. Muestra en tiempo real cuántas personas hay en el salón, quién entró y salió, el estado de las cámaras y las alertas, con login y permisos por rol. Lee los datos directamente de Supabase (`aforo-db`) con `supabase-js`; no tiene backend propio.

- **Stack:** React 19 + TypeScript + Vite, React Router, TanStack Query, Recharts, i18next (textos en español), lucide-react. Desplegado en AWS Amplify.
- **Login:** Supabase Auth (correo + contraseña o Google). Toda cuenta nueva entra como `viewer`; un `admin` cambia los roles.
- **Roles:** `viewer` ve el Inicio, las Cámaras y las Alertas, sin nombres de estudiantes; `teacher` además ve Eventos (con exportar CSV), Estudiantes y Sesiones; `admin` ve todo, incluida la administración de usuarios, la auditoría y la configuración. Ocultar una página no es la seguridad: la seguridad real es RLS en `aforo-db`.

Más detalle en `PRD.md`, `ARCHITECTURE.md`, `DESIGN_SYSTEM.md` y `AGENTS.md`. El trabajo pendiente está en `TASKS.md`.

## Páginas

| Ruta | Quién | Qué muestra |
|---|---|---|
| `/login`, `/registro`, `/recuperar` | sin sesión | Inicio de sesión, registro y recuperación de contraseña |
| `/` | todos | Aforo actual vs. máximo, entradas/salidas de hoy, gráfica por hora, últimos eventos y alertas abiertas (en vivo) |
| `/eventos` | `teacher`, `admin` | Historial con filtros y botón "Exportar CSV" |
| `/estudiantes` | `teacher`, `admin` | Presencia y último evento de cada estudiante (crear/editar solo `admin`) |
| `/sesiones` | `teacher`, `admin` | Clases y asistencia por sesión |
| `/camaras` | todos | Estado en línea/fuera de línea y último latido |
| `/alertas` | todos | Abiertas y resueltas (resolver: `teacher`, `admin`) |
| `/admin/usuarios`, `/admin/auditoria`, `/admin/configuracion` | `admin` | Usuarios y roles, auditoría y configuración (cursos, salones, cámaras) |
| `/perfil` | todos | Datos de la cuenta |

## Estructura

```
aforo-frontend/
├── src/
│   ├── main.tsx · App.tsx · router.tsx   # arranque y rutas (las páginas se cargan bajo demanda)
│   ├── pages/            # una carpeta por página: home, events, students, sessions, cameras,
│   │                     # alerts, admin, profile, auth (login, registro, recuperar) + 403/404
│   ├── layouts/          # AppShell: menú lateral, barra superior, menú de usuario, cambio de tema
│   ├── components/       # piezas de la app (StatCard, CapacityBar, EventList, FilterBar...)
│   │   ├── ui/           # sistema de diseño propio: Button, Card, Dialog, DataTable, Skeleton, Toast...
│   │   └── charts/       # gráficas con Recharts
│   ├── api/              # una función por consulta a Supabase (events, students, alerts, admin...)
│   │   └── mock/         # base de datos falsa para trabajar sin Supabase (VITE_USE_MOCK)
│   ├── auth/             # AuthProvider, RequireRole (protege rutas por rol), roles, validación de contraseñas
│   ├── realtime/         # suscripciones de Supabase Realtime e indicador "En vivo"
│   ├── hooks/            # hooks de TanStack Query
│   ├── lib/              # cliente de Supabase, variables de entorno, formato de fechas, utilidades
│   ├── i18n/             # textos en español (es.json)
│   ├── styles/           # tokens de diseño (colores, espacios); solo tema oscuro
│   ├── types/            # tipos generados de la base de datos (database.ts)
│   └── test/             # configuración de Vitest y helper de render
├── public/               # archivos estáticos
├── amplify.yml           # build en Amplify (npm ci → npm test → npm run build)
├── customHttp.yml        # headers de seguridad en Amplify
└── PRD.md · ARCHITECTURE.md · DESIGN_SYSTEM.md · AGENTS.md · TASKS.md
```

## Puesta en marcha

Requiere Node.js 22.12 o superior (lo pide Vite 8).

```bash
npm install
cp .env.example .env.local      # y llena las variables (ver abajo)
npm run dev                     # http://localhost:5173
```

### Variables de entorno

| Variable | Qué es |
|---|---|
| `VITE_SUPABASE_URL` | URL del proyecto de Supabase (`https://<ref>.supabase.co`) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | La *publishable key* (`sb_publishable_...`). **Nunca** la `service_role`. |
| `VITE_USE_MOCK` | `true` usa datos de ejemplo y una sesión falsa, sin Supabase. Solo funciona con `npm run dev`; un build de producción nunca se salta el login. |
| `VITE_MOCK_ROLE` | Rol simulado en modo mock: `admin`, `teacher` o `viewer`. |

Los valores reales van en `.env.local` (fuera de git) y, para el despliegue, en la consola de Amplify.

### Comandos

```bash
npm run dev            # servidor de desarrollo
npm test               # pruebas con Vitest + Testing Library
npm run lint           # ESLint
npm run format:check   # Prettier
npm run build          # build de producción en dist/
```

## Estructuras de datos, GRASP y SOLID

Mapa de dónde se aplican algunas estructuras de datos y principios de diseño en el código. Es referencia, no requisito: cada punto indica el archivo donde se ve.

### Estructuras de datos

**Aplicadas**

- **Set (pertenencia en O(1)):** `src/pages/courses/CourseStudentsDialog.tsx` crea `new Set(enrolledIds.data ?? [])` para saber si un estudiante ya está inscrito en el curso (`enrolled.has(s.id)`), en lugar de buscar en un arreglo.
- **Set (unión de llaves):** `src/pages/admin/AuditDetailDialog.tsx` une las llaves de `before` y `after` con `new Set([...])` para listar cada campo una sola vez, y luego las ordena.
- **Set (contraseñas comunes):** `src/auth/passwordStrength.ts` guarda `COMMON_PASSWORDS` como Set y consulta `COMMON_PASSWORDS.has(password.toLowerCase())`.
- **Cola acotada FIFO:** `src/components/ui/Toast.tsx` guarda los avisos en un arreglo y lo recorta con `.slice(-MAX_VISIBLE)` (`MAX_VISIBLE = 4`): al llegar un aviso nuevo se descartan primero los más viejos. El límite cuenta errores y demás avisos juntos; después se separan en dos regiones (`role="alert"` para errores y `role="status"` para el resto). Cada aviso tiene su propio temporizador (`DURATION_MS`: 4 s, o 6 s para errores) que se pausa con el mouse o el foco.
- **Tabla hash (caché de TanStack Query):** las llaves de `src/api/queryKeys.ts` identifican cada consulta. TanStack Query es una librería: por dentro convierte cada llave en una cadena y la usa como índice de su caché. El código propio solo define las llaves y el mapa `REALTIME_INVALIDATIONS`, que indica qué familias de consultas invalidar por tabla.

**No aplicadas**

- **Pila, lista enlazada, árbol y cola de prioridad:** no se usan. Los datos son relacionales y vienen de Supabase; ordenar y filtrar usa los métodos nativos de los arreglos (`sort`, `filter`). No se forzaron a propósito.

### GRASP

- **Indirección y bajo acoplamiento:** `src/api/` tiene una función por consulta (por ejemplo, `fetchCourseStudentIds` en `src/api/courseStudents.ts`). Cada una delega en `src/api/mock/mockApi.ts` cuando `isMockMode` es verdadero. `isMockMode` está definido en `src/lib/env.ts` como `import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true'`, así que el mock solo se activa en desarrollo. Excepción: las pantallas de autenticación (`src/pages/auth/`), `src/auth/AuthProvider.tsx` y `src/realtime/RealtimeProvider.tsx` usan `supabase` directamente.
- **Alta cohesión:** cada carpeta agrupa un tema: `src/pages/` (una carpeta por página), `src/components/ui/` (sistema de diseño), `src/hooks/` (hooks de TanStack Query en `queries.ts`), `src/auth/` (sesión, roles y contraseñas) y `src/realtime/` (suscripción y el indicador "En vivo").
- **Experto:** `RequireRole` (`src/auth/RequireRole.tsx`) obtiene el rol con `useMe()` y delega en `canAccess` (`src/auth/roles.ts`) la decisión de si ese rol puede entrar a la ruta.
- **Controlador (aproximado):** los proveedores de contexto coordinan sesión, avisos y tiempo real (no son controladores GRASP estrictos): `AuthProvider` y `ToastProvider` se montan en `src/main.tsx`; `RealtimeProvider` se monta en `src/layouts/ShellRoute.tsx`.

Ocultar una ruta o un botón no es control de acceso: la seguridad real es RLS en `aforo-db` (ver `AGENTS.md`).

### SOLID

- **S (responsabilidad única):** cada componente o hook hace una tarea. Por ejemplo, `ConfirmDialog` (`src/components/ui/ConfirmDialog.tsx`) solo pide confirmar, y `TypedConfirmDialog` (`src/components/ui/TypedConfirmDialog.tsx`) solo añade la validación de escribir el texto exacto.
- **O (abierto/cerrado):** `Dialog` (`src/components/ui/Dialog.tsx`) no se modifica para cada caso. `ConfirmDialog` y `TypedConfirmDialog` lo componen y lo configuran por props (`size`, `tone`, `icon`, `footer`).
- **D (inversión de dependencias):** parcial. Las pantallas usan las funciones de `src/api/` y no el backend concreto, y el mock es otra implementación que se elige con `isMockMode` (import dinámico). No hay inyección de dependencias; las pantallas de autenticación siguen dependiendo de `supabase` directamente.
- **I (segregación de interfaces):** se ve de forma limitada: los tipos de entrada usan `Pick<>` para pedir solo los campos necesarios, por ejemplo `StudentInput` en `src/api/students.ts` y `deleteStudent(student: Pick<Student, 'id' | 'photo_path'>)`.
- **L (sustitución de Liskov):** no se identifica en el código; no se documenta.

### Curso

El material del curso de estructuras de datos está en la carpeta «Estructura de datos» del curso.

## Limitaciones

- **Requiere un computador local.** El sistema necesita siempre un computador encendido, con `aforo-vision` corriendo, en la misma red local que las cámaras Tapo. La red de la institución no permite configurar el router, así que no hay acceso remoto a las cámaras ni procesamiento en la nube.
- La web, la base de datos, los usuarios y las alertas funcionan sin ese computador, pero sin él no hay conteo ni estado de cámaras: las cámaras figuran sin conexión. La página Cámaras muestra un aviso con esto.

## Modo demostración

Para mostrar la web sin datos reales, abre `/demo` en la versión desplegada (por ejemplo `https://<dominio>/demo`). Entra directo a Inicio con datos de ejemplo (aforo, cámaras en línea, eventos `FACE` y `BODY_ONLY`, una alerta abierta) y una franja fija arriba: «MODO DEMOSTRACIÓN · datos de ejemplo, no son resultados del piloto».

- **Rol simulado:** `/demo?rol=admin` (por defecto), `/demo?rol=teacher` o `/demo?rol=viewer`. Cualquier otro valor se ignora y se usa `admin`. Solo cambia lo que ve esa pestaña.
- **Qué es:** los mismos datos del modo mock de desarrollo, en memoria del navegador. Los cambios (crear estudiantes, resolver alertas…) se pierden al recargar.
- **No toca la base de datos:** no hay sesión de Supabase, no se crea ningún usuario y ninguna petición sale a la red; el cliente de Supabase queda bloqueado mientras la demo está activa.
- **Cómo salir:** botón «Salir de la demo» de la franja (o «Cerrar sesión»); borra la bandera y vuelve al login. La bandera vive en `sessionStorage`, así que cerrar la pestaña también la termina.

## Despliegue

AWS Amplify (`us-east-2`) construye y publica cada push a `main` con `amplify.yml`. Si las pruebas fallan, no se publica. La URL del frontend debe estar en Supabase → Authentication → URL Configuration para que funcionen el login con Google y los enlaces de correo (`/auth/callback`).

## Contrato con los otros repos

| Repo | Qué usa |
|---|---|
| `aforo-db` | Tablas y vistas (filtradas por RLS según el rol), Realtime de `events`, `classrooms`, `cameras` y `alerts`, y las RPCs `set_user_role`, `set_user_active` y `log_access` |
| `aforo-backend` | Edge Functions `export-events` (CSV) e `invite-user` (invitar usuarios) |
| `aforo-vision` | Produce los eventos; el video en vivo de las cámaras está pendiente (task 17) |
