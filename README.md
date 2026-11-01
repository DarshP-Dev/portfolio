# Darsh Patel — portfolio foundation

The approved portfolio foundation: React, strict TypeScript, Vite, Tailwind,
React Router, and locally served Geist / Inter / JetBrains Mono variable fonts.
Phase 2 adds accessible navigation and a review-only signature intro prototype.
Phase 3 adds responsive homepage interactions and native desktop section stacking.
Phase 4 adds the shared editorial case-study system and source-backed project drafts.
Phase 5 adds the correspondence letter, live receipt, footer links and prepared
server-side Resend integration. Delivery remains disabled pending configuration.
Phase 6 prepares publication controls, social cards, responsive image delivery,
stronger quality checks and Vercel deployment instructions. Hosting is deferred
at the owner's request; the portfolio is not live.
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
- `src/content/site.ts`: approved hero copy, anchors, public links and asset paths.
- `src/content/skills.ts` and `timeline.ts`: structure awaiting verified facts.
- `src/index.css`: approved light tokens, typography and responsive styling.
- `src/entry-server.tsx` / `scripts/build.mjs`: finite-route static generation.
- `CONTENT_TODO.md`: owner-supplied inputs and publication requirements.
- `CONTACT_SETUP.md`: server-only email configuration, delivery checks and asset replacement.
- `DEPLOYMENT_READINESS.md`: future Vercel settings, publication gates and configurable resume path.

Copy `.env.example` to `.env.local` if configuration is needed. `VITE_SITE_URL`
is an optional verified origin for canonical/OG URLs; no domain is invented.
`VITE_INCLUDE_DRAFTS=false` hides draft/reviewed projects from navigation and
static output, and makes their client routes show the not-found page. Its default
is true for this review phase. Client and server builds read the same Vite mode.
Use `BUILD_MODE` to select another mode for both builds together.

All review HTML carries `noindex, nofollow`; `robots.txt` disallows crawling.
Review builds remain noindex. `VITE_SITE_INDEXABLE=true` requires a verified HTTPS
origin and `VITE_INCLUDE_DRAFTS=false`; preview deployments stay noindex regardless.
Canonical/OG tags use the configured origin, with a distinct share card for each
project. The build generates the matching robots file and sitemap; review sitemaps
are empty. Case studies remain development drafts until final content, media and
ownership review is complete.
The approved GitHub, LinkedIn and public email are active. Resume downloads stay
pending until the approved PDF is added at the documented path and rebuilt.
`published` records fail validation if required content/media is missing or TODOs
remain. This check does not replace owner review of factual accuracy.

Never put secrets in a `VITE_*` variable: those are included in browser code.
No credentials are needed to review the site. Actual contact delivery requires
the server settings documented in `CONTACT_SETUP.md` and is not yet verified.

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
The project orbit/mobile row reveals at the end. Skip Intro/Escape, reduced motion, session storage
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

## Phase 3 review

`src/components/home` contains the homepage interactions and scoped styles:

- Five upright project previews orbit once every 36 seconds on wide screens.
  Pause/Resume, hover, keyboard focus, open dialogs, covered/offscreen state and
  hidden tabs stop the loop. Phones/tablets get a native scroll-snap row with
  Previous/Next controls and no autoplay.
- The React Bits gallery adaptation expands on desktop hover/focus, with direct
  first-click links. Touch, narrow and reduced-motion layouts use static cards.
  More Projects stays immediately below the gallery.
- The light ProfileCard has a one-time viewport foil sweep and six-degree mouse
  tilt. Touch/reduced motion is static. The DP placeholder explicitly awaits the
  owner's portrait and makes no availability claim.
- The skills map highlights category connections; the complete semantic grid
  follows it. `SkillTechnology` supports approved local logo assets and readable
  names. Empty categories remain pending; draft technologies are not proficiency
  claims. The constellation is replaced by the grid on narrow/reduced layouts.
