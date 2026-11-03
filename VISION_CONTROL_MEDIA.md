# VisionControl implementation audit and recording plan

Status: **tracking-only webcam testing/recording approved; waiting for owner readiness**.
No webcam was opened, no camera frames were processed, no desktop-control backend
or hotkey was activated, and no recording was started. The portfolio case study
remains draft. No application, machine-wide settings or source repository files
were modified. Nothing was committed, pushed, deployed or published.

## Source and environment evidence

Source repository: `C:/Users/Darsh/VisionControl` (read-only).
Audited revision: `f5b22b0e48875ccd4ef9c09e40dba82532f275f3`.
The working tree was clean at inspection.

Reviewed the root, hand-tracking, gesture, swipe, controls, camera and performance
documentation, runtime/renderer/controller source, and Phase 3.8/4.5 scope notes.
Performance evidence includes the Phase 4.1 physical report, Phase 3.11 fix report,
Phase 4.5 synthetic report, and local hand-tracking benchmark inventory.

| Check | Result |
| --- | --- |
| Python | Existing `.venv/Scripts/python.exe`, Python **3.13.16**. README's older 3.13.7 value is historical. |
| Requirements | All **19 pinned distributions match**, with no installation needed. |
| Key packages | MediaPipe 1.1.1, opencv-contrib-python 5.0.0.93, NumPy 2.5.4, Pillow 12.3.0. |
| Native preview | OpenCV reports **WIN32** GUI support. |
| Hand model | Local `hand_tracking/models/hand_landmarker.task`, **7,819,105 bytes**. |
| Model integrity | SHA-256 `fbc2a30080c3c557093b5ddfc334698132eb341044ccee322ccf8bcf3607cde1`, matching the source-pinned official bundle. |
| Offline model check | CPU VIDEO-mode HandLandmarker constructed and closed successfully; no images, inference or camera used. |
| Proposed arguments | Parsed successfully with controls false, synchronous capture, EMA enabled and alpha 0.75. This is not a camera-runtime acceptance test. |
| Desktop session | Interactive Explorer and audit process both in session 1. |
| Recording tool | Existing FFmpeg 4.3.1 supports Windows `gdigrab`; H.264 encoding was already available for portfolio media. |
| Camera presence | Camera/Image-class and name-filtered PnP metadata returned **no matching camera device**. Camera availability/index/permission remain unconfirmed; historical reports are not current device proof. |

No production credentials, application secrets or unrelated files were inspected.
Python inspection used `-B` to suppress bytecode writes into the original checkout.

### CLI help defect

`python -B -m hand_tracking.hand_tracker --help` currently raises
`TypeError: %o format: an integer is required, not dict`. The unescaped `60% of`
help text for `--reframe-dead-zone` is incompatible with argparse help formatting
(`hand_tracking/hand_tracker.py:108`). No source fix was made. Normal proposed
arguments parse successfully without `--help`; this defect alone does not prove
the normal launch path fails. Full camera launch remains untested at this checkpoint.

## Implemented versus physically verified

| Capability | Source evidence / scope | Capture acceptance still required |
| --- | --- | --- |
| 21 landmarks and skeleton | MediaPipe Tasks CPU VIDEO hand model; per-hand skeleton and point renderer. | A real visible hand must yield actual landmarks. |
| Two hands and handedness | Default maximum two, Left/Right labels and green/blue rendering. | Show both hands separated; verify labels against the actual hands and camera convention. |
| Landmark smoothing | Conservative EMA, current-measurement alpha 0.75; optional raw white-cross comparison; resets rather than guessing identity through loss/ambiguity. | Slow movement and brief stillness; compare raw/EMA without claiming zero jitter or calibrated accuracy. |
| Static gestures | Deterministic OPEN_PALM, FIST, POINTING and UNKNOWN rules, enabled with `--gestures`. | Each intended pose must actually produce its label. Backward rotation can cause POINTING/FIST ambiguity. |
| Pinch and states | Normalized thumb/index proximity; OPEN/STARTED/HELD/RELEASED/UNAVAILABLE lifecycle plus optional stabilized intent/events. | Capture real held/released states; brief transitions may require selecting a frame from the real recording. |
| Swipe recognition | Horizontal palm trajectory, eligibility gates, reset/cooldown, optional diagnostic trail and metrics. | Capture an actual accepted SWIPE_LEFT/RIGHT event, not merely a candidate or rejected attempt. |
| Cursor control | Win32 input backend; explicit controls/live flags, initial manual arming, relative or absolute mapping. | **Separate owner approval and physical safety acceptance required. Not activated or verified live in this audit.** |
| Click/drag and tab actions | Additional explicit `--control-mouse` and `--control-tabs` switches. | Excluded from the initial and proposed cursor-only demonstration. Additional scope/approval required if desired later. |
| Diagnostics | Real application FPS/hand count, pose/pinch/state/motion rows; opt-in stage and pacing reports. | Describe current observed values only, with actual conditions. Host timings are not sensor latency. |

