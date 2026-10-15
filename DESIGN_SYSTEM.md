# Design System — aforo-frontend

**Repository:** `aforo-frontend`
**Last updated:** October 8, 2026
**Scope:** One-screen live dashboard for a one-day pilot demo.

> **Version 2 (section 8)** extends this system for the multi-page app: app shell, icons, skeletons,
> charts and forms. Sections 1-7 still apply unless section 8 overrides them.

This is intentionally a small, pragmatic design system — enough to keep the dashboard consistent and legible when projected in a classroom, not a full product design language.

## 1. Design principles

1. **Legible from a distance.** The dashboard will likely be shown on a projector or a laptop screen viewed from a few meters away. Large numbers, high contrast, minimal clutter.
2. **Status at a glance.** The single most important number (current occupancy) must be the visually dominant element on the screen.
3. **Honest about confidence.** Every person-related row distinguishes a face-identified match (`FACE`) from a body-only count (`BODY_ONLY`) — never blur the two into one generic "detected" state, since the pilot's evaluation depends on showing the real identification rate.
4. **Spanish-first UI text.** All user-facing copy is in Spanish; code (component names, props, CSS classes) stays in English.

## 2. Color palette

| Token | Hex | Usage |
|---|---|---|
| `--color-bg` | `#0F172A` | App background (dark, projector-friendly) |
| `--color-surface` | `#1E293B` | Cards / panels |
| `--color-text-primary` | `#F8FAFC` | Primary text on dark background |
| `--color-text-secondary` | `#94A3B8` | Secondary/muted text |
| `--color-accent` | `#38BDF8` | Primary accent (occupancy number, active states) |
| `--color-success` | `#4ADE80` | `ENTRY` events, "dentro" status |
| `--color-warning` | `#FACC15` | `BODY_ONLY` identification method |
| `--color-danger` | `#F87171` | `EXIT` events (visually, not an error — just the paired color to success) |
| `--color-border` | `#334155` | Card borders, dividers |

Dark theme only for this pilot — no light-mode requirement.

## 3. Typography

- **Font**: system UI stack (`-apple-system, "Segoe UI", Roboto, sans-serif`) — no custom font loading needed for a one-day pilot.
- **Scale**:
  - Occupancy number (hero metric): 96px / bold
  - Section headings: 24px / semibold
  - Body text / table rows: 16px / regular
  - Secondary/meta text (timestamps): 13px / regular, `--color-text-secondary`

## 4. Layout

```
┌─────────────────────────────────────────────┐
│  Aforo — Piloto [Nombre del curso]            │  <- header
├───────────────────────┬───────────────────────┤
│                        │  Personas enroladas    │
│     AFORO ACTUAL        │  ┌───────────────────┐ │
│        7                │  │ ● Nombre  Dentro   │ │
│                        │  │ ○ Nombre  Fuera    │ │
│  (hero metric card)     │  └───────────────────┘ │
├───────────────────────┴───────────────────────┤
│  Historial de eventos                          │
│  10:32  Entrada  Nombre       (rostro)          │
│  10:29  Salida   No identificado (cuerpo)       │
│  ...                                           │
└─────────────────────────────────────────────┘
```

Two-column layout on desktop/projector width; stacks to a single column below ~768px, though mobile is not a priority for this pilot.

## 5. Components

### 5.1 `OccupancyCard`
- Large numeric hero metric (current occupancy).
- Updates via polling; a brief pulse/flash animation on change is a nice-to-have, not required.

### 5.2 `PeopleList`
- One row per enrolled person: a colored status dot (`--color-success` = dentro, `--color-text-secondary` = fuera), name, status label in Spanish ("Dentro" / "Fuera").

### 5.3 `EventTimeline`
- Reverse-chronological list of events: time, direction badge ("Entrada" / "Salida", colored success/danger), name or "No identificado", and a small method tag ("rostro" / "cuerpo") colored accent/warning respectively.

### 5.4 `LiveCameraPreview` (optional, stretch goal)
- If time allows: an `<img>`/MJPEG or short-poll snapshot view showing the annotated detection feed from one camera, for demo purposes only. Not required for the core pilot deliverable.

## 6. Language and copy

All UI strings live in a single i18n resource file (Spanish) via `react-i18next`, even though this pilot ships one language only — this keeps user-facing strings out of component code and makes a future English version trivial. Examples of required strings:

| Key | Spanish text |
|---|---|
| `occupancy.title` | "Aforo actual" |
| `people.status.in` | "Dentro" |
| `people.status.out` | "Fuera" |
| `events.direction.entry` | "Entrada" |
| `events.direction.exit` | "Salida" |
| `events.method.face` | "Rostro" |
| `events.method.body` | "Cuerpo" |
| `events.unidentified` | "No identificado" |
| `auth.login` | "Iniciar sesión" |
| `auth.logout` | "Cerrar sesión" |
| `auth.forbidden` | "No tienes permiso para ver esta página" |
| `cameras.title` | "Cámaras" |
| `cameras.lanOnly` | "El video solo está disponible en la red local del piloto" |
| `dev.title` | "Vista de análisis (dev)" |

## 7. Accessibility notes

