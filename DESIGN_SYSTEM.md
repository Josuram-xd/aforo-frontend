# Design System — aforo-frontend

**Repository:** `aforo-frontend`
**Last updated:** September 26, 2026
**Scope:** One-screen live dashboard for a one-day pilot demo.

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
