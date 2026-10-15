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

## Despliegue

AWS Amplify (`us-east-2`) construye y publica cada push a `main` con `amplify.yml`. Si las pruebas fallan, no se publica. La URL del frontend debe estar en Supabase → Authentication → URL Configuration para que funcionen el login con Google y los enlaces de correo (`/auth/callback`).

## Contrato con los otros repos

| Repo | Qué usa |
|---|---|
| `aforo-db` | Tablas y vistas (filtradas por RLS según el rol), Realtime de `events`, `classrooms`, `cameras` y `alerts`, y las RPCs `set_user_role`, `set_user_active` y `log_access` |
| `aforo-backend` | Edge Functions `export-events` (CSV) e `invite-user` (invitar usuarios) |
| `aforo-vision` | Produce los eventos; el video en vivo de las cámaras está pendiente (task 17) |