Relevant source: `hand_tracking/hand_tracker.py`, `tracking_utils.py`, `smoothing.py`,
`gestures/static_gestures.py`, `pinch.py`, `state_machine.py`, `swipe.py`,
`controls/cli.py`, `controller.py`, `windows.py` and `safety.py`.

Optional face detection/tracking, digital reframing and a **virtual** pan/tilt
controller exist. They are not needed for this demonstration. Physical camera
motors, voice control and face-to-hand operator authorization/identity association
must not be claimed. Geometric hand track IDs and temporary face IDs do not prove
operator identity. Do not enable experimental 3–4-hand/track-ID modes for this take.

## Existing media inventory

No MP4/WebM/AVI/MOV/MKV demo was found outside the excluded venv/Git directories.
Available images:

- `motor_control/examples/virtual_state.png`: documented synthetic virtual motor
  state; already represented in the portfolio as a labeled simulation. It is not
  a webcam demonstration or evidence of physical motors.
- `hand_tracking/benchmarks/phase3_8_four_hands.png`: synthetic four-hand diagnostic
  rendering, explicitly identified as such in `PHASE_3_8.md`. Not suitable as real
  camera output.
- `hand_tracking/benchmarks/palm-profile-preview.png`: schematic landmarks on a
  blank background, with an apparent LIVE/ARMED label and fixed displayed FPS.
  Real-camera/live-input provenance was not established. **Exclude it from the
  authentic showcase**, rather than treating that status label as proof.

The two hand-preview PNGs were inspected at their native **1100 × 619** size.
Existing benchmark utilities measure camera delivery, recognition/controller
overhead, rendering and related diagnostics; they are not general video recorders.
The hand tracker exposes Q/H and control arming keys, but no screenshot/video-save
key or VideoWriter path. The separate camera tester's screenshots do not include
the hand-tracker recognition output and cannot substitute for it.

Performance reports mix real hardware sessions and synthetic fixture benchmarks.
For example, Phase 4.1 records UGREEN/index 0, MSMF, requested 1920×1080/60 and
full hand inference; its sessions vary in hand/face workload. The Phase 4.5
synthetic report explicitly excludes camera, inference and hardware input. No
historical FPS, synthetic throughput or renderer fixture value will be repackaged
as the performance of the new recording. No new benchmark claims are proposed.

## Native resolution and recording method

The hand preview renderer caps content at **1100 × 650** and never upscales.
For a negotiated 1920×1080 feed it generates **1100 × 619** application output.
The on-screen “1920 × 1080” describes capture dimensions, not screenshot resolution.
Do not label the preview as a native 1080p screenshot.

After webcam approval, verify actual negotiated camera size, window client size,
DPI and readability. Preserve screenshots at the actual application-output size.
Use variants no larger than the original (provisionally 480, 960 and 1100 pixels
wide). For H.264, pad an odd height to an even size rather than upscale. A 1080p
editorial canvas is optional only if clearly framed around the native-size image;
it must not be presented as higher-resolution application capture.

Playwright cannot directly drive or record this OpenCV native window. Recommended:
FFmpeg `gdigrab` targeting **VisionControl - Hand Tracking**. Keep that window
visible and unobstructed; verify the actual capture region with a short owner-
approved sample. Prefer client-only framing; remove only verified window borders,
not recognition labels or diagnostic evidence. Do not record the entire desktop.
If window capture fails, use an available native recorder with an explicitly
selected region and owner supervision; that fallback is not yet verified.

No microphone/system audio is needed. Capture only the consenting owner, with a
neutral background and private documents/screens removed from view. No generated
landmarks, fake overlays, replacement recognitions or simulated successful actions.

## Commands proposed for the approved tracking stage

These are **documented proposals, not commands executed in this audit**. The
argument set was validated offline; camera access remains gated on owner approval.
Running from the original checkout is read-only with `-B`; the explicit report
destination is inside the portfolio. No dependencies/model downloads are required.

```powershell
$visionOutput = 'C:/Users/Darsh/portfolio/.cache/vision-demo'
New-Item -ItemType Directory -Force -Path $visionOutput | Out-Null
$visionStamp = Get-Date -Format 'yyyyMMdd-HHmmss-fff'
$visionPython = 'C:/Users/Darsh/VisionControl/.venv/Scripts/python.exe'
$visionArgs = @(
  '-B', '-m', 'hand_tracking.hand_tracker',
  '--camera-index', '0', '--backend', 'msmf',
  '--width', '1920', '--height', '1080', '--fps', '60',
  '--max-hands', '2', '--capture-pipeline', 'sync',
  '--windows-timer-policy', 'system',
  '--gestures', '--pinch', '--gesture-states', '--swipes',
  '--performance-profile', '--report', "$visionOutput/tracking-$visionStamp.json"
)
Push-Location 'C:/Users/Darsh/VisionControl'
try { & $visionPython @visionArgs } finally { Pop-Location }
```