- `JourneyTimeline` accepts verified dates, optional years, detail paragraphs and
  real preview images. Native named disclosures allow one entry open at a time,
  including without JavaScript. ResizeObserver keeps the progress line attached
  after disclosures resize. With no verified entries, only a pending milestone
  and the approved “What’s Next?” closing appear.
- Desktop section wrappers use natural heights and CSS sticky positioning. Tall
  sections scroll fully before their trailing edge sticks; the next section
  overlays as the previous recedes to 0.98 scale. Focus releases stacking so links
  and disclosures stay reachable. Tablet, touch, reduced motion and case studies
  use normal flow. No wheel/touch interception or synthetic scrolling is used.

The approved intro choreography is unchanged. Real screenshots, the portrait,
skills/logos and resume dates are still required for final visual/content review.
No email credentials are needed until Phase 5, and nothing has been deployed.

## Phase 4 review

All seven project routes use `CaseStudy`: introduction and real external links,
media, snapshot/contributions, challenge, solution, architecture, engineering
decisions, results/next steps and continue-exploring navigation. Technical deep
dives use native disclosures. An optional architecture map highlights components
while retaining every explanation in readable HTML.

`src/content/project-stories.ts` contains repository-backed drafts, separate from
the shared project types and publication filtering. `PROJECT_SOURCES.md` records
the exact source revisions, media provenance, owner-confirmed team roles and
unresolved review items. Argus/DeenStudio credit Munadir's work explicitly.
Interval is excluded. DeenStudio's implemented export is WebM; MP4 is not claimed.
Only genuine GitHub, supplied Devpost and verified relevant app/demo URLs appear.

The media viewer has previous/next and direct selection, captions, native video
controls, a modal with Escape/backdrop close and focus restoration, and a scrollable
image zoom. Swipe supplements visible controls. Videos start muted without
autoplay and pause when moving into/out of the modal. Failed media has a recovery
state. SSR/no-JS retains the first asset, native video controls and links to the
remaining originals. No sample product videos are shipped.

Homepage project links capture position and source focus. Back to Projects and
browser Back restore them, including after a case-study refresh; a width change
returns to the source card. Session storage is optional with an in-memory fallback.
Directly opened cases return to `/#projects`. Next Project preserves the origin
and only cycles through currently visible records. Case pages use native scrolling.

Response HTML contains each case's own title, description and article metadata.
When `VITE_SITE_URL` is a verified origin, real image metadata also gets absolute
Open Graph/Twitter URLs, dimensions and alt text. The default review build omits
unconfigured image URLs and remains `noindex`; no canonical domain is invented.

Original media stays available in the viewer. The Windows helper
`./scripts/generate-project-previews.ps1` produces smaller JPEG homepage previews.
Final screenshots for Finance Tracker and Bluff House, final wording/asset credit
review, and independent application acceptance remain pending.

## Phase 5 review

The paper letter uses native labeled controls, a conditional Other subject,
inline errors and a focusable error summary. Its clipped receipt follows the
same form values: category, reply address, filing label and truthful readiness
state. On phones it sits above the fields; on desktop it offsets at the top-right
without covering controls. The decorative barcode contains no tracking data.
Only a successful server/provider response adds SENT, the actual reference and
the server confirmation timestamp. Failed and ambiguous requests retain the
draft, and pending submission locks prevent duplicates.

`api/contact.ts` handles delivery on Vercel; `server/contact-handler.ts` shares
validation with the UI and adds origin checks, body limits, a honeypot, durable
rate limiting and provider idempotency. API keys stay server-side. Local dev and
built preview expose the endpoint but disable real delivery by default. See
[CONTACT_SETUP.md](CONTACT_SETUP.md) for the outstanding provider/domain setup
and the deliberate delivery test required before claiming Gmail delivery works.

