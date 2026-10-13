# AGENTS.md — aforo-frontend

Este archivo le dice a los asistentes de IA cómo comportarse dentro de este repositorio.

## Qué es este repositorio

`aforo-frontend` es el dashboard en React/TypeScript que muestra en vivo el aforo del salón, el estado de las personas enroladas y el historial de eventos, durante el piloto de un día. Consume exclusivamente la API de `aforo-backend` — no tiene lógica de negocio propia ni accede a la base de datos directamente.

Antes de proponer cambios, lee `PRD.md`, `ARCHITECTURE.md` y `DESIGN_SYSTEM.md` (estos dos últimos en inglés).

> **Versión 2 en curso (oct 2026):** la app pasa a leer de Supabase (con login, roles y Realtime) y tiene un diseño nuevo (`ARCHITECTURE.md` sección 8, `DESIGN_SYSTEM.md` sección 8, `TASKS.md` tasks 12-16). Las reglas marcadas **(v2)** reemplazan a las de v1 para ese trabajo.

## Reglas de git (obligatorias, sin excepciones)

1. **Una rama por task.** Los asistentes de IA pueden hacer commit y push, pero **solo en ramas de trabajo**, nunca en `main`. Nombre de la rama: `task-<n>-<descripcion-corta>` (ej. `task-7-supabase-schema`). Si la task depende de otra que aún no está en `main`, la rama sale de la rama de esa task (PRs encadenados).
2. **Un commit por subtarea**, con el mensaje exacto de `TASKS.md` y el sufijo `[x.y]`; en ese mismo commit se marca `[x]` en `TASKS.md`.
3. **Prohibido para la IA:** `git merge`, `git rebase`, `git reset --hard`, `git tag`, `push --force` y push a `main`; tampoco fusionar PRs. Puede **abrir** el PR de la rama hacia `main` (o hacia la rama de la que depende); la revisión y el merge los hace siempre una persona.
4. **Nadie puede tener `Co-Authored-By` de una IA.** Ningún commit ni PR puede incluir líneas `Co-Authored-By: Claude ...` (ni de ninguna otra IA), `noreply@anthropic.com` ni "Generated with Claude Code". El autor es el usuario configurado en git.
5. **Cómo se hace cumplir:**
   - `.githooks/commit-msg` rechaza localmente esos mensajes. Actívalo una vez por clon: `git config core.hooksPath .githooks`. No se usa `--no-verify`.
   - `.github/workflows/no-ai-coauthor.yml` falla en GitHub si algún commit del historial los tiene.
   - `.claude/settings.json` desactiva la coautoría automática de Claude Code y bloquea merge, rebase, force push y push a `main`.
   No desactives ni modifiques estos tres archivos sin que el usuario lo pida explícitamente.

## Reglas para el agente

1. **Todo el texto visible para el usuario va en español.** Usa las claves de `i18n/es.json` (`react-i18next`) — no hardcodees strings en inglés en los componentes.
2. **No inventes campos que no estén en el contrato.** **(v2)** El contrato son las tablas y RPCs de `aforo-db` (`ARCHITECTURE.md` sección 7) y los tipos generados en `src/types/database.ts`. Si la UI necesita un dato nuevo, se propone como migración en `aforo-db`, no se inventa en el frontend.
3. **Sigue el Design System (`DESIGN_SYSTEM.md`)** para colores, tipografía y layout — en particular, nunca combines la distinción `FACE`/`BODY_ONLY` en un solo estado genérico "detectado"; esa distinción es importante para evaluar el piloto.
4. **Usa TanStack Query para todo el estado del servidor**, también en v2 (las consultas con `supabase-js` van dentro de `useQuery`/`useMutation`). No agregues Redux, Zustand ni otra librería de estado global sin que el usuario lo pida.
5. **(v2) Login solo con Supabase Auth** (correo + contraseña, Google). Los roles (`admin`, `teacher`, `viewer`) vienen de la base de datos; ocultar un botón o una ruta no es control de acceso: la seguridad real es RLS en `aforo-db`. En el navegador solo va la publishable key; nunca la `service_role` key. Deja que `supabase-js` maneje la sesión; no guardes tokens a mano.
6. **(v2) Tiempo real con Supabase Realtime** (ADR-006), con polling lento solo como respaldo. No agregues otros WebSockets/SSE propios.
7. **Verifica versiones antes de fijar una dependencia nueva.** TypeScript debe mantenerse en la rama 6.x (no subir a 7.x) mientras `typescript-eslint` no lo soporte completamente — confirma el estado actual antes de cambiar esto.
8. **Presupuesto**: hosting en el nivel gratuito de AWS Amplify y datos en el plan Free de Supabase. Si una dependencia o servicio nuevo implica costo, dilo de inmediato.
9. **Código (componentes, hooks, nombres de archivos, commits) en inglés**; contenido visible para el usuario (textos de UI) en español.

## Herramientas que el agente puede usar libremente

- Lectura/escritura de archivos dentro de este repositorio.
- `npm install` / `npm run build` / `npm run dev` locales.
- Búsqueda web para verificar versiones de React, TypeScript, Vite, TanStack Query, etc.

## Herramientas que requieren confirmación explícita del usuario

- Despliegue real a AWS Amplify.
- Cambiar la URL base de la API (`VITE_API_BASE_URL`) a un valor de producción sin confirmar con el usuario.
- Agregar cualquier dependencia que no sea gratuita o que requiera una cuenta/servicio externo nuevo.
