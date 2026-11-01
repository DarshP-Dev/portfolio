# Darsh Patel — portfolio foundation

The approved portfolio foundation: React, strict TypeScript, Vite, Tailwind,
React Router, and locally served Geist / Inter / JetBrains Mono variable fonts.
Phase 2 adds accessible navigation and a review-only signature intro prototype.
This is a review build, not a completed public portfolio.

## Development

Use Node 24 and npm 11 (the versions used to verify this checkout).

```sh
npm ci
npm run dev
```

The development server uses client rendering. Production builds prerender the
homepage, every included project route, and the custom 404 with the same React
components and content, then hydrate in the browser. JavaScript is not required
to read the generated pages or follow their links.

```sh
npm run build
npm run preview
```

Preview serves `dist` at `http://127.0.0.1:4173` with real HTTP 404 responses,
without rewriting unknown paths to the homepage. Stop it with Ctrl+C.

## Content and configuration

- `src/content/projects.ts`: seven draft records; shared listing, route and build data.
- `src/content/site.ts`: approved hero copy, anchors and pending owner links.
- `src/content/skills.ts` and `timeline.ts`: structure awaiting verified facts.
- `src/index.css`: approved light tokens, typography and responsive styling.
- `src/entry-server.tsx` / `scripts/build.mjs`: finite-route static generation.
- `CONTENT_TODO.md`: owner-supplied inputs and publication requirements.

Copy `.env.example` to `.env.local` if configuration is needed. `VITE_SITE_URL`
is an optional verified origin for canonical/OG URLs; no domain is invented.
`VITE_INCLUDE_DRAFTS=false` hides draft/reviewed projects from navigation and
static output, and makes their client routes show the not-found page. Its default
is true for this review phase. Client and server builds read the same Vite mode.
Use `BUILD_MODE` to select another mode for both builds together.

All review HTML carries `noindex, nofollow`; `robots.txt` disallows crawling.
Public indexing, sitemap and final social images belong to Phase 6. The contact
form, homepage orbit/stacking, and full case studies remain later phases.
Unknown resume/social/email URLs are shown as pending, not links.
`published` records fail validation if required content/media is missing or TODOs
remain. This check does not replace owner review of factual accuracy.

Never put secrets in a `VITE_*` variable: those are included in browser code.
No credentials are needed for this phase.

## Phase 2 review

The DP brand and native disclosure menu work without JavaScript. With JavaScript,
menu pills animate subtly, Escape/outside click closes them, and selecting a
section routes to the right anchor and focuses it. Header height is observed so
anchors remain visible when navigation wraps or text grows.

Search opens a native modal command palette. Use the visible Search button or
Ctrl+K / Cmd+K, type to filter, arrow keys to select, Enter to navigate, or Escape
to close. Focus returns to its trigger on dismissal; navigation moves it to the
destination. Shortcuts leave editable fields and other active dialogs alone.
Draft projects appear only in review mode and are explicitly labeled. Unavailable
resume/social/email actions are omitted rather than invented.

Open `http://127.0.0.1:5173/?intro=preview` during development to review the intro.
Use **Replay intro** to watch again. It follows a custom cursive DP trace, connected
spiral, ink ball, Geist name morph, and measured handoff into the actual hero.
The current static project index reveals at the end; screenshot orbit/carousel
work belongs to Phase 3. Skip Intro/Escape, reduced motion, session storage
failure, changed motion preference, resize and a stalled-dependency deadline all
return to usable content. No animation or overlay is included in prerendered HTML.

The homepage entry animation stays **off pending owner visual approval**, as
planned. `VITE_ENABLE_SIGNATURE_INTRO=false` is the default. The preview banner
is available only when drafts are enabled and the query is `intro=preview`.
Once approved, activation still needs a cold-load/first-paint review before
changing that flag. No new credentials or project images are needed for this
prototype. A preferred handwritten DP can replace the custom path after review.

`npm run generate:intro` regenerates the name SVG data from the matching Geist
500 font, with the hero's tracking and line-height. The parser and static font
are build-only dependencies; normal builds use the checked-in generated paths.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npm run format:check
npm run build
npm run test:e2e
```

Browser tests use installed Google Chrome via Playwright. If Chrome is absent,
install it or change the Playwright project to an installed Chromium distribution.
They exercise hydration, route/anchor focus, direct HTML without JavaScript,
keyboard skip navigation, accessibility scans, light appearance under a dark
browser preference, and overflow at 320–1440px. Unit tests cover publication
boundaries, unsafe links, invalid routes and server-rendered content/metadata.
Phase 2 tests add menu/no-JS behavior, command filtering and modal focus,
editable/modal shortcut guards, text zoom, ordered intro stages, mobile handoff,
session/skip/reduced-motion logic and animation failure recovery. Screenshots and
an intro recording are written to ignored `.cache/phase2` during browser checks.

## Vercel (prepared, not deployed)

`vercel.json` uses `npm run build`, serves `dist`, and enables clean URLs.
Static `/projects/<slug>/index.html` documents provide each route's own response
HTML. `404.html` supplies the error page; no catch-all homepage rewrite masks
missing paths. Verify actual preview-host behavior before production in Phase 6.
The server render bundle in `dist-ssr` is a build tool and is not deployed.

Font licenses ship in `public/font-licenses`. The React Bits navigation adapter's
upstream license is in `public/third-party`; see `THIRD_PARTY_NOTICES.md`.

Current npm audit reports 12 moderate findings in the existing lint-tool chain,
through minimatch. npm proposes breaking/downgrade changes rather than a safe
patch. No forced audit fix is applied as part of the portfolio foundation.
