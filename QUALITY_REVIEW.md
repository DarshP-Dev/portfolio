# Phase 6 local quality review

Reviewed on **1 November 2026**. The portfolio is a local review build with
draft project content, no live deployment, and email delivery disabled. Vercel
creation, integration, deployment and further pushes are deferred by the owner.
These results do not certify a hosted site, actual inbox delivery or real-device
field performance.

## Changes and evidence

- Prerendered HTML and browser navigation share metadata/publication settings.
  Unknown routes stay noindex with no invented canonical. Review builds have an
  empty sitemap; published-only builds generate appropriate crawler files.
- Isolated public/preview build checks use a reserved `.example` test origin and
  verify absolute canonical/OG tags in raw HTML, preview noindex overrides, hidden
  drafts, 404 metadata and sitemap exclusion. No real origin has been configured.
  Asset copying also excludes hidden draft screenshots/share cards and copies only
  the configured available resume; unrelated or older PDFs stay out of build output.
- Eight PNG social cards are 1200 × 630, use the approved visual identity and have
  distinct project titles. Existing screenshots appear where available, without
  inventing product imagery for missing projects. Owner/media approval is still
  required before public release.
- Eleven real screenshots have responsive WebP candidates with original PNG
  fallbacks retained. Original files total 4,651,802 bytes; full-size WebP versions
  total 1,129,156 bytes, a 76% reduction. Candidates at about 960px total 569,172
  bytes. These are sums across files, not claims about a single page's payload.
- Hero/gallery/case-study images provide `srcset` and appropriate `sizes`.
  The first real hero visual and initial case-study image are eager; subsequent
  previews, portrait and other offscreen media remain lazy. Videos do not autoplay
  and keep `preload="none"`. The optional morph plugin remains a separate lazy
  chunk; the approved animation choreography is unchanged.
- Accessible names for DP, Menu and placeholder project links include their
  visible labels. Explicit DOM spacing keeps adjacent status/title text coherent
  for accessibility tooling and voice input. No visual redesign was introduced.
- The local preview mirrors prepared response/cache headers. Build output checks
  verify local references, crawler consistency and the absence of server/provider
  configuration or test directories from the browser output.

## Local mobile Lighthouse results

Lighthouse **13.6.0**, installed Chrome, default simulated-mobile settings,
headless, built output served on loopback. Each row is one lab run with the
normal intro disabled. Reports are in ignored `.cache/phase6/`.

| Page             | Performance | Accessibility | Best practices |  LCP |   CLS | Total blocking time |
| ---------------- | ----------: | ------------: | -------------: | ---: | ----: | ------------------: |
| Homepage         |         100 |           100 |            100 | 1.1s | 0.001 |                50ms |
| Argus case study |         100 |           100 |            100 | 1.1s | 0.003 |                 0ms |

SEO scores are **66** because review HTML deliberately has `noindex, nofollow`
and robots disallows crawling. The only remaining binary Lighthouse failure in
both final reports is `is-crawlable`. Indexing was not enabled to improve a score.
The raw canonical/OG behavior for a configured origin is verified separately by
`npm run check:publication`.

Reports: `.cache/phase6/mobile-home.report.html` / `.json` and
`.cache/phase6/mobile-argus.report.html` / `.json`. Initial lab results also live
in `baseline-home.report.*`; final measurements above follow the asset/label work.
These are local simulated results, not 75th-percentile Core Web Vitals. INP was
not measured by this navigation audit; TBT is reported as TBT. A physical phone,
hosted network/cache conditions, social crawlers and cold first-entry animation
still need their own acceptance checks.

## Test coverage

The existing regression suite retains intro ordering/skip/session/failure paths,
orbit/gallery interactions, section stacking, route focus/return restoration,
media controls, no-JS content and contact success/error/retry safeguards.

Phase 6 adds unit tests for canonical/filename validation, preview and public
configuration, sitemap filtering, real share-card dimensions and derivative
assets. Browser checks cover actual WebP selection and download size, source
fallback URLs, raw review HTML/headers, served social cards, WCAG 2.1 labels and
contrast at 1440px/390px, and forced-color keyboard use at 320px. A 320 CSS-pixel
viewport models the reflow width of a 1280px desktop at 400% page zoom; it is not
a claim that every OS/browser zoom setting was manually exercised. Existing
tests also cover 200% text and 320–1440px layouts.

Automated checks supplement manual review. Native headings, landmarks, labels,
live statuses and keyboard focus paths were inspected through the browser tests;
a full NVDA/VoiceOver session and physical touch-device review remain pending.

## External links and dependencies

`npm run check:links` checked **32** distinct public project/source/profile URLs:
**31** returned successful HTTP responses. LinkedIn returned **999**, an automated
access restriction. Its exact owner-supplied URL remains unchanged and requires
normal-browser review; it is not treated as an invented or definitively broken
link. Results and redirect destinations are in `.cache/phase6/link-check.json`.
HTTP success does not establish that a deployed project implements every feature.

`npm audit --omit=dev --audit-level=high` reported **zero production advisories**.
No forced dependency upgrades/downgrades were applied. Browser media came from
the existing local project materials; no new external images were downloaded.

## Acceptance still requiring owner assets or hosting

Use `DEPLOYMENT_READINESS.md` for future Vercel configuration and checks. Actual
preview/production deployment, a verified canonical origin, external social-card
debugging, the approved resume/portrait/content, source-media approvals, full
screen-reader/real-device review and authenticated end-to-end Gmail delivery are
still outstanding. No Vercel project or live URL was created for this review.
