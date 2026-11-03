# Personal Finance Tracker media review

Status: **owner visual review approved; media integrated locally; project remains draft**.
The owner approved the six screenshots and 67-second walkthrough. They are now connected to the existing Finance Tracker case study. Its shared editorial layout and navigation are preserved. Nothing was committed, pushed or deployed.

## Review files

- Contact sheet: `docs/media/finance-tracker-contact-sheet.jpg` (1920 × 1820).
- Local player with captions: `docs/media/finance-tracker-review.html`.
- MP4: `public/videos/projects/personal-finance-tracker/walkthrough-demo.mp4`.
- English descriptive captions: `public/videos/projects/personal-finance-tracker/walkthrough-en.vtt`.
- Poster: `public/images/projects/personal-finance-tracker/walkthrough-poster.webp`.
- Provenance, SHA-256 hashes, accessible descriptions and captions:
  `docs/media/finance-tracker-capture.json`.

Open the review HTML in a browser to review the player, captions and contact sheet.
The raw MP4 is silent; descriptive captions are supplied as a separate WebVTT track.
The editorial opening card discloses synthetic data and disabled external providers.

## Capture conditions and source

Captured November 2, 2026, using Playwright and installed Chrome, at a native
1920 × 1080 desktop viewport, device scale factor 1. PNGs are viewport captures,
without browser chrome, developer tools or simulated interface states. Fonts and
application animations were allowed to settle. No upscaling or artificial enhancement.

Original read-only source: `C:/Users/Darsh/finance-tracker`, revision
`04f335f3cbdb9371a1f8a85cd36c935c6c41c3ec`. All 253 recorded original source
hashes were rechecked and remain unchanged. The disposable copy alone has
`devIndicators: false` in Next configuration to hide its development overlay;
no application feature implementation was changed for capture.

Only the already-running workspace `C:/Users/Darsh/portfolio/.cache/finance-demo`
was used. Frontend: `http://localhost:13000`; backend: `127.0.0.1:18080`;
PostgreSQL: `127.0.0.1:15432/portfolio_finance_demo_1ad70246`.
No cluster initialization, schema migrations, new backend launch or production
connection occurred during this stage. Runtime setup/restart/stop details remain
in `FINANCE_TRACKER_RUNTIME_RESULTS.md` and `FINANCE_TRACKER_RUNTIME_CHECKPOINT.md`.

The existing fictional Alex Morgan account at `alex.morgan@example.test` was used.
Ten fictional historical records (one salary and one housing expense per month,
June–October) were created through implemented authenticated APIs to populate the
six-month trend. The recording then saved one $24.50 Dining expense at Demo Corner
Cafe through the actual form; the API returned the persisted record, and the UI
showed “Transaction added.” Final dataset: 25 transactions, five budgets, two
recurring schedules and two investment lots. No real financial records were used.
Screenshots were refreshed after the recorded save; the video starts before it.

Login occurs before recording in a nonrecording context. Session state stays in
memory; passwords, tokens, environment files and database credentials are not
included in media or public metadata. Capture routes allow only loopback ports
13000/18080. Zero external requests, failed application API requests or browser
page errors were observed in the successful capture runs. Gemini, Twelve Data and
recurring background jobs remain disabled by the previously verified runtime.

## Screenshot selection

All six original PNGs are preserved under
`public/images/projects/personal-finance-tracker/`.
Each has WebP derivatives at 480, 960, 1600 and 1920 pixels wide (16:9), quality 88.
There are 24 responsive variants plus a native-size WebP poster; combined WebP
size is approximately 873 KiB. Originals are not cropped or altered.

| Original | Content and framing |
| --- | --- |
| `01-dashboard.png` | Recommended hero: summary cards, year-to-date income/expense curve, expense concentration and recent activity. |
| `02-transactions.png` | Real entry form and management actions; visible filters select November 2 and amounts ≥ $50 so fictional income and expenses fit in the frame. |
| `03-analytics.png` | This Month summary, category breakdown, income/expense bars and six-month spending trend. |
| `04-budgets.png` | Five actual category budgets, recorded spending and progress; Dining includes the walkthrough expense. |
| `05-recurring.png` | Two actual monthly schedules, management actions and December 5 next occurrence dates. |
| `06-investments.png` | Two fictional holdings, purchase costs and explicit unavailable market prices/returns. |

All originals were visually inspected at native resolution. Text and charts are
sharp at that size. Dense desktop text will require enlargement on phones; the
small WebP variants are previews, not substitutes for full-resolution detail.
Some original pages intentionally leave whitespace. No fabricated content was
added to fill it. The contact sheet is a reduced-size review aid.

## Video and captions