The footer displays the approved email with a working Copy Email control plus
real GitHub/LinkedIn links. The ProfileCard uses the labeled WebP monogram at
`public/images/profile.webp`. No final portrait or resume is published. Resume
links activate after an approved PDF is added at
`public/resume/Darsh_Patel_Resume.pdf` (or the approved filename configured through
`VITE_RESUME_PATH`) and the site is rebuilt.

## Phase 6 review

All existing project screenshots now have authored responsive WebP derivatives;
originals remain available as fallbacks and for source inspection. The summed
full-size WebP files are 76% smaller than the 11 source PNGs. The browser selects
appropriate sizes for hero cards, the gallery and case studies. The first real
hero image and the initial case-study image load eagerly; other previews, the
portrait and offscreen media remain deferred. Videos retain `preload="none"`.

Eight neutral 1200 × 630 social cards use project titles, verified copy and existing
screenshots where available. `npm run generate:media` regenerates these assets
locally after `npm run build`; deployment builds need no Chrome. Existing source
credit and media approval requirements still apply to these derivatives.

Accessible DP/Menu labels include their visible words, and placeholder project
links retain both their visible status and title. Phase 6 checks include WCAG 2.1
label-in-name coverage, forced colors, 320px reflow, actual responsive downloads,
raw response metadata, share-card dimensions, draft exclusion and crawler policy.
See `QUALITY_REVIEW.md` for local measurements and the limits of automated review.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npm run format:check
npm run build
npm run check:build
npm run check:publication
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
Phase 3 adds orbit pause/upright/collision checks, first-activation gallery routes,
mobile row controls, profile/skills fallbacks, timeline resize/progress, long
section reachability, 200% text reflow and no-JS homepage checks. Review screenshots
are written to `.cache/phase3`. Browser tests exercise the built output; rebuild
after source changes before running them.
Phase 4 tests cover media selection/zoom/focus, controlled video and failure paths,
source/credit guards, return restoration, direct/no-JS cases, and responsive
accessibility. A second loopback-only Vite server serves `tests/fixtures/media`
on port 4177 (`FIXTURE_PORT` can override it). That fixture is excluded from the
production entry and output. Its silent one-frame test video lives only in the isolated test fixture.
Case-study screenshots are saved in ignored `.cache/phase4`.
Phase 5 checks cover shared field validation, server configuration/origin/IP
boundaries, hashed atomic rate limiting, Reply-To and provider idempotency,
confirmed/failed/ambiguous receipts, duplicate submission locks, draft retention,
keyboard errors, no-JS fallbacks, real clipboard behavior, portrait failure,
responsive receipt placement and 200% text. Mocked delivery tests never send mail.
Review screenshots are saved in ignored `.cache/phase5`.
Phase 6 adds publication/asset unit tests and `quality.spec.ts`. The build checker
validates generated pages and client/server boundaries. Publication test builds
use reserved fixture origins inside ignored `.cache/phase6`, with no deployment
or changes to the normal build settings. Live link checking is a separate explicit
`npm run check:links` command. Lighthouse reports and QA notes live in `.cache/phase6`.

## Vercel (prepared, not deployed)

`vercel.json` uses `npm run build`, serves `dist`, and enables clean URLs.
Static `/projects/<slug>/index.html` documents provide each route's own response
HTML. `404.html` supplies the error page; no catch-all homepage rewrite masks
missing paths. Verify actual preview-host behavior before production in Phase 6.
The server render bundle in `dist-ssr` is a build tool and is not deployed.
Vercel also deploys the Node function in `api/contact.ts`; static-only hosting of
`dist` does not provide the email endpoint. Its deployed runtime and actual email
delivery still need the checks in `CONTACT_SETUP.md`.

Font licenses ship in `public/font-licenses`. The React Bits adapters'
upstream license is in `public/third-party`; see `THIRD_PARTY_NOTICES.md`.

The Phase 6 production dependency audit reports no advisories. Tooling dependencies
are reviewed separately; no forced breaking dependency changes are applied.