- Color is never the only signal — every status also has a text label (important given the success/danger palette is a reused pair, not semantically "good/bad").
- Minimum contrast ratio 4.5:1 for all text against its background (the chosen dark palette already satisfies this).

## 8. Version 2 — Product UI (planned)

Feedback from the first review: the dashboard looked "very basic, missing things and decoration". v2 keeps the principles of section 1 and adds what a real product needs.

### 8.1 Themes

- **Dark only.** It keeps the palette of section 2. A light theme existed during v2 and was removed on 2026-10-15 at the team's request (`TASKS.md` 18.2).

New tokens: `--color-surface-2` (hover/zebra rows), `--radius-sm/md/lg` (6/10/16px), `--shadow-card`, `--space-1..8` (4px scale), `--skeleton-base` and `--skeleton-shine`.

### 8.2 Typography

**Inter** (Google Fonts, weights 400/500/600/700) with the system stack as fallback; tabular numbers (`font-variant-numeric: tabular-nums`) for counters, times and tables. The hero occupancy number stays 96px on the dashboard.

### 8.3 App shell

```
┌──────────┬──────────────────────────────────────────────┐
│ ◉ Aforo  │  Inicio                         🔔 3   (JR)▾ │  <- topbar: page title, alerts, user menu
│          ├──────────────────────────────────────────────┤
│ Inicio   │                                              │
│ Eventos  │   page content (max-width 1280px, 24px gap)  │
│ Estudian.│                                              │
│ Sesiones │                                              │
│ Cámaras  │                                              │
│ Alertas  │                                              │
│ ──────── │                                              │
│ Admin ▸  │                                              │
│  Usuarios│                                              │
│  Auditor.│                                              │
│  Config. │                                              │
└──────────┴──────────────────────────────────────────────┘
```

- Sidebar with a lucide icon + label per item; only the items the user's role can open are shown. Collapses to icons below 1024px and becomes a drawer below 768px (mobile is now supported).
- A small "En vivo" indicator in the topbar shows the Realtime connection (green dot / grey "Reconectando…").

### 8.4 Dashboard (Inicio)

```
┌ Aforo actual ─────────┐┌ Entradas hoy ┐┌ Salidas hoy ┐┌ Identificados ┐
│   18 / 30  ▓▓▓▓▓░░░   ││     42       ││     24      ││   71% rostro  │
└───────────────────────┘└──────────────┘└─────────────┘└───────────────┘
┌ Entradas y salidas por hora (área/barras) ───────┐┌ Alertas abiertas ──┐
│                                                  ││ ⚠ Cámara pasillo…   │
└──────────────────────────────────────────────────┘└────────────────────┘
┌ Últimos eventos (en vivo) ──────────────────────────────────────────────┐
```

- The occupancy card shows a capacity bar: accent until 80%, warning 80-100%, danger above 100% (plus a text label, never color only).
- A new event slides in at the top of "Últimos eventos" and the occupancy number pulses briefly.

### 8.5 Skeletons ("diseño fantasma")

- Each component has a skeleton with the **same size and layout** as the loaded content (no layout shift): text lines as rounded bars, avatars as circles, charts as a grey area with axis placeholders, tables as 5 placeholder rows.
- Shimmer: a linear gradient from `--skeleton-base` to `--skeleton-shine` moving left→right in 1.4 s; disabled with `prefers-reduced-motion`.
- Shown only on the first load of a query (`isPending`); background refetches keep the old data and show the thin top progress bar instead.
- Accessibility: the region gets `aria-busy="true"` and a visually hidden "Cargando…".

### 8.6 Other components

`Button` (primary, secondary, ghost, danger; loading state with spinner), `Badge` (direction, method, role, status), `Card`, `StatCard`, `Table` (sortable headers, sticky header, pagination), `FilterBar`, `Dialog` (confirmations; destructive actions require confirming), `Toast` (success/error, 4 s), `EmptyState` (lucide icon + one sentence + optional action), `Avatar` (Google photo or initials), `Field` (label, help text, inline error).

### 8.7 Auth pages

Split layout: left panel with the product name, a short description and an illustration of the classroom door/cameras (SVG, no stock photos of people); right panel with the form. "Continuar con Google" button first, then email + password. Errors from Supabase are translated to Spanish messages.

### 8.8 New copy keys (examples)

| Key | Spanish text |
|---|---|
| `nav.home` / `nav.events` / `nav.students` / `nav.sessions` / `nav.cameras` / `nav.alerts` | "Inicio" / "Eventos" / "Estudiantes" / "Sesiones" / "Cámaras" / "Alertas" |
| `nav.admin.users` / `nav.admin.audit` / `nav.admin.settings` | "Usuarios" / "Auditoría" / "Configuración" |
| `auth.signup` / `auth.google` / `auth.forgot` | "Crear cuenta" / "Continuar con Google" / "¿Olvidaste tu contraseña?" |
| `common.loading` / `common.retry` / `common.empty` | "Cargando…" / "Reintentar" / "No hay datos para mostrar" |
| `live.connected` / `live.reconnecting` | "En vivo" / "Reconectando…" |
| `occupancy.ofCapacity` | "{{current}} de {{max}}" |
| `roles.admin` / `roles.teacher` / `roles.viewer` | "Administrador" / "Docente" / "Observador" |
