# Architecture — aforo-frontend

**Repository:** `aforo-frontend`
**Last updated:** October 8, 2026
**Scope:** One-day pilot, single-screen live dashboard.

> **Version 2 planned (section 8).** Sections 1-7 describe the polling dashboard deployed today (v1).
> v2 turns it into a multi-page app with registration, login (email + Google), roles, Realtime and a
> redesigned UI, reading from Supabase instead of the AWS API.

## 1. Purpose

`aforo-frontend` is a React dashboard that displays the pilot's live occupancy, enrolled-people status, and event history, by polling `aforo-backend`'s REST API. It contains no business logic beyond formatting and display — all computation (occupancy, identity resolution) happens upstream.

## 2. High-level architecture

```
┌─────────────────────┐        HTTPS (poll)        ┌───────────────┐
│   aforo-frontend      │ ─────────────────────────▶│  aforo-backend │
│ (React, AWS Amplify)  │  GET /aforo, /events,      │ (API Gateway)  │
│                      │       /people              └───────────────┘
└─────────────────────┘
```

- Single-page React app, statically hosted on AWS Amplify.
- No backend-for-frontend layer — calls `aforo-backend`'s REST API directly.
- Data freshness via short-interval polling (TanStack Query), not WebSockets — simpler to build and sufficient for a one-day pilot's update cadence (a person crossing a door every few seconds at most).

## 3. Architecture Decision Records

### ADR-001: Polling instead of WebSocket/SSE — superseded by ADR-006 (v2)
**Decision**: The dashboard polls `GET /aforo`, `GET /events`, `GET /people` on a short interval (e.g., every 2-3 seconds) via TanStack Query, rather than opening a WebSocket or Server-Sent Events connection.
**Why**: event frequency during the pilot is inherently low (people walking through one door), so polling is visually indistinguishable from a push-based update, and it avoids the extra complexity of a persistent connection (API Gateway WebSocket support, connection management) for a one-day deliverable. Documented as a possible upgrade path if this becomes a permanent, higher-traffic installation.

### ADR-002: AWS Amplify for hosting, not a custom server
**Decision**: The React app is built as a static bundle and hosted on AWS Amplify.
**Why**: zero cost within AWS's free tier, zero server to manage, and it keeps the entire stack (backend + frontend + database) inside one AWS account, consistent with the rest of the project's serverless choices.

### ADR-003: No client-side state management library beyond TanStack Query
**Decision**: Server state (occupancy, events, people) is managed by TanStack Query; there is no Redux/Zustand/global store.
**Why**: the app has no complex client-only state — everything displayed comes from the backend. TanStack Query's caching and polling cover the entire data layer needed.

### ADR-004: Login with Amazon Cognito managed login (OIDC + PKCE) — superseded by ADR-005 (v2), never implemented
**Decision**: Users sign in through the Cognito User Pool defined in `aforo-backend` (ADR-005 there), using its managed login page with the authorization-code + PKCE flow (e.g. `react-oidc-context` / `oidc-client-ts`; verify current versions before pinning). The access token is sent as `Authorization: Bearer` to `aforo-backend` and as a query parameter to `aforo-vision`'s stream server (an `<img>` MJPEG request cannot send headers).
**Routes**: `/` dashboard (`viewer`, `dev`), `/camaras` plain camera streams (`viewer`, `dev`), `/dev` annotated analysis streams (`dev` only). Groups come from the token's `cognito:groups` claim; hiding routes in the UI is only convenience — the backend and the stream server enforce access.
**Why**: no password handling in our code, free within Cognito's tier for a few users, and the same token works for both the API and the local video.
**Constraint**: the camera pages only work when the app is opened from the laptop's network over plain HTTP (e.g. `npm run dev` / `vite preview` on the laptop); from the HTTPS Amplify deployment the browser blocks `http://` LAN streams. The dashboard itself works from anywhere.

## 4. Data contract (consumed, not owned)

`aforo-frontend` consumes the REST API and shared enums defined in `aforo-backend/ARCHITECTURE.md`. It must not diverge from that contract; if the UI needs a new field, that's a change proposed to `aforo-backend`, not invented locally.

Relevant TypeScript types (kept in sync with the backend contract):

```typescript
type Direction = "ENTRY" | "EXIT";
type EventMethod = "FACE" | "BODY_ONLY";
type CameraId = "camera-outside" | "camera-inside";

interface AforoEvent {
  eventId: string;
  personId: string | null;
  personName: string | null;
  direction: Direction;
  cameraOutsideId: CameraId;
  cameraInsideId: CameraId;
  confidence: number;
  method: EventMethod;
  timestamp: string; // ISO 8601
}

interface PersonStatus {
  personId: string;
  name: string;
  status: "IN" | "OUT";
  lastEventAt: string;
}
```

## 5. Tech stack

