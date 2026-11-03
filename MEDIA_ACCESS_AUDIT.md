# Portfolio media access audit

This file records the Finance Tracker recheck on November 2, 2026, superseding
the missing-location finding in the earlier conversational media audit. Other
project assessments remain as previously reviewed; no other capture work began.

## Personal Finance Tracker

Current status: the owner-approved isolated runtime is running and synthetic
API/browser smoke checks passed. See `FINANCE_TRACKER_RUNTIME_RESULTS.md` for
verified targets, dataset, limitations and restart/stop commands. Earlier
preparation/preflight notes below are retained as history. Media remains pending review.

Preparation update: portable Java 21/PostgreSQL tools and dependencies are staged
inside the portfolio's ignored disposable workspace; backend packaging succeeded
without executing tests or starting Spring Boot. Runtime approval is now pending
at `FINANCE_TRACKER_RUNTIME_CHECKPOINT.md`. The database cluster remains uninitialized.

The current media-preparation request was rechecked. Safe runtime isolation is
still not established; capture has not begun. See `FINANCE_TRACKER_MEDIA.md` for
the exact disposable-copy/database/runtime prerequisites, synthetic-data plan,
proposed six screenshots and 60-second recording. The user's approval workflow
requires stopping before service/database/migration setup at this stage.

**Status: source access confirmed; ready to plan isolated demo preparation,
but not yet verified ready to launch or record.**

### Confirmed access

The actual repository is `C:/Users/Darsh/finance-tracker`, with a hyphen. The
originally supplied `C:/Users/Darsh/FinanceTracker` path still does not exist.
External source was inspected read-only; no dependencies were installed there.

- Frontend: `frontend/finance-tracker-frontend/`, including `src/app`, API/session
  client, `package.json` and `next.config.ts`. It is Next.js/React/TypeScript.
- Backend: `backend/backend/`, including Spring Boot controllers, authentication
  services, registration DTO, Maven configuration, wrapper and migration sources.
- Read-only setup review: root README, database migration documentation,
  authentication local-testing documentation and the development launcher source.
- No environment files, ignored credential storage, backups, database contents,
  tokens or financial records were opened. No running localhost app was contacted.

### Local startup feasibility and remaining prerequisites

The source documents a Next.js frontend on localhost:3000 and a Spring Boot API
on localhost:8080, backed by PostgreSQL. Development API defaults target localhost,
but explicit isolated configuration must be verified before any eventual launch.
An existing localhost server or database is not proof of a safe demo target.

- Backend requires Java 21; the current PATH resolves Java/Javac to JDK 17.
  A compatible JDK must be made available to the isolated process.
- Maven wrapper exists. Dependency download/build readiness was not tested.
- Node/npm are available; frontend `node_modules` is absent. Install dependencies
  only in a disposable working copy inside an authorized writable workspace.
- Neither Docker nor `psql` was found on PATH. No PostgreSQL server/container was
  contacted or verified. Provision a separate disposable PostgreSQL instance,
  dedicated demo database and role before proceeding.
- Use an allowlisted process environment with an explicit loopback JDBC URL,
  dedicated demo database identity, fresh demo-only JWT secret, matching local
  CORS origin and frontend API target. Do not inherit production configuration.
- `start-dev.ps1` defaults to migration mode `migrate` and invokes a helper that
  manages ignored local credentials. Do not use it against the existing checkout
  or an existing database for this media task.
- A fresh database will eventually need the reviewed Flyway schema initialization
  (V1/V2) in that disposable instance. No initialization/migration was authorized
  or executed in this audit. Subsequent recording runs should use validate mode.
- Disable recurring background processing, external cron access, paid AI and
  market-data providers for the demo. No existing private testing launcher or
  credential store should be reused. No live market/AI result should be invented.

### Synthetic demo account and records

Implemented registration is `POST /api/auth/register`; login/session endpoints
and authenticated financial CRUD controllers are readable. Registration accepts
a unique username (3–50 characters), valid email (maximum 255 characters), and
password (8–128 characters). Its inspected service hashes the password and saves
the user without an email-delivery step.

After isolated schema setup is separately authorized, create a new demo identity
such as `PortfolioDemo` / `portfolio-demo@example.test`, with a fresh demo-only
password. Use the real registration/login and UI/API flows, preserving the
application's CSRF/session handling. Do not copy real users or database dumps.

Create clearly fictional income/expense transactions across a small date range,
matching budgets and recurring definitions through implemented APIs/UI. Use
invented merchant descriptions and values; avoid identifying notes or receipts.
Recorded transactions must remain distinct from recurring projections. Optional
investment purchases may be synthetic; unavailable live prices/AI must retain
the application's honest disabled/unavailable state. Exact input fields and
date ranges will be checked during preparation rather than invented here.

### Screenshot and video readiness

No Finance Tracker application screenshots or videos are currently integrated in
the portfolio. Share cards and logos are not application evidence.

Playwright is installed and has already captured/tested the portfolio locally.
It can drive the real Next.js interface and record browser video after backend,
database and authentication smoke checks pass. Proposed shots: dashboard,
transaction history, budget progress, and recurring Upcoming view. Capture only
implemented states populated with synthetic records; no mocked UI or API output.
Use a fresh browser context and keep login entry, cookies, Authorization headers,
developer tools and network traces out of deliverable media. Manual input may be
useful for visual selection but is not inherently required for this web interface.

### Actions performed and next decision

Only source inspection and portfolio audit documentation updates were performed.
No application, PostgreSQL connection, migration, test suite, account creation,
seeding, capture, environment edit, deployment, commit or push was performed.

Source-location access is resolved. Runtime/database isolation and schema setup
remain prerequisites before safe capture. Preparation must preserve the external
repository and use a separate disposable copy with explicitly scoped configuration.

## VisionControl — November 2 implementation and recording preflight

Source access confirmed read-only at `C:/Users/Darsh/VisionControl`, clean revision
`f5b22b0e48875ccd4ef9c09e40dba82532f275f3`. See `VISION_CONTROL_MEDIA.md` for
implemented-feature boundaries, environment checks, exact proposed commands,
owner gesture instructions, six-image selection and a 65-second recording plan.

Python 3.13.16 and all 19 pinned dependencies are available. The hand model's
pinned checksum matches, and it loaded/closed successfully offline without any
camera or inference. Native WIN32 preview and FFmpeg gdigrab capabilities exist.
No current camera was returned by metadata enumeration; device/index/permission
and real recognition/capture acceptance remain unverified. CLI `--help` has an
argparse formatting defect; normal proposed arguments validated without launch.

Existing hand-preview PNGs are synthetic/schematic or have unverified live-input
provenance; no reusable authentic webcam video was found. The virtual motor image
is explicitly synthetic and does not demonstrate physical hardware. Native hand
preview is capped at 1100 × 650 (1100 × 619 for a 1080p feed); no upscaling is planned.

Awaiting owner review and webcam recording permission. Initial tracking/gesture
capture will omit `--controls`; any actual cursor control requires a separate
approval and physical emergency-stop check. No webcam, desktop input, recording,
source changes or publication occurred. The portfolio record remains draft.