No `--controls` flag means no desktop controller is created. Static/pinch/swipe
recognition does not generate desktop input. Start with these standard defaults;
do not silently change thresholds to force recognition. For a separate diagnostic
take, add `--show-raw-landmarks --pinch-debug --swipe-debug` and choose a fresh report
name. Do not enable face, digital reframe, motor or timer-policy experiments.

After the preview is ready, use a separate PowerShell terminal for recording:

```powershell
$visionFfmpeg = 'C:/Users/Darsh/AppData/Local/Programs/lunarclient/ffmpeg.exe'
& $visionFfmpeg -hide_banner -f gdigrab -framerate 30 -draw_mouse 0 `
  -i 'title=VisionControl - Hand Tracking' -t 80 -an `
  -vf 'pad=ceil(iw/2)*2:ceil(ih/2)*2' -c:v libx264 -preset fast -crf 16 `
  -pix_fmt yuv420p -movflags +faststart `
  "C:/Users/Darsh/portfolio/.cache/vision-demo/tracking-$visionStamp.mp4"
```

This records the actual preview, including genuine overlays. The exact captured
dimensions/region and encode support must pass the short sample check first.
Use a unique filename; do not overwrite any existing source media. Stop FFmpeg
with `q` in its terminal **before** closing the application; focus the preview and
use Q to quit, H to toggle its help. Keep the native preview foreground for reliable
rendering. Record multiple honest takes if needed and select accepted states later.

## Owner positioning and gesture instructions

1. Connect/confirm the intended camera after approving access. Close other camera
   apps. Historical index 0 is a starting proposal, not verified current hardware.
2. Place the webcam around chest/shoulder height, aimed at a plain background.
   Light your hands from the front; avoid a bright window behind you, glare and
   motion blur. Begin about 0.6–1 metre away, then adjust to keep fingertips/wrists
   entirely in frame. No camera driver/exposure/system settings will be changed.
3. Start with one palm facing the camera, fingers spread, and hold for two seconds.
   Slowly translate/rotate it; check overlay readability and anatomical handedness.
4. Show both hands separated without crossing/overlap. Hold still briefly, then
   move gently. One person can supply both hands; no second participant is needed.
5. Cycle open palm → fist → index pointing → open palm, holding each around two
   seconds. Keep the index extended and other fingers curled for POINTING. Do not
   hide incorrect/UNKNOWN results by relabeling them.
6. Begin with thumb/index apart; touch to pinch, hold about one second, release and
   hold open. Repeat to obtain readable real STARTED/HELD/RELEASED transitions.
7. For default swipes, hold a valid open palm still at least 250 ms, then move
   horizontally across roughly two palm widths in about 0.2–0.5 seconds while
   keeping depth/rotation steady. Confirm actual acceptance. To repeat, close the
   hand/reposition, reopen, allow cooldown and hold still before moving again.
   Directions refer to the **unmirrored image**; do not narrate mirrored directions.
8. A diagnostic take can compare raw white crosses with EMA landmarks and show
   real pinch/swipe metrics. Only measured app FPS is visible; no guaranteed
   frame-rate, latency or recognition-accuracy claim will be added.

## Six proposed screenshots

| Proposed file | Actual frame to select |
| --- | --- |
| `01-single-hand.png` | One well-framed hand with 21 landmarks/skeleton and genuine label. |
| `02-two-hands.png` | Both complete hands, clearly separated, actual Left/Right labels; provisional hero candidate. |
| `03-static-pointing.png` | Confirmed POINTING pose; open palm is also shown in shot 1 and fist in the video. |
| `04-pinch-held.png` | Actual pinch HELD and stabilized state; capture the moment from original video if necessary. |
| `05-swipe-confirmed.png` | Actual accepted SWIPE feedback and, if readable, motion trail. Candidate/rejected states do not qualify. |
| `06-tracking-diagnostics.png` | Actual raw/EMA comparison or meaningful state/motion diagnostics with desktop controls disabled. |

If cursor-only live control is separately approved and passes acceptance, shot 6
may instead show the actual cursor moving over a harmless local target canvas.
Do not imply a simulation backend is live computer control. If any requested
recognition does not work reliably, report that limitation and omit/replace the
shot with owner review; never invent a successful frame.

## Proposed 65-second final sequence