| Layer | Choice | Version (verified Sept 2026) |
|---|---|---|
| Language | TypeScript | 6.0 (TypeScript 7's Go-native compiler not yet supported by `typescript-eslint` as of this check) |
| Framework | React | 19.3.0 |
| Build tool | Vite | 8.x |
| Routing | React Router | 8.x |
| Server state | TanStack Query | 5.x |
| Charts (if used for a summary view) | Recharts | 3.x |
| i18n | i18next / react-i18next | latest |
| Runtime | Node.js | 24 LTS |
| Hosting | AWS Amplify | — |

## 6. Repository structure

```
aforo-frontend/
├── ARCHITECTURE.md
├── AGENTS.md
├── PRD.md
├── DESIGN_SYSTEM.md
├── README.md
├── package.json
├── vite.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── api/
│   │   └── aforoClient.ts        # typed fetch wrappers for aforo-backend
│   ├── types/
│   │   └── event.ts              # shared types (mirrors aforo-backend contract)
│   ├── components/
│   │   ├── OccupancyCard.tsx
│   │   ├── PeopleList.tsx
│   │   ├── EventTimeline.tsx
│   │   ├── LiveCameraPreview.tsx  # optional, stretch goal (plain or dev stream)
│   │   └── RequireGroup.tsx       # route guard by Cognito group
│   ├── auth/
│   │   └── authConfig.ts          # Cognito OIDC settings from VITE_COGNITO_* env vars
│   ├── hooks/
│   │   ├── useAforo.ts
│   │   ├── useEvents.ts
│   │   └── usePeople.ts
│   ├── i18n/
│   │   └── es.json
│   └── styles/
└── public/
```

## 7. Deployment

- Built with Vite (`vite build`), deployed to AWS Amplify Hosting (connected to the GitHub repo for CI/CD, or manual `amplify publish` for the pilot if CI is unnecessary overhead for a one-day deliverable).
- The `aforo-backend` API base URL is injected via an environment variable at build time (e.g., `VITE_API_BASE_URL`), so no URL is hardcoded.

## 8. Version 2 — Multi-page app on Supabase (planned)

### 8.1 Why v2

First project review: the UI was "too basic", there was no registration or login, and the data was public from the browser. v2 addresses all three.

### 8.2 Architecture

```
┌──────────────────────────────┐   supabase-js (user JWT)    ┌──────────────────────────────┐
│ aforo-frontend (React, Amplify)│ ─────────────────────────▶│ Supabase                      │
│  - Auth pages                 │   select via PostgREST      │  Auth (email, Google OAuth)   │
│  - App shell + role guards    │   rpc: set_user_role, ...   │  PostgreSQL + RLS (aforo-db)  │
│  - TanStack Query cache       │ ◀───────────────────────── │  Realtime (events, classrooms,│
│  - Realtime → invalidations   │   Realtime websocket        │   cameras, alerts)            │
└──────────────────────────────┘                             │  Edge Functions (aforo-backend)│
                                                              └──────────────────────────────┘
```

- The browser uses only the **publishable key**; everything else depends on the signed-in user's JWT and RLS. No service-role key ever reaches the frontend.
- TanStack Query stays as the server-state cache. Realtime messages do not write to the cache directly: they invalidate the affected queries (simple and consistent with RLS).
- Environment: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (replace `VITE_API_BASE_URL`). `VITE_USE_MOCK` keeps working for offline UI work.

### 8.3 Routes and roles

| Route | Page | Roles |
|---|---|---|
| `/login`, `/registro`, `/recuperar`, `/auth/callback` | Sign in (email or Google), sign up, password reset, OAuth return | public |
| `/` | **Inicio**: occupancy vs. capacity, today's entries/exits, % identified by face, entries per hour chart, latest events, open alerts | all |
| `/eventos` | Event history with filters (date range, direction, method, student), pagination, CSV export | `teacher`, `admin` |
| `/estudiantes` | Students with presence and last event; create/edit/deactivate (`admin`) | `teacher`, `admin` |
| `/sesiones` | Class sessions (create/edit) and attendance per session | `teacher`, `admin` |
| `/camaras` | Camera status (online/offline, last heartbeat); live video only where ADR-006 of `aforo-vision` allows | all |
| `/alertas` | Open and resolved alerts; resolve (`teacher`, `admin`) | all |
| `/admin/usuarios` | Users, roles, activate/deactivate, invite | `admin` |
| `/admin/auditoria` | Audit log with filters | `admin` |
| `/admin/configuracion` | Courses, classrooms (max capacity), cameras | `admin` |
| `/perfil` | Own name and avatar, sign out | all |

Role guards only shape the UI; RLS enforces access. The current user's role is read from `user_roles` once per session and cached.

### 8.4 Loading and error states

Every data region renders a **skeleton** (same shape as the final content, shimmer animation, `aria-busy`) while its query is pending, an empty state when there is no data, and an inline error with a retry button. A global top progress bar shows background refetches. Mutations show toasts.

### 8.5 ADRs for v2

**ADR-005: Supabase Auth instead of Cognito.** Email + password, Google OAuth and password reset come built in; the session is handled by `supabase-js` (PKCE flow). Open sign-up is allowed because new accounts get the `viewer` role, which cannot see personal data.

**ADR-006: Supabase Realtime instead of polling.** Supersedes ADR-001. The professor expects real-time updates; Realtime pushes changes over one websocket and respects RLS. Polling stays only as a fallback (every 30 s) if the websocket disconnects.

**ADR-007: Routing with React Router, charts with Recharts, icons with lucide-react.** Verify current major versions before pinning (AGENTS rule 7).

### 8.6 Repository structure (target)

```
src/
├── lib/supabase.ts            # client from VITE_SUPABASE_* env vars
├── auth/                      # AuthProvider, useSession, useRole, RequireRole
├── api/                       # typed queries per table (events, students, sessions, ...)
├── realtime/                  # subscriptions → query invalidation
├── layouts/AppShell.tsx       # sidebar + topbar + outlet
├── pages/                     # one folder per route in 8.3
├── components/
│   ├── ui/                    # Button, Card, Badge, Table, Dialog, Toast, Skeleton, EmptyState
│   └── charts/                # EntriesPerHourChart, IdentificationRateChart
├── types/database.ts          # generated with `supabase gen types typescript`
└── i18n/es.json
```
