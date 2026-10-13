# AGENTS.md — aforo-frontend

Este archivo le dice a los asistentes de IA cómo comportarse dentro de este repositorio.

## Qué es este repositorio

`aforo-frontend` es el dashboard en React/TypeScript que muestra en vivo el aforo del salón, el estado de las personas enroladas y el historial de eventos, durante el piloto de un día. Consume exclusivamente la API de `aforo-backend` — no tiene lógica de negocio propia ni accede a la base de datos directamente.

Antes de proponer cambios, lee `PRD.md`, `ARCHITECTURE.md` y `DESIGN_SYSTEM.md` (estos dos últimos en inglés).

> **Versión 2 en curso (oct 2026):** la app pasa a leer de Supabase (con login, roles y Realtime) y tiene un diseño nuevo (`ARCHITECTURE.md` sección 8, `DESIGN_SYSTEM.md` sección 8, `TASKS.md` tasks 12-16). Las reglas marcadas **(v2)** reemplazan a las de v1 para ese trabajo.

## Reglas de git (obligatorias, sin excepciones)

1. **Ninguna IA puede hacer commit ni push.** Ningún asistente (Claude Code, Cursor, Copilot, Codex, Gemini, etc.) ejecuta `git commit`, `git push`, `git merge`, `git rebase`, `git tag` ni `git reset`, ni crea o fusiona PRs, ni por terminal ni por herramientas MCP/API de GitHub. El agente deja los cambios en el árbol de trabajo y, si ayuda, **propone** el mensaje de commit (formato de `TASKS.md`); el commit y el push los hace siempre una persona.
2. **Nadie puede tener `Co-Authored-By` de una IA.** Ningún commit ni PR puede incluir líneas `Co-Authored-By: Claude ...` (ni de ninguna otra IA), `noreply@anthropic.com` ni "Generated with Claude Code". Esto aplica también a las personas: si el mensaje propuesto trae esa línea, se borra antes de commitear.
3. **Cómo se hace cumplir:**
   - `.githooks/commit-msg` rechaza localmente esos mensajes. Actívalo una vez por clon: `git config core.hooksPath .githooks`.
   - `.github/workflows/no-ai-coauthor.yml` falla en GitHub si algún commit del historial los tiene.
   - `.claude/settings.json` desactiva la coautoría automática de Claude Code y le bloquea `git commit`/`git push`.
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
