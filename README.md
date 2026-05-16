# `@hackersdeal/web` Frontend

Next.js App Router application for the HackersDeal frontend.

## Frontend Architecture

- Framework: Next.js (App Router)
- Styling: Tailwind CSS; brand colors live under **`tropical.*`** in `tailwind.config.ts` (generated shades from aqua, jade, sage, sand, sunrise bases)
- Forms: `react-hook-form` + `zod`
- UI: `@hackersdeal/ui` is wired to **`local-ui/`** in this app (`file:./local-ui` in `package.json`). Primitives include `Button`, `Input`, `Textarea`, `Card` (default **light** tropical surface; pass **`surface="dark"`** for auth/landing glass cards), and `Badge`.
- Data/API layer: `src/lib/api/*` (auth, projects, bids, messages, reports, payments, reviews, notifications, bounty, files, ai, vdp, **milestones**, **wallets**, **withdrawals**)
- Server state: **TanStack Query** (`@tanstack/react-query`) via `src/providers/query-provider.tsx`, mounted in `src/app/layout.tsx` (workspace polling + cache invalidation from sockets)
- Payment API layer: `src/lib/api/payments.ts`
- Review API layer: `src/lib/api/reviews.ts`
- Auth state: React Context in `src/hooks/auth-context.tsx` with localStorage-backed token
- Realtime: **Socket.IO client** (`socket.io-client`) in `src/hooks/use-project-socket.ts` — connects to `${NEXT_PUBLIC_API_URL}/workspace`, joins the project room, and triggers workspace refresh on domain events; **existing HTTP polling remains** when the socket is disconnected

## Routing Structure

Primary routes:

- `/`: landing page with CTA
- `/auth/login`: login form (real backend login call)
- `/auth/signup`: signup form (real backend register call)
- `/dashboard`: authenticated dashboard (same **workspace shell** as `/projects`: sidebar + light content panel)
- `/dashboard/projects/create`: scope builder and project creation form
- `/dashboard/projects/[id]`: secure project workspace (chat, reports, **milestones** tab with funding / lifecycle actions, wallet summary, realtime refresh)
- `/dashboard/withdrawals`: withdrawal request history (providers; role-aware empty states)
- `/dashboard/admin`: admin hub (projects, email templates, KYC, disputes, reports)
- `/dashboard/admin/projects`, `/dashboard/admin/projects/[id]`: manage all projects
- `/dashboard/admin/emails`, `/dashboard/admin/emails/[key]`: edit transactional email templates
- `/dashboard/admin/settings`: platform settings (links to template editor + env notes)
- `/dashboard/admin/reports`: admin triage queue and report validation actions
- `/dashboard/admin/kyc`, `/dashboard/admin/disputes`: verification and dispute queues
- `/dashboard/bids`: provider bid history view
- `/dashboard/bounty`: private bug bounty programs (create + list)
- `/dashboard/bounty/[id]`: program detail, submissions, researcher upload flow
- `/dashboard/vdp`: client-only VDP publisher (public link generation)
- `/vdp/[id]`: public vulnerability disclosure + reporting form
- `/dashboard/profile`: profile + provider reputation metrics
- `/projects`: projects list from backend API (public; uses workspace layout **without** forcing login)
- `/projects/[id]`: project detail, bid management for client owner, provider metrics when applicable
- `/projects/[id]/bid`: provider bid submission

Compatibility redirects:

- `/login` -> `/auth/login`
- `/signup` -> `/auth/signup`

## Component Structure

- `src/app/manifest.ts`: PWA web app manifest (icons can be filled in for production)
- `src/app/dashboard/error.tsx`: route-level error boundary for the dashboard segment
- `src/components/navbar.tsx`: top-level navigation + notification bell (polling)
- `src/components/notification-bell.tsx`: notification dropdown
- `src/components/file-attachment-control.tsx`: reusable authenticated upload control
- `src/components/workspace-layout.tsx`: shared shell for `/dashboard/*` and `/projects/*` (sidebar + main content panel; `contentVariant` `card` vs `flush` only affects padding semantics—both use the same light panel styling)
- `src/components/dashboard-sidebar.tsx`: workspace nav links; **desktop** rail from `md` and up, **mobile drawer** (Menu in the workspace header) below `md`
- `src/components/protected-route.tsx`: auth guard wrapper
- `src/components/auth-login-form.tsx`: validated login + backend auth call
- `src/components/auth-signup-form.tsx`: validated signup + backend register call
- `src/components/project-card.tsx`: reusable project list card
- `src/app/dashboard/projects/create/page.tsx`: project scope builder form
- `src/app/projects/[id]/bid/page.tsx`: bid submission form
- `src/app/projects/[id]/page.tsx`: project detail + bid actions
- `src/app/dashboard/bids/page.tsx`: provider bid history page
- `src/app/dashboard/projects/[id]/page.tsx`: secure workspace layout

## State Management Approach

- Current approach: React Context provider (`AuthProvider`) for session identity
- Stored state:
  - `isAuthenticated`
  - `user`
  - `token`