| Time | Real action |
| --- | --- |
| 00:00–00:06 | Single-hand tracking, actual skeleton/labels, slow movement. |
| 00:06–00:14 | Two separated hands and handedness labels. |
| 00:14–00:27 | Open palm, fist and pointing, with actual state changes. |
| 00:27–00:39 | Thumb/index apart → pinch → hold → release, repeated clearly. |
| 00:39–00:51 | Accepted horizontal swipe, neutral reset, opposite-direction swipe if accepted. |
| 00:51–01:01 | Raw/EMA or state/motion diagnostics; **alternatively separately approved live cursor-only footage**. |
| 01:01–01:05 | Clean closing view with stable tracking. |

Allow a short editorial title/disclosure card while staying within 45–75 seconds.
Timing is a target, not a reason to fake/accelerate recognition. Clean cuts between
authentic takes are allowed and documented; never conceal unsuccessful operations
with a fabricated success response. Diagnostic comparison requires a separate take
if its flags differ from the main launch. No invented narration/performance values.

## Separate desktop-input approval, if desired later

Live controls can move the Windows cursor. Adding `--control-mouse` also enables
pinch click/drag; `--control-tabs` adds browser keyboard shortcuts. Both remain
excluded. The first optional live demonstration would be **cursor movement only**,
over a blank local target canvas on the selected monitor, with private apps closed.

Only after explicit approval, append to a fresh tracking launch:

```text
--controls --control-mode live --control-hand right --control-emergency-hotkey ctrl+shift+f10
```

The source starts DISARMED. In the focused preview, A arms and D disarms. Before
arming, physically verify Ctrl+Shift+F10 works while the harmless target has focus
and that the preview reports a global emergency stop. Return to the preview for
manual initial arming only after that test. The legacy default maps POINTING/index
tip to cursor movement; end pointing or disarm to stop. Do not enable automatic
gesture rearming. Loss/ambiguity and a watchdog can disarm, but their presence in
source is not a substitute for the physical stop test. If the hotkey cannot register
or fails off-focus/through remote delivery, **do not arm or record live control**.

For an approved cursor take, record only the preview and harmless target region
with the real pointer included; the tracking-only window recording does not prove
desktop movement. D disarms before stopping the recorder. Q then closes the preview.
No credentials, private files, unrelated windows, click/drag/tab actions or physical
motors are involved.

## Blockers and session readiness

No dependency installation or model download is required. Remaining prerequisites:

- Tracking-only webcam access/testing/recording is approved. The owner replied **Not ready yet** to the readiness check; camera access and capture remain paused until they are present.
- Current camera availability/index and Windows permission confirmation; metadata
  enumeration returned no matching device. No camera probe was attempted.
- Owner presence to perform all hand poses, pinch/swipes, label checks and consent
  to the visible scene. Recognition reliability and lighting remain untested.
- Short actual window-recording check for client bounds, native dimensions, DPI,
  text readability and recording overhead. FFmpeg capability is verified, not a
  guarantee of a successful recording in this desktop session.
- Separate approval and physical emergency-stop acceptance for any live input.
- Known CLI help defect is documented; source remains unchanged.

After approval/capture, preserve raw takes and diagnostics in Git-ignored
`C:/Users/Darsh/portfolio/.cache/vision-demo/`. Prepare selected originals and
responsive derivatives in the existing `public/images/projects/visioncontrol/`
structure, video/captions in `public/videos/projects/visioncontrol/`, and a contact
sheet/provenance record under `docs/media/`. Record actual source hashes, camera
negotiation, window size, capture settings, successful/omitted features and limits.
Review finished assets before case-study integration. No media assets or content
records have been changed by this audit.

## Approved session — pre-camera metadata check

The owner approved tracking-only webcam access, testing and authentic recording,
with **no `--controls` or equivalent desktop input functionality**. Integration is
not approved until the finished media package has been visually reviewed.

The owner answered **Not ready yet** to the physical-participation readiness check.
The camera was therefore kept closed. Read-only Windows metadata checks found:

- No currently enumerated Camera/Image-class or UGREEN/webcam-named matching device.
- Current-user and machine camera-consent metadata both report **Allow**.
- No explicit `AllowCamera` policy value was available.
- No applications marked active in the inspected Windows camera-use metadata.

These observations do not prove that a stream can open, that all desktop-app
permissions are effective, or that no process holds a camera. OpenCV camera access,
backend/index selection, negotiated resolution and measured frame rate remain
untested. No camera probe, gesture test, recording or media preparation was performed.
No software/driver, system-wide setting or original repository file was changed.

When the owner is ready and the intended camera is connected, resume under the
existing tracking-only approval: verify current device presence, then perform a
bounded OpenCV camera test. Stop/report an access failure before launching the
tracking application. Close camera access between the probe and tracker so they
never compete for a handle. No further approval is needed merely to resume the
already-approved tracking-only scope. Desktop input stays prohibited.
