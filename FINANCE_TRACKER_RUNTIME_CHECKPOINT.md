# Finance Tracker disposable runtime checkpoint

The owner subsequently approved these runtime steps. Execution results and
restart/stop commands are in `FINANCE_TRACKER_RUNTIME_RESULTS.md`. The checkpoint
below records the pre-initialization state, not the current running state.

Preparation only. Database initialization, migration, services, account creation,
synthetic data and capture remain unexecuted pending the owner's runtime approval.

## Staged workspace

`C:/Users/Darsh/portfolio/.cache/finance-demo`

- `source/`: 253 tracked frontend/backend files copied from the external repository,
  with source hashes recorded in `source-manifest.json`. No `.env*`, `.local`,
  production/local Spring overrides, database dumps, Git metadata or existing
  dependency/build directories were imported.
- `tools/jdk/jdk-21.0.13+9`: Eclipse Temurin 21.0.13+9, archive checksum verified
  against the official Adoptium API; `java -version` succeeded.
- `tools/pgsql`: PostgreSQL 17.11 portable EDB ZIP, downloaded from the binary
  archive site linked by PostgreSQL.org; `postgres --version` succeeded. Archive
  SHA-256 recorded locally for reproducibility, not claimed as an independently
  verified vendor checksum.
- `tools/apache-maven-3.9.15`: exact Maven distribution pinned by the source
  wrapper, staged locally. Java launcher bypasses the Windows wrapper issue.
- `private/secrets.clixml`: fresh demo database password/JWT secret, encrypted with
  Windows user-bound SecureString serialization. Values are not printed here.
- `config.json`: nonsecret runtime targets. All staging is inside ignored `.cache`.

No machine-wide installation, Java-default change, Windows service registration
or change to any existing database or external repository occurred.

Sources: [Adoptium archive installation](https://adoptium.net/installation/archives),
[PostgreSQL Windows binaries](https://www.postgresql.org/download/windows/),
[EDB portable archives](https://www.enterprisedb.com/download-postgresql-binaries).

## Proposed isolated PostgreSQL instance

Docker was not found on PATH or at the standard Docker Desktop executable path.
The proposed alternative is a new portable PostgreSQL cluster, never an installed
service or existing cluster.

| Item                              | Prepared target                                                     |
| --------------------------------- | ------------------------------------------------------------------- |
| Host / port                       | `127.0.0.1:15432`                                                   |
| Database                          | `portfolio_finance_demo_1ad70246`                                   |
| Dedicated cluster role            | `finance_demo_1ad70246`                                             |
| Data directory                    | `C:/Users/Darsh/portfolio/.cache/finance-demo/pgdata`               |
| JDBC                              | `jdbc:postgresql://127.0.0.1:15432/portfolio_finance_demo_1ad70246` |
| Backend                           | `127.0.0.1:18080`                                                   |
| Frontend / allowed browser origin | `http://localhost:13000`                                            |

At preparation inspection, all three ports had no TCP listeners. The data
directory and initialization marker were absent. Consequently **no database yet
exists**: zero-table verification cannot honestly be claimed before initialization.
After approval, a newly created cluster/database must pass the catalog identity
and empty-public-schema checks before its first Flyway operation.

The runner rejects a nonmatching JDBC URL, unexpected database/role names, an
existing initialization directory and occupied startup ports. Before migration
or backend startup it verifies server-reported host, port, database, role and
data directory. The first migration additionally requires zero public tables and
refuses a repeated initial migration. No baseline, clean, repair or reset action
is provided. Later backend starts use migration mode `validate` only.

## Production configuration exclusion

Each child process starts from an empty environment populated with explicit
Windows runtime essentials and demo-only paths/configuration. It does not inherit
Neon URLs, Spring override variables, Java/Node preload options, proxies,
production JWT credentials, provider keys, Maven user settings or npm user config.
Dependency caches and USERPROFILE are redirected inside the disposable workspace.

Backend database URL, role/password, JWT secret, port, loopback binding and CORS
origin are supplied explicitly by the runner. `RECURRING_SCHEDULER_ENABLED`,
`MARKET_DATA_ENABLED` and `AI_INSIGHTS_ENABLED` are false; cron credentials and
provider keys are absent. Provider endpoints also point to disabled loopback
destinations as a second guard. No paid API is needed or authorized.
No OS firewall or machine-wide network setting has been changed.

## Commands staged for after approval only

Run from `C:/Users/Darsh/portfolio`. `-RuntimeApproved` is a deliberate guard;
it does not itself grant permission and must not be used before owner approval.

```powershell
# Create only the fresh cluster; refuses an existing data directory.
pwsh -NoProfile -File ./scripts/finance-demo.ps1 -Action Initialize -RuntimeApproved
# Start its standalone server, never a Windows service.
pwsh -NoProfile -File ./scripts/finance-demo.ps1 -Action StartDatabase -RuntimeApproved
# Create the unique demo database and verify its identity/zero public tables.
pwsh -NoProfile -File ./scripts/finance-demo.ps1 -Action CreateDatabase -RuntimeApproved
# Initialize only that verified fresh schema, without starting Spring Boot.
pwsh -NoProfile -File ./scripts/finance-demo.ps1 -Action Migrate -RuntimeApproved
# Run in separate terminals; these remain attached for log forwarding.
pwsh -NoProfile -File ./scripts/finance-demo.ps1 -Action StartBackend -RuntimeApproved
pwsh -NoProfile -File ./scripts/finance-demo.ps1 -Action StartFrontend -RuntimeApproved
```

The migration command runs the existing `DatabaseMigrationTool` through the
packaged Java operator entry point, not the original startup/credential scripts.
Authentication and real API smoke checks must pass before any synthetic seeding.

## Stop and safe removal

```powershell
pwsh -NoProfile -File ./scripts/finance-demo.ps1 -Action Stop
```

Stop targets only recorded frontend/backend PIDs whose command lines identify
this workspace, and `pg_ctl` for the cluster with the matching ownership marker.
No global Java/Node/PostgreSQL process termination or service commands are used.
After stop, verify no owned processes/cluster remain and resolve the exact
workspace path before deleting only that folder. Keep the portfolio media/reports
outside `.cache`; never delete or move the original Finance Tracker repository.
The encrypted demo secrets, caches, source copy, logs and cluster are disposable.

## Scope held at checkpoint

Verification results: 405 frontend packages installed from the copied lockfile
with lifecycle scripts disabled; backend Maven package build succeeded with
`maven.test.skip=true`. No tests were executed. Both portable runtime version
checks succeeded; PowerShell syntax and the initialization approval guard passed.
All 253 original source hashes remain unchanged; zero `.env*` files were copied.
Machine-default `java` still resolves to `C:/Program Files/Java/jdk-17/bin/java.exe`.
Database initialization and every service start remain untested by design.

No initdb, createdb, PostgreSQL start, Flyway migration, Spring Boot/frontend
launch, user creation, data seeding, media capture or publishing has been executed.
The proposed portable-cluster strategy and the initialization/launch commands
require owner approval before use.
