# Project sources and review boundaries

Phase 4 source review: 2026-11-01. All seven records remain **drafts**.
Repository inspection verifies the described implementation, not a personal role,
production availability, test pass count, or measured performance. Those are only
stated when separately supported. No other project repository was modified.

| Project                  | Inspected revision                         | Primary implementation sources                                                                                                                                                                                                          |
| ------------------------ | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Personal Finance Tracker | `04f335f3cbdb9371a1f8a85cd36c935c6c41c3ec` | [README](https://github.com/DarshP-Dev/finance-tracker/blob/04f335f3cbdb9371a1f8a85cd36c935c6c41c3ec/README.md), frontend package.json, backend pom.xml, AuthService.java and RecurringTransactionService.java                          |
| VisionControl            | `f5b22b0e48875ccd4ef9c09e40dba82532f275f3` | [README](https://github.com/DarshP-Dev/VisionControl/blob/f5b22b0e48875ccd4ef9c09e40dba82532f275f3/README.md), hand_tracking/README.md, requirements.txt, controls/safety.py                                                            |
| Bluff House              | `f7f168509759de099f2b862e3a6142a5f89855b0` | [README](https://github.com/DarshP-Dev/BluffHouse/blob/f7f168509759de099f2b862e3a6142a5f89855b0/README.md), docs/architecture.md, root/web/server package.json                                                                          |
| Argus                    | `dac51af9e9624848bc453d418d8d908c8d0f4ca9` | [README](https://github.com/munadirkhan/Argus/blob/dac51af9e9624848bc453d418d8d908c8d0f4ca9/README.md), extension/README.md and manifest.json, core/sensors/terminal_log.py, docs/worklog/WEB.md, web/package.json, web/src/lib/mode.ts |
| DeenStudio               | `b239eed55a68e387ce0db20949061c8d8313ac4c` | [App.jsx](https://github.com/munadirkhan/DeenStudio/blob/b239eed55a68e387ce0db20949061c8d8313ac4c/src/App.jsx), README.md, api/generate-image.js, [Devpost](https://devpost.com/software/deenstudio)                                    |
| Pokémon-style RPG        | `24ac506d72607e570bc22f2812b592c9e224b459` | [README](https://github.com/DarshP-Dev/pokemon-style-rpg/blob/24ac506d72607e570bc22f2812b592c9e224b459/README.md), src/map/GamePanel.java, src/map/CollisionChecker.java and screenshots/                                               |
| FSM Sequence Detector    | `5036d385ca70bd0c21be96a3b0ac8016695aaaf1` | [README and artifacts](https://github.com/DarshP-Dev/fsm-sequence-detector/tree/5036d385ca70bd0c21be96a3b0ac8016695aaaf1), state table, waveform and cost comparison                                                                    |

## Owner-confirmed contributions

The owner supplied the team contribution boundaries during Phase 4:

- **DeenStudio:** shared concept, design, planning, implementation and UX with
  Munadir Khan; Munadir handled a substantial amount of coding. No sole-author or
  majority-code claim is made for Darsh.
- **Argus:** Darsh primarily handled web/frontend, browser sensing/extension,
  integrations, interface work and related terminal monitoring/recovery. Munadir
  primarily handled the core AI agent. Product-level capability is team work.
- **Bluff House:** Darsh drove much of development and iteration. No live URL was
  supplied or invented.
- **Interval:** entirely the friend's project. Explicitly excluded from the data,
  listings, commands, routes and case-study ownership.

The owner also supplied [Argus Devpost](https://devpost.com/software/argus-9lo42s)
and [Bluff House Devpost](https://devpost.com/software/bluff-house). Those exact
pages were not retrievable by the automated readers during this review. Links are
included as provided; their unavailable text was not replaced with similarly
named projects or used to invent facts. The source code and owner's statements
support the associated copy.

## Conflicts resolved in the copy

- Finance Tracker's inspected frontend is **Next.js**, with React/TypeScript.
- VisionControl's included motor example is **virtual**, with physical output
  disabled. Voice/physical motor work is not described as complete.
- DeenStudio's README mentions MP4 and conversion, but `exportVideo` selects WebM
  MIME types, records with MediaRecorder and downloads `deenstudio.webm`. There is
  no MP4 conversion in the inspected source. Devpost's implementation description
  also says WebM. The portfolio follows the code and claims no export benchmark.
- DeenStudio has serverless AI handlers **and** an optional browser-direct OpenAI
  fallback. The portfolio does not repeat a blanket claim that every code path
  keeps keys server-side. No key values or environment files were read/copied.
- Argus's hosted mode is a **replay** that avoids local-core connections, per
  `web/src/lib/mode.ts`. Its public link is labeled “web demo (replay)”.

Both owner-supplied deployments returned HTTP 200 with the expected titles.
DeenStudio's initial interface was visually inspected. Paid AI generation,
complete export, local-agent execution and performance testing were not run.

## Media provenance

All images were visually inspected. Originals are retained for the full-size
viewer. JPEG previews reduce homepage transfer size without replacing originals.

| Local file under public/images/projects/                         | Original source                                                                                                                           |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| pokemon-style-rpg/world.png                                      | screenshots/WorldExploration.png at the RPG revision above                                                                                |
| pokemon-style-rpg/starter.png                                    | screenshots/StarterPokemonSelection.png at that revision                                                                                  |
| pokemon-style-rpg/battle.png                                     | screenshots/PokemonBattle.png; explicitly WIP                                                                                             |
| fsm-sequence-detector/states.png                                 | diagrams/state_diagram_gray_code.png; the actual image is a transition table                                                              |
| fsm-sequence-detector/waveform.png                               | simulations/waveform_gray_code.png                                                                                                        |
| fsm-sequence-detector/comparison.png                             | diagrams/cost_comparison.png                                                                                                              |
| visioncontrol/virtual-state.png                                  | motor_control/examples/virtual_state.png; illustrative simulation state                                                                   |
| argus/hub.png                                                    | web/evidence/ui-v2/hub-1920.png                                                                                                           |
| argus/browser-tab.png                                            | web/evidence/browser/browse-agent-1920.png; later successful browser-tool capture                                                         |
| argus/terminal-recovery.png                                      | web/evidence/terminal/terminal-fixed-1920.png                                                                                             |
| deenstudio/verse-selection.png                                   | Unmodified full-page capture of the owner-supplied public deployment's initial interface, 2026-11-01; no generation/export action invoked |
| argus/hub-preview.jpg and deenstudio/verse-selection-preview.jpg | Derived at 960px width, JPEG quality 88 by scripts/generate-project-previews.ps1                                                          |

Argus captures may contain historical UI estimates. They do not establish a new
cost/performance guarantee. Team approval of final media/captions and third-party
artwork credits remains on the publication checklist. No fake screenshots or
synthetic product demos are used. The isolated fixture includes a 540-byte silent gray test video, generated from a
64-pixel test image with FFmpeg. It is not included in production output.
