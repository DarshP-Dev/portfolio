# Content verification before publication

All seven projects are development drafts. Do not change a record to `published`
until its factual claims and media have been reviewed. The build rejects incomplete
published records. All review pages are `noindex, nofollow`.

- [ ] Latest resume PDF and intended filename.
- [ ] Owner-approved portrait and crop.
- [ ] Verified biography, program wording, skills, education and experience dates.
- [ ] Exact public email, recipient address, LinkedIn and GitHub profile URLs.
- [ ] Each project's purpose, role, stack, architecture, challenges and outcomes.
- [ ] Actual screenshots, video posters, captions and media permissions.
- [ ] Public repository, demo and deployment URLs; omit unavailable links.
- [ ] Argus team credit, exact contribution boundaries and permitted assets.
- [ ] DeenStudio description and technical scope.
- [ ] Exact RPG title/implementation and FSM implementation/testing details.
- [x] Owner visual review of the signature prototype and hero handoff (Phase 2).
- [ ] Cold-load/first-paint review before enabling the homepage intro.
- [x] License/provenance checks for BubbleMenu, AccordionGallery and ProfileCard adapters (full license and notices preserved).
- [ ] Owner review of Phase 3 orbit, gallery, light profile, category map, timeline and stacking with final assets.
- [ ] Email provider, authenticated sender domain, server-side credentials (Phase 5).
- [ ] Verified canonical domain and project-specific OG images (Phase 6).

Never invent metrics, graduation dates, roles or project links. Student Works Canada
Production Manager is someone else's experience and must remain excluded.

Secrets belong in local/Vercel environment settings, never client-side `VITE_*`
variables. No email provider credentials are needed for Phases 1–3.