- Token strategy (MVP): memory + `localStorage`
- Route protection: `ProtectedRoute` redirects unauthenticated users to `/auth/login`
- Remote data: prefer **TanStack Query** for fetches that benefit from caching, deduping, and explicit refetch (project workspace milestones, wallet, etc.)

## Real Auth Flow (MVP)

1. User submits login/signup form.
2. Frontend calls backend `/auth/login` or `/auth/register`.
3. Access token is stored in memory and `localStorage`.
4. Protected pages call backend APIs with `Authorization: Bearer <token>`.
5. On `401`, session is cleared and user is redirected to login.

## Scope Builder Flow

Project creation is implemented at `/dashboard/projects/create` with six sections:

1. Basic info (title, description)
2. Assets (multiple DOMAIN/URL/IP entries)
3. Scope (`inScope`, `outOfScope`)
4. Testing details (window, timeline)
5. Budget (type + amount)
6. Visibility (public/private/invite-only)

The form validates with `zod` and submits to backend `POST /projects`.

## Provider and Client Bid Flow

Provider flow:

1. Browse projects (`/projects`)
2. Submit bid from `/projects/[id]/bid`
3. Track submitted bids in `/dashboard/bids`
4. View bid credits in dashboard (`providerProfile.bidCredits`)
5. Open assigned workspace after bid acceptance

Client flow:

1. Open project details at `/projects/[id]`
2. View incoming bids for owned project
3. Accept or reject each pending bid

UI state handling includes loading, success/error messaging, and disabled submit buttons during in-flight requests.

## Workspace UI (Execution Phase)

Main workspace route: `/dashboard/projects/[id]`

Layout:

- Left panel: project and scope summary
- Main area tabs:
  - Chat (messages list + send input)
  - Reports (view reports; selected provider can submit)

Access policy in UI:

- workspace visible only for project owner client and selected provider
- chat/reports/milestones/wallet are polled on an interval; when the Socket.IO connection is up, the server can push refresh hints so the UI refetches without waiting for the next poll

## Payment Flow UI (Escrow MVP)

Payment actions are integrated into `/dashboard/projects/[id]`:

1. Client owner deposits payment (`Deposit Payment`) with amount input.
2. Escrow status is visible in project summary (`IN_ESCROW`, `RELEASED`, etc.).
3. Client owner marks project complete (`Mark as Completed`).
4. Client owner releases payment (`Release Payment`) after completion.
5. Selected provider sees payment status updates and release confirmation message.

The backend still exposes the same payment routes for compatibility; deposits and releases are **orchestrated through wallets and an immutable ledger** (`WalletLedgerEntry`). The workspace may show a **wallet summary** (balances) via `GET /wallets/me`.

API calls used by workspace UI:

- `POST /payments/deposit`
- `PATCH /projects/:id/complete`
- `POST /payments/release`
- `GET /wallets/me` (authenticated user wallet)
- Milestones: `GET /milestones/project/:projectId`, `POST /milestones`, state transitions under `POST /milestones/:id/*` (fund, start, submit, approve, release, reject), comments under `GET|POST /milestones/:id/comments` (see `docs/api.md` for payloads)

Withdrawals (typically providers):

- `POST /withdrawals`, `GET /withdrawals/me` — UI at `/dashboard/withdrawals`

## Trust and Triage UI (MVP)

Admin triage route: `/dashboard/admin/reports`

Capabilities:

- list all submitted reports with project/provider context
- update report status to `VALID`, `REJECTED`, or `NEED_MORE_INFO`
- add triage notes for each decision

Workspace report behavior:

- provider sees submitted report status and triage notes
- client sees only triage-visible reports (`VALID`, `REJECTED`, `NEED_MORE_INFO`)
- status indicators are shown with badges for clarity

## Reputation and Review UI (MVP)

Review UI inside workspace:

- shown for client owner after project completion
- includes star rating selector (1-5) and optional comment
- prevents duplicate review submission by reflecting saved review state

Provider reputation visibility:

- provider dashboard cards show rating, review count, completed projects, valid reports, and reputation score
- client bid/project surfaces show provider metrics for comparison

API calls used:

- `POST /reviews`
- `GET /users/provider/:id`

## Run Commands

From repo root:

```bash
npm run dev --workspace @hackersdeal/web
npm run build --workspace @hackersdeal/web
npm run lint --workspace @hackersdeal/web
npm run test:e2e --workspace @hackersdeal/web
```

E2E uses Playwright (`apps/web/e2e/`). Start API + web (or let Playwright start web), seed DB, then run tests. See `docs/overnight-handoff.md`.

## Required Env Vars

- `NEXT_PUBLIC_API_URL` — browser-facing NestJS origin (default `http://localhost:4000`). Used for REST **and** for the Socket.IO path `${NEXT_PUBLIC_API_URL}/workspace` (same host as the API; ensure CORS and cookie rules match your deployment).
- `NEXT_PUBLIC_APP_URL` — public site origin (e.g. `http://localhost:3000`); useful for OAuth return URLs and absolute links where configured (see `.env.example`).

For full API and architecture notes (disputes, search, storage presign, health, Swagger, etc.), see repo **`docs/api.md`** and **`docs/architecture.md`**.
