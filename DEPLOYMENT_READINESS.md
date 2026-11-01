# Vercel deployment preparation

**Local preparation only.** The owner confirmed there is no Vercel project or
GitHub deployment integration yet. Project creation, integration, deployment and
further pushes require owner approval. There is no live portfolio URL to report.
The plan is to use an assigned Vercel default domain first, then add a custom
domain later. Neither is invented or configured by this implementation.

## Build and hosting settings

When deployment is approved, use the existing `DarshP-Dev/portfolio` repository
and its root directory with these settings:

| Setting          | Prepared value                                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- |
| Framework        | Vite                                                                                                             |
| Node             | 24.x, declared in `package.json`                                                                                 |
| Install          | `npm ci`                                                                                                         |
| Build            | `npm run build`                                                                                                  |
| Static output    | `dist`                                                                                                           |
| Contact function | `api/contact.ts`, Node Web Request/Response handler                                                              |
| Route behavior   | Generated `/index.html`, `/projects/<slug>/index.html`, custom `/404.html`; clean URLs; no catch-all SPA rewrite |

The build first produces client assets, then uses its temporary `dist-ssr` bundle
to prerender complete route HTML. `dist-ssr` is not the web output. A successful
local build does not verify Vercel's routing or function runtime; check those on
a real preview after the owner approves deployment. Node 24 is a supported
[Vercel runtime version](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).

`vercel.json` also configures MIME-sniff protection, referrer policy, unused
camera/microphone/location restrictions and immutable caching for hashed
`/assets/*` files. The local built preview mirrors these headers for QA; the
API keeps its own `no-store` response. Unversioned images/resume files do not
receive year-long immutable caching. `.vercelignore` excludes local environment
files, caches, old build outputs and handoff archives from future CLI uploads.

## Review and publication settings

The defaults stay in review mode. Set environment variables in the appropriate
Vercel environment only after its project exists. Public `VITE_*` settings are
compiled into browser code; never put provider keys or recipient secrets there.

| Variable                      | Review default / future use                                                                                                                                                      |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_INCLUDE_DRAFTS`         | `true` for local review. Use `false` for public release so only owner-approved `published` project records are included.                                                         |
| `VITE_SITE_INDEXABLE`         | `false`. Explicitly set `true` only after publication approval and the prerequisites below.                                                                                      |
| `VITE_SITE_URL`               | Blank until the actual assigned Vercel HTTPS origin is known and verified. Then use that exact origin without a path; later update it to the verified custom domain and rebuild. |
| `VITE_ENABLE_SIGNATURE_INTRO` | `false` pending cold-load/first-paint acceptance. The approved choreography remains available in local review via `?intro=preview`.                                              |
| `VITE_RESUME_PATH`            | `/resume/Darsh_Patel_Resume.pdf` by default. Change to another approved filename directly under `/resume/` if needed.                                                            |
| `CONTACT_ENABLED`             | `false` until all server-only email settings and the actual delivery check in `CONTACT_SETUP.md` are complete.                                                                   |

Indexable builds require an HTTPS origin and `VITE_INCLUDE_DRAFTS=false`; unsafe
requests to enable indexing fail the build. Vercel preview/development builds
always stay noindex, including when they inherit a production indexing flag.
The unknown-route page always remains noindex and has no canonical/share image.

Every included route has its own response-HTML title, description and social
metadata. Canonical and absolute social-image URLs appear only with a configured
origin. Eight generated 1200 × 630 PNG share cards live in `public/og`; each
project has its own title and real project image where available. Projects with
no supplied screenshot use the neutral DP identity. They are not fake app images.

Review builds emit `robots.txt` with `Disallow: /` and an empty XML sitemap.
Approved indexable builds emit a sitemap containing the homepage plus published
project routes only, with no invented modification dates. The configured origin
must be the real production site, not a temporary preview URL. No current project
has been silently promoted from draft to published.
The static asset copy follows the same inclusion list: excluded project
screenshots, derivatives and share cards do not ship in public output. Only the
configured available resume is copied; unrelated or older PDFs are omitted.

## Approved resume and media

The older resume has not been copied or published. Add only an approved PDF to
`public/resume/`. To keep the filename `Darsh_Patel_Resume_Final.pdf`, set:

```dotenv
VITE_RESUME_PATH=/resume/Darsh_Patel_Resume_Final.pdf
```

Alternatively, use the reserved default filename. The file must exist at the
configured path and have a PDF signature; rebuild/restart Vite afterward. Hero,
footer and command-palette links activate together. The check establishes file
availability, not owner approval or freshness. Until then, pending labels remain.
No fake PDF is generated by tests or build tooling.

The portrait is still the labeled placeholder at `public/images/profile.webp`.
For approved project image changes, rebuild the SSR tooling and regenerate local
responsive derivatives/share cards with `npm run generate:media`, then rebuild
the site and inspect the outputs. The generator uses local Chrome and existing
assets only; Vercel builds consume checked-in derivatives and need no browser.
Source screenshots and their existing credit/provenance records are preserved.

## Local verification commands

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run format:check
npm run build
npm run check:build
npm run check:publication
npm run test:e2e
npm run check:links
npm audit --omit=dev --audit-level=high
```

`check:build` validates prerendered documents, local asset/link references,
crawler output and the server/client boundary. `check:publication` creates
isolated preview/public test builds in ignored `.cache/phase6` with an explicitly
reserved `.example` fixture origin. It verifies raw canonical/OG tags, preview
noindex overrides, draft exclusion and 404 rules. It does not change normal
environment files, deployment settings or the normal `dist` build.

`check:links` checks public HTTPS URLs and records status codes in
`.cache/phase6/link-check.json`. Access-controlled/bot-blocked pages require manual
review; HTTP success alone does not certify project functionality or ownership.
Browser tests use mocked contact outcomes and never send email. Run only one
Playwright test process at a time because runners share the artifact directory.

## Later preview-host acceptance

After explicit approval to create/connect/deploy the project, verify:

- HTTPS at the assigned real domain; then configure its canonical origin and rebuild.
- Direct refresh of every included project path, correct raw metadata/share image,
  clean-URL redirects, real HTTP 404s and the intended robots/sitemap policy.
- Headers and hashed-asset caching on the hosted responses; updated HTML/assets
  remain compatible after a new deployment.
- The contact GET reports unavailable while disabled, and unconfigured POST cannot
  send. Configure Resend, the authenticated sender, trusted origins and rate storage
  separately; confirm actual Gmail delivery and Reply-To before enabling public send.
- The website can initially use a Vercel default domain. Resend still needs its own
  authenticated sending-domain setup; a default website domain does not complete it.
- Approved resume download, portrait, project assets/captions/credits, true biography,
  skills and timeline. Manual keyboard, screen-reader and real-device review remain
  part of final acceptance; local automation cannot certify those environments.

Public indexing, final content approval and production release remain deliberate
owner decisions. See `CONTENT_TODO.md` for the outstanding inputs.
