# Finance Tracker disposable runtime results

The owner approved initialization and launch of the exact checkpoint environment.
The real application is running locally with synthetic data. No media has been
captured, integrated or published. The portfolio case study remains draft.

## Verified target and isolation

| Item                  | Observed result                                                     |
| --------------------- | ------------------------------------------------------------------- |
| Workspace             | `C:/Users/Darsh/portfolio/.cache/finance-demo`                      |
| PostgreSQL            | Portable 17.11; fresh cluster initialized successfully              |
| Listening address     | `127.0.0.1:15432` only                                              |
| Database              | `portfolio_finance_demo_1ad70246`                                   |
| Dedicated role        | `finance_demo_1ad70246`                                             |
| Server data directory | `C:/Users/Darsh/portfolio/.cache/finance-demo/pgdata`               |
| Authentication        | New demo-only credentials, SCRAM-SHA-256                            |
| JDBC                  | `jdbc:postgresql://127.0.0.1:15432/portfolio_finance_demo_1ad70246` |
| Backend               | `127.0.0.1:18080`, validate-only startup                            |
| Frontend              | `http://localhost:13000`, API target `http://localhost:18080`       |
| Java                  | Portable Temurin 21.0.13+9; machine-default Java remains 17         |

Before initialization, the directory was absent and all three ports were free.
Before database creation, the live server executable, command line, listening
address, role and data directory were verified. The fresh demo database had
**zero public tables** before migrations. Flyway V1 and V2 succeeded, with
checksums validated; the migrated schema contains 11 public tables.

The runner now requires the exact approved database/role/ports rather than merely
a matching name pattern. It verifies server identity before database creation,
migration and backend launch. Windows path separators are normalized for process
ownership checks. PostgreSQL launcher output handling was adjusted for inherited
pipes; no application source behavior was modified.

Child processes use an empty environment plus allowlisted OS essentials and
explicit demo configuration. No original environment files or credentials were
loaded. Gemini, Twelve Data and recurring background processing are disabled;
provider endpoints also point to disabled loopback destinations. Browser smoke
tests block nonlocal HTTP(S) requests. No blocked external origin was observed,
AI summary reported `aiGenerated=false`, and market values stayed unavailable.

All 253 original source hashes remain unchanged. Database files, encrypted
runtime secrets, the synthetic account credentials, logs, smoke reports and
future media intermediates are Git-ignored under `.cache/finance-demo`. The
portfolio build copies only approved public assets; the temporary workspace is
absent from deployment output. No Windows services or machine-wide settings changed.

## Real workflows verified

The private smoke runner uses real authentication, CSRF, application APIs and
Chrome. It does not stub successful responses or inject financial UI state.

- Registration and login for fictional **Alex Morgan** at a reserved example email.
- Creation/listing of synthetic income and expense transactions across actual categories.
- Dashboard API and authenticated UI.
- Analytics API and authenticated spending, cash-flow and budget charts page.
- Creation/listing of five monthly category budgets and their real UI.
- Two monthly recurring schedules, Recurring and Upcoming UI tabs, and two
  projected December occurrences through the real forecast API.
- Two synthetic investment lots, holdings/cost-basis APIs and Investments UI.
- Deterministic financial insights/summary endpoints with no AI generation.
- Session restoration across Dashboard, Transactions, Analytics, Budgets and
  Investments; no browser page errors were recorded.

Final dataset: **one fictional account, 14 transaction records, five budgets,
two recurring schedules and two investment lots**. Private evidence is in
`.cache/finance-demo/runtime-smoke.json` and the seed marker. Credentials and
tokens are deliberately omitted from this report and tool summaries.

## Findings and limits for media review

Creating a recurring schedule immediately records its first occurrence, per the
existing service implementation. Two schedules therefore added two records to
the 12 manually seeded transactions. Their November 5 dates are synthetic future
dated recorded entries, not projections. The next occurrences are December 5;
use **Next Month** in Upcoming to show them. Explain this distinction in media;
do not imply that recurring creation only creates a forecast.

Investment tickers `DEMO` and `SAMPLE`, purchase lots and prices are fictional.
Quote providers are disabled, so current market values/returns must remain
unavailable. Show cost-basis allocation only; do not invent live or historical prices.
Financial insights are deterministic/fallback output, not an AI demonstration.

This was a focused real-application smoke test, not the complete Finance Tracker
test suite, security audit, production acceptance or cross-device verification.
Registration/seeding are private scripts and should not be rerun to add duplicates.

## Restart and stop

From `C:/Users/Darsh/portfolio`, after stopping the owned environment:

```powershell
pwsh -NoProfile -File ./scripts/finance-demo.ps1 -Action StartDatabase -RuntimeApproved
# Separate terminals for these two processes:
pwsh -NoProfile -File ./scripts/finance-demo.ps1 -Action StartBackend -RuntimeApproved
pwsh -NoProfile -File ./scripts/finance-demo.ps1 -Action StartFrontend -RuntimeApproved
```

Do **not** repeat Initialize, CreateDatabase or Migrate on restart. Existing demo
data is retained and backend startup validates the migrated schema.

```powershell
pwsh -NoProfile -File ./scripts/finance-demo.ps1 -Action Stop
```

Stop targets only verified owned process trees (including Next.js's child server)
and this cluster's data directory. No destructive
cleanup was performed. Remove the disposable folder only after stopping it and
verifying the resolved path; never touch the external source repository.

## Capture workflow prepared for review

Use a fresh browser context, 1920 × 1080 viewport, the fictional account, blocked
external browser requests and a clearly labeled synthetic-data caption. Proposed
six screenshots: Dashboard, Transactions, Analytics, Budgets, Recurring/Upcoming
(Next Month), and Investments with unavailable quotes clearly visible.

A 60-second real browser walkthrough can move through those screens, including
one real sample-expense save after the data baseline is approved. Keep original
PNG/video captures under `.cache/finance-demo` for review first. No screenshot,
video, poster or generated media was added to the portfolio's public assets in
this runtime task. Integration and publication remain deferred.
