# Content verification before publication

All seven projects are development drafts. Do not change a record to `published`
until its factual claims and media have been reviewed. The build rejects incomplete
published records. All review pages are `noindex, nofollow`.

- [x] Owner-approved resume exported from the supplied Word document to `public/resume/Darsh_Patel_Resume.pdf`, matching the default and example `VITE_RESUME_PATH=/resume/Darsh_Patel_Resume.pdf`. Hero, Ctrl+K and Footer download the same PDF; pending labels removed. PDF rendering, unchanged production copy and browser downloads verified locally. No deployment performed; certifications deferred.
- [ ] Owner-approved portrait and crop to replace `public/images/profile.webp` (labeled DP placeholder included).
- [x] Approved three-paragraph About Me biography recovered from the content review and added to `src/content/about.ts`.
- [x] Six approved Technical Skills categories populated and checked against the approved resume; full text grid and an 18-item constellation retained without proficiency claims.
- [x] Eight owner-verified timeline milestones sorted by start month, with October 2026 hackathons distinct, DH Precision/mechanical contract combined, expected June 2029 graduation, expanded coursework/high-school achievements and May 2027 co-op availability. No GPA or award claims added. Participation dates are independent of winner announcements.
- [x] Local content verification: 58 unit tests, 19 relevant browser checks across homepage/navigation/resume, lint, production build, built-site checks and isolated preview/public publication checks passed. Desktop/mobile screenshots reviewed; keyboard disclosures, line resizing/reverse scroll, reduced motion, 200% text and no-JavaScript content verified.
- [ ] Timeline hackathon case studies remain project drafts: links and existing small previews work in review builds and are withheld from public builds until project publication approval. Bluff House now uses a reviewed original gameplay preview.
- [x] Approved public/recipient email `darshpatel060106@gmail.com`, LinkedIn `darshpatel-dev` and GitHub `DarshP-Dev` wired into the site.
- [ ] Final owner review of source-backed case-study purpose, role, architecture, challenges and outcomes.
- [ ] Actual screenshots, video posters, captions and media permissions.
- [ ] Public repository, demo and deployment URLs; omit unavailable links.
- [x] Argus and DeenStudio contribution boundaries supplied by owner; Munadir credited in both.
- [x] DeenStudio technical scope reviewed; exporter verified as WebM, not MP4.
- [x] Supplied GitHub/Devpost links added; DeenStudio app and Argus replay URLs respond.
- [x] Interval explicitly excluded as someone else's project.
- [ ] Final team approval of Argus/DeenStudio copy and screenshots.
- [x] VisionControl implementation/media preflight and 65-second recording plan documented in `VISION_CONTROL_MEDIA.md`; dependencies/model checked offline, original source unchanged. Tracking-only access/capture is approved but paused because the owner is not ready yet; desktop input stays prohibited. No camera was enumerated; camera-consent metadata is Allow. No stream has been opened.
- [x] Captured six authentic 1920 × 1080 Finance Tracker screenshots, 24 responsive WebPs, poster, 67-second silent MP4, descriptive captions and contact sheet using only the approved synthetic runtime. See `FINANCE_TRACKER_MEDIA.md` and `docs/media/finance-tracker-capture.json`.
- [x] Owner visually approved the Finance Tracker screenshots/video; integrated six images, responsive variants, poster and captioned 67-second walkthrough into the existing editorial case study. Dashboard is the featured image; synthetic-data and disabled-provider limitations are preserved. Record remains draft pending factual/publication approval. Desktop/mobile media, video seeking/captions, keyboard/zoom and accessibility verified; 59 unit tests, 17 browser checks, lint, production build and publication checks passed.
- [x] Approved Finance Tracker runtime initialized exclusively at `127.0.0.1:15432/portfolio_finance_demo_1ad70246`; V1/V2 applied after empty-schema/identity checks. Real backend/frontend and synthetic API/UI smoke tests passed. See `FINANCE_TRACKER_RUNTIME_RESULTS.md`; approved media is integrated locally; factual and publication approval remain pending.
- [x] Prepared disposable Finance Tracker source/dependencies, portable Temurin Java 21 and PostgreSQL 17.11 binaries, isolated launcher and checkpoint report. Backend packaged with tests skipped; original source hashes unchanged. Runtime initialization and synthetic capture were subsequently approved and completed; see the runtime results and media report.
- [x] Established the isolated Finance Tracker runtime before capture; the approved portable tools and dedicated local database are documented in `FINANCE_TRACKER_RUNTIME_RESULTS.md`.
- [x] Finance Tracker source access rechecked at `C:/Users/Darsh/finance-tracker`; frontend/backend readable. See `MEDIA_ACCESS_AUDIT.md` for isolated demo prerequisites. The subsequent approved setup and runtime are documented separately; original source remains unchanged.
- [x] Bluff House: five original gameplay screenshots, responsive WebP variants, narrated two-minute demo, gameplay poster and aligned English WebVTT captions integrated locally; source hashes and capture context recorded in `docs/media/bluffhouse.json` and `BLUFF_HOUSE_MEDIA.md`. Source repository/media unchanged; record remains draft.
- [ ] Owner visual acceptance of Bluff House media, narration, captions and artwork permissions before publication.
- [x] Expanded Bluff House showcase with all 20 hash-verified numbered PNGs and 80 responsive WebP variants; five primary story images plus an eight-chapter on-demand gallery and contact sheet. Existing video/captions retained; missing poster restored from the original Blackjack capture. Final visual approval pending.
- [ ] Exact final RPG title and artwork credits; FSM role/circuit explanation review.
- [ ] Independent acceptance of DeenStudio generation/export and deployment boundaries; repository still includes a browser-direct key fallback.
- [x] Owner visual review of the signature prototype and hero handoff (Phase 2).
- [ ] Cold-load/first-paint review before enabling the homepage intro.
- [x] License/provenance checks for BubbleMenu, AccordionGallery and ProfileCard adapters (full license and notices preserved).
- [ ] Final visual review of Phase 3 orbit, gallery, light profile, populated skills/timeline and stacking with final assets; editorial timeline design retained.
- [x] Resend selected; secure Vercel function, live letter receipt, validation, spam controls and error/retry states prepared (Phase 5).
- [ ] Resend API key, verified sending domain/address, trusted origins and durable rate-limit credentials; see `CONTACT_SETUP.md`.
- [ ] Preview-host function verification and actual Gmail delivery/Reply-To acceptance test after configuration. Real delivery is not yet verified.
- [ ] Owner visual review of the Phase 5 paper letter, receipt, footer and portrait placeholder.
- [x] Eight route-specific social cards, responsive screenshot derivatives, guarded indexing and robots/sitemap generation prepared (Phase 6).
- [x] Local raw-HTML/asset verification and isolated preview/public publication tests.
- [ ] Owner review of share cards and existing source-media permissions before publication.
- [ ] Vercel project creation, GitHub integration and any deployment: explicitly deferred by owner; approval required.
- [ ] Verify the actual assigned Vercel default domain, set canonical origin, and later migrate to the approved custom domain.
- [ ] Preview-host routing/function/cache checks, actual social-crawler preview and production acceptance after deployment is authorized.

Never invent metrics, graduation dates, roles or project links. Student Works Canada
Production Manager is someone else's experience and must remain excluded.

Secrets belong in local/Vercel environment settings, never client-side `VITE_*`
variables. No email provider credentials are needed for Phases 1–4.
