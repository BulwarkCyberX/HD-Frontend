# `@hackersdeal/web` Frontend

Next.js App Router application for the HackersDeal frontend.

## Frontend Architecture

- Framework: Next.js (App Router)
- Styling: Tailwind CSS
- Forms: `react-hook-form` + `zod`
- UI: shared components from `@hackersdeal/ui`
- Data/API layer: `src/lib/api/*` (auth, projects, bids, messages, reports, payments, reviews, notifications, bounty, files, ai, vdp)
- Payment API layer: `src/lib/api/payments.ts`
- Review API layer: `src/lib/api/reviews.ts`
- Auth state: React Context in `src/hooks/auth-context.tsx` with localStorage-backed token

## Routing Structure

Primary routes:

- `/`: landing page with CTA
- `/auth/login`: login form (real backend login call)
- `/auth/signup`: signup form (real backend register call)
- `/dashboard`: dashboard shell
- `/dashboard/projects/create`: scope builder and project creation form
- `/dashboard/projects/[id]`: secure project workspace (chat + reports)
- `/dashboard/admin/reports`: admin triage queue and report validation actions
- `/dashboard/bids`: provider bid history view
- `/dashboard/bounty`: private bug bounty programs (create + list)
- `/dashboard/bounty/[id]`: program detail, submissions, researcher upload flow
- `/dashboard/vdp`: client-only VDP publisher (public link generation)
- `/vdp/[id]`: public vulnerability disclosure + reporting form
- `/dashboard/profile`: profile + provider reputation metrics
- `/projects`: projects list from backend API
- `/projects/[id]`: project detail + bid management for client owner
- `/projects/[id]`: project detail + bid management + provider profile metrics
- `/projects/[id]/bid`: provider bid submission

Compatibility redirects:

- `/login` -> `/auth/login`
- `/signup` -> `/auth/signup`

## Component Structure

- `src/components/navbar.tsx`: top-level navigation + notification bell (polling)
- `src/components/notification-bell.tsx`: notification dropdown
- `src/components/file-attachment-control.tsx`: reusable authenticated upload control
- `src/components/dashboard-sidebar.tsx`: dashboard nav shell
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

- Current approach: React Context provider (`AuthProvider`)
- Stored state:
  - `isAuthenticated`
  - `user`
  - `token`
- Token strategy (MVP): memory + `localStorage`
- Route protection: `ProtectedRoute` redirects unauthenticated users to `/auth/login`

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
- chat/reports are polled on interval (basic real-time behavior)

## Payment Flow UI (Escrow MVP)

Payment actions are integrated into `/dashboard/projects/[id]`:

1. Client owner deposits payment (`Deposit Payment`) with amount input.
2. Escrow status is visible in project summary (`IN_ESCROW`, `RELEASED`, etc.).
3. Client owner marks project complete (`Mark as Completed`).
4. Client owner releases payment (`Release Payment`) after completion.
5. Selected provider sees payment status updates and release confirmation message.

API calls used by workspace UI:

- `POST /payments/deposit`
- `PATCH /projects/:id/complete`
- `POST /payments/release`

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
```

## Required Env Vars

- `NEXT_PUBLIC_API_URL` (optional, defaults to `http://localhost:4000`)
