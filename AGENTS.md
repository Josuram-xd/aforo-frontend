# AGENTS.md — aforo-frontend

Este archivo le dice a los asistentes de IA cómo comportarse dentro de este repositorio.

## Qué es este repositorio

`aforo-frontend` es el dashboard en React/TypeScript que muestra en vivo el aforo del salón, el estado de las personas enroladas y el historial de eventos, durante el piloto de un día. Consume exclusivamente la API de `aforo-backend` — no tiene lógica de negocio propia ni accede a la base de datos directamente.

Antes de proponer cambios, lee `PRD.md`, `ARCHITECTURE.md` y `DESIGN_SYSTEM.md` (estos dos últimos en inglés).

## Reglas para el agente

1. **Todo el texto visible para el usuario va en español.** Usa las claves de `i18n/es.json` (`react-i18next`) — no hardcodees strings en inglés en los componentes.
2. **No inventes campos que no estén en el contrato de `aforo-backend`.** Si la UI necesita un dato nuevo, primero hay que proponerlo como cambio al contrato compartido (documentado en `aforo-backend/ARCHITECTURE.md`), no agregarlo solo en el frontend.
3. **Sigue el Design System (`DESIGN_SYSTEM.md`)** para colores, tipografía y layout — en particular, nunca combines la distinción `FACE`/`BODY_ONLY` en un solo estado genérico "detectado"; esa distinción es importante para evaluar el piloto.
4. **Usa TanStack Query para todo el estado del servidor.** No agregues Redux, Zustand ni otra librería de estado global sin que el usuario lo pida — la app no tiene estado complejo propio.
5. **No agregues WebSockets/SSE** a menos que el usuario lo pida explícitamente — la actualización es por polling corto (ver ADR-001 en `ARCHITECTURE.md`), suficiente para el volumen de eventos de una sola puerta.
6. **Verifica versiones antes de fijar una dependencia nueva.** TypeScript debe mantenerse en la rama 6.x (no subir a 7.x) mientras `typescript-eslint` no lo soporte completamente — confirma el estado actual antes de cambiar esto.
7. **Presupuesto**: el hosting debe mantenerse en el nivel gratuito de AWS Amplify. Si una dependencia o servicio nuevo implica costo, dilo de inmediato.
8. **Código (componentes, hooks, nombres de archivos, commits) en inglés**; contenido visible para el usuario (textos de UI) en español.

## Herramientas que el agente puede usar libremente

- Lectura/escritura de archivos dentro de este repositorio.
- `npm install` / `npm run build` / `npm run dev` locales.
- Búsqueda web para verificar versiones de React, TypeScript, Vite, TanStack Query, etc.

## Herramientas que requieren confirmación explícita del usuario

- Despliegue real a AWS Amplify.
- Cambiar la URL base de la API (`VITE_API_BASE_URL`) a un valor de producción sin confirmar con el usuario.
- Agregar cualquier dependencia que no sea gratuita o que requiera una cuenta/servicio externo nuevo.