Final video: **67 seconds, 1920 × 1080, 30 fps, H.264 High, yuv420p MP4,
fast-start metadata, no audio**. Exact byte count and hash are in the manifest.
Encoding used FFmpeg CRF 18. A three-second editorial disclosure card precedes
actual application footage. Initial authenticated loading was trimmed;
there are no fabricated clicks, responses or application frames. The first 54 seconds of application footage are continuous. The original closing take remained on a loading screen, so it was replaced with a separate authentic 10-second recording after the actual Investments cost basis and holdings were visibly loaded. This edit is a cut between real recordings, not a still-image simulation.

Approximate final-player timing:

| Time | Actual workflow |
| --- | --- |
| 00:00–00:03 | Synthetic-data and disabled-provider disclosure. |
| 00:03–00:13 | Dashboard overview. |
| 00:13–00:27 | Transactions; enter and save the fictional expense, then show its actual success and recalculated totals. |
| 00:27–00:37 | Analytics and charts. |
| 00:37–00:47 | Budget utilization, including updated Dining spending. |
| 00:47–00:57 | Recurring schedules and next dates. |
| 00:57–01:07 | Investments and recorded cost basis. |

Eight WebVTT description cues are synchronized to the actual settled scenes.
There is no narration or claim of live Gemini output. Authenticated raw recordings,
failed automation takes, scripts, private checks and intermediate frames stay in
Git-ignored `.cache/finance-demo/capture`; only the successful take was encoded.

## Technical limitations preserved honestly

- DEMO/SAMPLE tickers, purchase prices and holdings are fictional. Quote providers
  are disabled; market values, returns and allocation remain unavailable. No price
  refresh was triggered and no prices were invented.
- Financial insights are deterministic (`aiGenerated=false`), not live Gemini
  responses. The walkthrough does not open Chat or claim AI-generated advice.
- Creating a recurring schedule immediately records its first occurrence. The
  previously seeded November 5 records are recorded transactions, even though
  future-dated relative to capture day. December 5 dates shown are next occurrences.
  Scheduler execution itself is not demonstrated.
- Dashboard defaults to the full year; Analytics defaults to November 1–2. Their
  totals differ because their visible reporting periods differ. Budgets cover the
  full selected month; Transactions screenshot uses visible narrower filters.
- Native application rendering and calculations are retained. This stage verifies
  capture authenticity and successful expense persistence, not a financial audit.

## Integration and approval boundary

Owner visual approval covers all six screenshots and the 67-second demonstration
video. `src/content/project-stories.ts` now provides six images and one video to
the existing shared MediaGallery. The first image, `01-dashboard.png`, is the
featured image for the case study and homepage project previews.
`src/content/image-variants.json` registers all 24 existing WebP derivatives.

The gallery retains its native video controls, lazy video loading, poster, default
English WebVTT descriptions, keyboard selection, modal viewer, zoom, focus return,
touch navigation and no-JavaScript original-file links. No styling or navigation
components were rewritten. The case-study summary, media captions and demonstration
note disclose synthetic data, disabled quotes and deterministic insights. The
recurring first-occurrence behavior is documented explicitly. Obsolete missing-media
copy was removed; role, outcomes and publication requirements remain pending.

The original capture checks passed: six native PNG decodes/dimensions, 24 responsive
WebP decodes/dimensions, poster/contact-sheet loading, complete video decode (2010
frames), playback/seeking, caption timing and standalone review-page layouts.
All 253 original application source hashes remained unchanged after capture.
No original application source is modified by this portfolio integration.

Integration verification passed: all six images loaded from optimized WebP sources at desktop (1440 px) and mobile (390 px); the 67-second MP4 played and sought to the actual Investments scene; all eight default caption cues loaded. Keyboard selection, image enlargement/zoom, Escape/focus return, video viewer, reduced motion and overflow checks passed. Automated WCAG A/AA checks reported zero violations. The existing shared case-study regression suite also verified 320 px reflow, text zoom, navigation and no-JavaScript content.

The local preview server now supports video byte-range requests, correcting a verified seek-to-start issue. Explicit tests cover leading, suffix and open-ended ranges plus unsatisfiable ranges. This changes only portfolio preview serving, not the Finance Tracker application or deployment configuration.

Final checks: **59 unit tests, 17 relevant browser tests, lint, production build, built-site checks (9 documents / 111 local references), and preview/public publication checks passed**. The public build excludes the Finance Tracker draft route, images, derivatives, video, captions and disposable workspace. All six screenshot hashes, the approved video hash and all 253 recorded original application source hashes were reverified unchanged.
The project remains **draft**. Media approval does not approve its personal role,
contribution boundaries, outcomes, final public copy or a deployment URL. Public
publication builds must continue excluding the draft route and its media assets.
