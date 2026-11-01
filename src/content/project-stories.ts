import type { Project, ProjectId } from './projects'

const repo = (name: string) => `https://github.com/DarshP-Dev/${name}`
const source = (name: string, sha: string, path: string) =>
  `${repo(name)}/blob/${sha}/${path}`
const finance = '04f335f3cbdb9371a1f8a85cd36c935c6c41c3ec'
const vision = 'f5b22b0e48875ccd4ef9c09e40dba82532f275f3'
const bluff = 'f7f168509759de099f2b862e3a6142a5f89855b0'
const rpg = '24ac506d72607e570bc22f2812b592c9e224b459'
const fsm = '5036d385ca70bd0c21be96a3b0ac8016695aaaf1'

/** Source-grounded drafts, reviewed against the pinned files in PROJECT_SOURCES.md.
 * These describe code, not independently measured performance or an inferred personal role.
 */
export const projectStories: Partial<Record<ProjectId, Partial<Project>>> = {
  'personal-finance-tracker': {
    tagline: 'A full-stack workspace for everyday financial records.',
    summary:
      'A Next.js interface and Spring Boot API bring transactions, budgets, recurring schedules and investment records into one application. The implementation separates recorded activity from forecasts and keeps data ownership on the server.',
    projectType: 'Full-stack web application',
    technologies: [
      'Next.js',
      'React',
      'TypeScript',
      'Java',
      'Spring Boot',
      'PostgreSQL',
      'Flyway',
    ],
    links: [
      {
        label: 'View GitHub repository',
        kind: 'github',
        url: repo('finance-tracker'),
      },
    ],
    challenge:
      'Financial records need consistent ownership and predictable updates. Recurring schedules add another constraint: retries, concurrent requests and calendar boundaries must not quietly create duplicate activity.',
    solution:
      'The application pairs an authenticated dashboard with backend services for accounts, transactions, budgets and recurring definitions. Upcoming projections are presented separately from transactions that have actually been recorded.',
    features: [
      {
        title: 'Recorded activity and upcoming schedules',
        body: 'Transactions and recurring definitions have separate API flows. Upcoming views project scheduled activity without presenting it as a current account balance.',
      },
      {
        title: 'Session continuity',
        body: 'The repository documents in-memory access tokens, rotating refresh sessions and cross-tab logout. Server-side revocation applies to refresh sessions; issued access tokens retain their own expiry.',
      },
      {
        title: 'Explicit schema changes',
        body: 'Flyway owns database migrations while Hibernate validates the resulting schema, making schema changes separate from ordinary application startup.',
      },
    ],
    architecture:
      'The Next.js client calls a Spring Boot API. Authenticated services resolve the current user on the server, and JPA repositories persist owned records in PostgreSQL. Flyway manages schema versions. Recurring processing operates on individual definitions with database transactions and row locks.',
    architectureNodes: [
      {
        id: 'interface',
        label: 'Next.js interface',
        description:
          'React and TypeScript present the dashboard and submit requests to the API. The frontend is a Next.js application in the inspected repository, rather than a Vite client.',
      },
      {
        id: 'services',
        label: 'Spring Boot services',
        description:
          'Controllers and services validate authenticated operations and resolve ownership before accessing financial records.',
      },
      {
        id: 'storage',
        label: 'PostgreSQL + Flyway',
        description:
          'JPA repositories persist records. Flyway changes the schema explicitly, and application startup validates its expected structure.',
      },
    ],
    engineeringChallenges: [
      {
        title: 'Generating a recurring occurrence once',
        problem:
          'Manual generation and scheduled catch-up can act on the same definition.',
        approach:
          'The recurring service serializes operations with a row lock and advances the occurrence inside the database transaction.',
        tradeoff:
          'Updates to one definition wait for its lock; separate definitions can be processed independently.',
        result:
          'The source provides an explicit transaction boundary and records the next occurrence after generation.',
      },
      {
        title: 'Preserving calendar intent',
        problem:
          'A monthly schedule anchored to the end of a month cannot simply add a fixed number of days.',
        approach:
          'The documented schedule retains the original day anchor and avoids revisiting generated dates when a schedule is edited.',
        tradeoff:
          'Forecasts describe known schedules, not guaranteed future balances.',
      },
    ],
    deepDives: [
      {
        title: 'Recurring records versus forecasts',
        body: 'A generated occurrence becomes an ordinary transaction. An upcoming projection stays a forecast until generation records it. The repository documents both an in-process scheduler and an authenticated external trigger for environments that may stop between requests.',
      },
    ],
    outcomes: [
      'The inspected source contains authenticated financial APIs, recurring generation and explicit migration handling.',
      'Repository release notes record prior checks; those application suites and live financial workflows were not rerun during this portfolio phase.',
    ],
    nextSteps: [
      'Add redacted dashboard media and confirm the exact personal contribution.',
      'Review public copy and any live-demo URL before publication.',
    ],
    pending: [
      'Supply redacted screenshots or a privacy-safe demo',
      'Confirm role, contribution boundaries and owner-approved outcomes',
      'Verify any public deployment URL',
    ],
    sources: [
      {
        label: 'Repository overview',
        url: source('finance-tracker', finance, 'README.md'),
      },
      {
        label: 'Recurring transaction service',
        url: source(
          'finance-tracker',
          finance,
          'backend/backend/src/main/java/com/financetracker/backend/services/RecurringTransactionService.java',
        ),
      },
      {
        label: 'Frontend dependencies',
        url: source(
          'finance-tracker',
          finance,
          'frontend/finance-tracker-frontend/package.json',
        ),
      },
    ],
  },
  visioncontrol: {
    tagline: 'From camera frames to deliberate, guarded interactions.',
    summary:
      'A Python computer-vision prototype combines hand landmarks, gesture states and optional face tracking. Desktop input is opt-in, and the motor preview represents a virtual controller with hardware output disabled.',
    projectType: 'Computer vision prototype',
    technologies: ['Python', 'OpenCV', 'MediaPipe', 'NumPy'],
    links: [
      {
        label: 'View GitHub repository',
        kind: 'github',
        url: repo('VisionControl'),
      },
    ],
    media: [
      {
        type: 'image',
        src: '/images/projects/visioncontrol/virtual-state.png',
        width: 540,
        height: 390,
        altOrCaption:
          'Virtual pan and tilt controller showing simulated angles and tracking state, with hardware output disabled.',
        caption:
          'Repository example: virtual motor state. This is a simulation preview, not a webcam recording or physical hardware demonstration.',
      },
    ],
    challenge:
      'A camera observation is not automatically a reliable command. Tracking uncertainty, gesture transitions and interrupted processing need explicit handling before a desktop interaction can be issued.',
    solution:
      'The project keeps capture, landmark inference, gesture state and optional control mapping separate. Face tracking, digital reframing and virtual motor output build on shared source frames, while live desktop controls require a distinct arming path.',
    features: [
      {
        title: 'Landmarks to events',
        body: 'Hand tracking feeds static recognition, pinch lifecycles and optional swipe events. Raw recognition remains distinct from stabilized events.',
      },
      {
        title: 'Tracking and reframing',
        body: 'Optional face tracking maintains temporary identities and a primary target. A separate crop preview follows the target while analysis stays in original-frame coordinates.',
      },
      {
        title: 'Virtual controller preview',
        body: 'The motor visualizer displays simulated pan/tilt state. The physical camera remains stationary and hardware output is disabled.',
        mediaIndex: 0,
      },
    ],
    architecture:
      'Camera frames feed OpenCV and MediaPipe processing. Geometry and temporal state turn observations into typed gesture or tracking events. Separate consumers render previews, calculate virtual motor state or, when explicitly enabled and armed, map eligible gestures to Windows input.',
    architectureNodes: [
      {
        id: 'capture',
        label: 'Camera frames',
        description:
          'Capture provides the shared original image. Inference sizing is independent of the requested capture resolution.',
      },
      {
        id: 'perception',
        label: 'Landmarks + state',
        description:
          'MediaPipe inference, geometry, smoothing and event lifecycles keep raw observations separate from interpreted interactions.',
      },
      {
        id: 'outputs',
        label: 'Opt-in outputs',
        description:
          'Preview and simulation remain distinct from live input. The emergency monitor and watchdog operate separately from camera/model progress.',
      },
    ],
    engineeringChallenges: [
      {
        title: 'Keeping a stop path independent',
        problem:
          'A delayed camera or model must not also block the ability to stop live desktop control.',
        approach:
          'The safety module runs emergency monitoring and timeout checks in a separate thread and disarms when monitoring fails.',
        tradeoff:
          'Live use still requires acceptance testing on the receiving Windows machine.',
        result:
          'The code makes the control safety lifecycle independent of the main vision loop.',
      },
      {
        title: 'Keeping coordinate systems coherent',
        problem:
          'A digitally reframed image changes the visible crop without changing where observations originated.',
        approach:
          'The documented pipeline keeps analysis in original-frame coordinates and treats the following crop as a separate output.',
        tradeoff:
          'Virtual camera rotation cannot physically recenter the real webcam image.',
      },
    ],
    outcomes: [
      'The source includes hand/face processing, optional desktop mapping and a virtual pan/tilt preview.',
      'Voice control and physical motor output are future work. New hardware acceptance and performance claims are not implied by this case study.',
    ],
    nextSteps: [
      'Provide a privacy-safe webcam demonstration and confirm the personal role.',
      'Complete and document hardware acceptance before making new live-control or performance claims.',
    ],
    pending: [
      'Supply privacy-safe webcam media',
      'Confirm exact role and contribution boundaries',
      'Review current hardware acceptance and any benchmark claims',
    ],
    sources: [
      {
        label: 'Current implementation boundary',
        url: source('VisionControl', vision, 'README.md'),
      },
      {
        label: 'Hand-tracking pipeline',
        url: source('VisionControl', vision, 'hand_tracking/README.md'),
      },
      {
        label: 'Independent safety monitor',
        url: source('VisionControl', vision, 'controls/safety.py'),
      },
    ],
  },
  bluffhouse: {
    role: 'Development and iteration',
    contribution: {
      summary: 'Darsh drove much of the game’s development and iteration.',
      work: [
        'Development and refinement of the multiplayer game and its gameplay systems.',
        'Iteration on rules, networking, interface behavior and verification, as represented in the linked repository.',
      ],
      credits:
        'This describes Darsh’s stated responsibility without claiming that every asset or dependency was created independently.',
    },
    tagline: 'A multiplayer card game with one source of game truth.',
    summary:
      'A React and Socket.IO party-game prototype combines Blackjack with social bluffing, using fictional, nonredeemable chips. One server owns the rules, hidden cards, clocks and settlement; clients display each player’s permitted view.',
    projectType: 'Real-time multiplayer web game',
    technologies: [
      'React',
      'TypeScript',
      'Vite',
      'Node.js',
      'Express',
      'Socket.IO',
    ],
    links: [
      {
        label: 'View GitHub repository',
        kind: 'github',
        url: repo('BluffHouse'),
      },
      {
        label: 'Read the Devpost submission',
        kind: 'devpost',
        url: 'https://devpost.com/software/bluff-house',
      },
    ],
    challenge:
      'Multiple players can submit actions, retry requests or reconnect while the same round is progressing. Private cards and chip accounting must remain authoritative even when client presentation or acknowledgements lag behind.',
    solution:
      'The backend accepts validated commands and returns viewer-specific snapshots. Game transitions, deadlines and funded settlement belong to the server; the browser handles presentation and connection recovery rather than deciding the outcome.',
    features: [
      {
        title: 'Private rooms and recovery',
        body: 'Guests enter room-based games with server-issued credentials. The client follows revisions and reconciles uncertain acknowledgements rather than speculatively replaying actions.',
      },
      {
        title: 'Viewer-specific game state',
        body: 'Projection code builds a permitted view for each player, omitting hidden dealer information and private choices until the rules allow a reveal.',
      },
      {
        title: 'A finite chip ledger',
        body: 'Reservations, commitments and settlement have distinct accounting steps. Chips are fictional and nonredeemable; client animations cannot draw cards or settle wagers.',
      },
    ],
    architecture:
      'A single Express/Socket.IO process serves the compiled React interface and owns rooms. Validated commands pass through room and game-state transitions before a new revision is committed. Explicit projections send each viewer an allowed snapshot. Shared TypeScript contracts connect the browser and server.',
    architectureNodes: [
      {
        id: 'client',
        label: 'React client',
        description:
          'The browser sends commands, follows revisions and presents snapshots. Offline sends are disabled; presentation cannot mutate the server ledger.',
      },
      {
        id: 'authority',
        label: 'Room + game authority',
        description:
          'The Node process validates command context, deadlines and invariants before committing a candidate room state.',
      },
      {
        id: 'projection',
        label: 'Private projections',
        description:
          'Explicit viewer snapshots omit hidden information. Only the appropriate player receives private cards and choices.',
      },
    ],
    engineeringChallenges: [
      {
        title: 'Retrying without repeating a decision',
        problem:
          'A lost acknowledgement can make a legitimate action look as though it never happened.',
        approach:
          'Request fingerprints and decision identity let the server recognize retries and prevent different clicks from consuming the same decision.',
        tradeoff:
          'The client must reconcile with the authoritative snapshot instead of assuming its local action succeeded.',
      },
      {
        title: 'Keeping private information private',
        problem:
          'Sending the entire room state would expose cards and choices that should remain hidden.',
        approach:
          'A dedicated projection layer constructs each player’s view explicitly.',
        tradeoff:
          'Each new game mechanic must define both its authoritative state and its permitted public/private representation.',
      },
    ],
    outcomes: [
      'The repository contains a room-based multiplayer implementation with explicit command, accounting and projection boundaries.',
      'Room state is held in memory. Restart recovery, durable accounts and hosted reliability are not claimed; no live deployment link has been verified.',
    ],
    nextSteps: [
      'Add approved gameplay screenshots and confirm ownership and contributions.',
      'Review hands-on and hosted verification separately from repository test documentation.',
    ],
    pending: [
      'Supply original gameplay media',
      'Review owner-approved contribution wording and outcomes',
      'Verify hands-on acceptance and any deployment URL',
    ],
    sources: [
      {
        label: 'Repository overview and limitations',
        url: source('BluffHouse', bluff, 'README.md'),
      },
      {
        label: 'Runtime and rules architecture',
        url: source('BluffHouse', bluff, 'docs/architecture.md'),
      },
    ],
  },
  argus: {
    tagline:
      'Making a local AI workspace visible, connected and understandable.',
    summary:
      'Argus is a collaborative hackathon project that combines a local AI agent with a desktop/web hub and workspace sensing. The complete product observes context, proposes useful work and runs approved tasks. Darsh’s focus was the web/frontend layer and its browser and terminal integrations; Munadir led the core AI agent.',
    role: 'Web/frontend collaborator',
    projectType: 'Collaborative AI hackathon project',
    collaborators: ['Munadir Khan — core AI agent'],
    contribution: {
      summary:
        'Darsh’s primary responsibility was the web side of the product, not independent implementation of the entire AI system.',
      work: [
        'Browser sensing, extension functionality and browser integrations.',
        'Interface improvements that expose sensing, activity and recovery state.',
        'Related terminal monitoring and recovery workflows.',
      ],
      credits:
        'Munadir was primarily responsible for the core AI agent. The overall product and its achievements are team work; agent reasoning and model routing are not attributed to Darsh alone.',
    },
    technologies: [
      'React',
      'TypeScript',
      'Vite',
      'WebSockets',
      'Browser Extensions',
      'Python',
      'FastAPI',
    ],
    links: [
      {
        label: 'View GitHub repository',
        kind: 'github',
        url: 'https://github.com/munadirkhan/Argus',
      },
      {
        label: 'Read the Devpost submission',
        kind: 'devpost',
        url: 'https://devpost.com/software/argus-9lo42s',
      },
      {
        label: 'Open web demo (replay)',
        kind: 'demo',
        url: 'https://argus-eta-pink.vercel.app/',
      },
    ],
    media: [
      {
        type: 'image',
        src: '/images/projects/argus/hub.png',
        thumbnailSrc: '/images/projects/argus/hub-preview.jpg',
        width: 1920,
        height: 1080,
        altOrCaption:
          'Argus hub with model activity, workspace archive, sensing indicators and a conversation panel.',
        caption:
          'Hub interface — published repository evidence. The core AI system is team work.',
      },
      {
        type: 'image',
        src: '/images/projects/argus/browser-tab.png',
        width: 1920,
        height: 1080,
        altOrCaption:
          'Argus browser-tool acceptance capture showing a rendered page, browser activity and a conversation response.',
        caption:
          'Browser integration — original repository acceptance capture, not a new benchmark run.',
      },
      {
        type: 'image',
        src: '/images/projects/argus/terminal-recovery.png',
        width: 1920,
        height: 1080,
        altOrCaption:
          'Argus terminal workflow showing an error-recovery plan, changed file and a successful rerun in the terminal panel.',
        caption:
          'Terminal recovery workflow — original repository evidence. Darsh’s work covered the related web and monitoring experience.',
      },
    ],
    challenge:
      'An AI agent’s work needs a visible and coherent interface. Browser context, terminal errors and recovery actions must fit the same event model without blurring the line between a real local session and a hosted demonstration.',
    solution:
      'The web layer presents workspace activity, approvals and results through the hub. An opt-in extension shares eligible browser context, while terminal monitoring surfaces command output and failure/recovery state. The public deployment is a replay and does not connect visitors to a live local core.',
    features: [
      {
        title: 'Opt-in browser context',
        body: 'The extension starts with sharing off and skips incognito, internal pages, editable fields and excluded domains. Eligible context reaches a browser-tab sensor in the local core.',
        mediaIndex: 1,
      },
      {
        title: 'Terminal monitoring and recovery',
        body: 'A terminal sensor classifies output and errors so the interface can show the observation, proposed work, resulting artifact and rerun in one workflow.',
        mediaIndex: 2,
      },
      {
        title: 'A clear interface to team-built AI',
        body: 'The React hub renders the shared event contract and activity state. Munadir’s core agent supplies the reasoning and task execution behind that experience.',
        mediaIndex: 0,
      },
    ],
    architecture:
      'The React/TypeScript hub receives local-core events over WebSockets. A browser extension sends opted-in context to a browser-tab sensor; terminal logs feed a separate sensor. A local Python/FastAPI core coordinates the team-built watcher, agent and tools. The hosted hub uses a replay mode rather than reaching a visitor’s machine.',
    architectureNodes: [
      {
        id: 'web',
        label: 'Web hub · Darsh’s focus',
        description:
          'The frontend makes sensing, activity, approvals, terminal recovery and artifacts understandable through the common event contract.',
      },
      {
        id: 'integrations',
        label: 'Browser + terminal',
        description:
          'Opt-in browser sensing and terminal monitoring connect contextual observations to the interface. The extension is separate from the headless browsing tool.',
      },
      {
        id: 'core',
        label: 'AI core · Munadir’s focus',
        description:
          'The local Python core owns agent reasoning and task execution. This is team-built infrastructure, not an individual frontend contribution.',
      },
    ],
    engineeringChallenges: [
      {
        title: 'Keeping browser context opt-in',
        problem:
          'A browser integration has access to context that should not be shared indiscriminately.',
        approach:
          'The extension provides an explicit sharing switch and exclusions for sensitive page types and configured domains.',
        tradeoff:
          'Broad host access is required for eligible page reading, so consent and clear scope remain important parts of the UX.',
      },
      {
        title: 'Making recovery state legible',
        problem:
          'A terminal failure, proposed fix and successful rerun can appear as unrelated fragments.',
        approach:
          'The web and monitoring workflow brings error output, activity events, artifacts and recovery feedback into the same interface.',
        tradeoff:
          'The interface must follow core events accurately rather than imply that a displayed plan has already completed.',
      },
      {
        title: 'Separating a demo from local execution',
        problem:
          'A public web page should not suggest that it is controlling the visitor’s desktop.',
        approach:
          'The hosted mode plays a recorded scenario and avoids local-core connections.',
        result:
          'The portfolio links the deployed page as a web demo (replay), rather than as a verified live agent service.',
      },
    ],
    outcomes: [
      'The repository contains web UI, browser/terminal integration code and published acceptance captures.',
      'Darsh’s ownership statement covers the web-side work; the complete agent product is credited to the team. Repository timing/cost figures are not republished as independent portfolio measurements.',
    ],
    nextSteps: [
      'Review final captions and team permissions for public presentation.',
      'Add a concise demonstration that clearly distinguishes hosted replay from local execution.',
    ],
    pending: ['Owner/team review of source-based copy and media captions'],
    sources: [
      {
        label: 'Product architecture',
        url: 'https://github.com/munadirkhan/Argus/blob/dac51af9e9624848bc453d418d8d908c8d0f4ca9/README.md',
      },
      {
        label: 'Browser integration scope',
        url: 'https://github.com/munadirkhan/Argus/blob/dac51af9e9624848bc453d418d8d908c8d0f4ca9/extension/README.md',
      },
      {
        label: 'Web implementation worklog',
        url: 'https://github.com/munadirkhan/Argus/blob/dac51af9e9624848bc453d418d8d908c8d0f4ca9/docs/worklog/WEB.md',
      },
      {
        label: 'Hosted replay boundary',
        url: 'https://github.com/munadirkhan/Argus/blob/dac51af9e9624848bc453d418d8d908c8d0f4ca9/web/src/lib/mode.ts',
      },
    ],
  },
  deenstudio: {
    tagline: 'A guided workflow for verse-based vertical videos.',
    summary:
      'DeenStudio is a collaborative hackathon application for creating short-form Quran verse videos. A four-step interface connects verse selection, visual templates, AI-generated content and a browser-side export workflow.',
    role: 'Collaborator — product design, planning and implementation',
    projectType: 'Collaborative creator-tool hackathon project',
    collaborators: ['Munadir Khan — substantial share of application coding'],
    contribution: {
      summary:
        'Darsh and Munadir worked together on the concept, overall design and implementation of the application.',
      work: [
        'Product design and development planning.',
        'Implementation collaboration and refinement of the overall user experience.',
      ],
      credits:
        'Munadir handled a substantial amount of the actual coding. Darsh is not presented as the sole implementer of every feature or the author of most of the code.',
    },
    technologies: [
      'React',
      'Vite',
      'Tailwind CSS',
      'Canvas',
      'MediaRecorder',
      'Web Audio API',
      'Vercel Functions',
      'OpenAI API',
    ],
    links: [
      {
        label: 'View GitHub repository',
        kind: 'github',
        url: 'https://github.com/munadirkhan/DeenStudio',
      },
      {
        label: 'Read the Devpost submission',
        kind: 'devpost',
        url: 'https://devpost.com/software/deenstudio',
      },
      {
        label: 'Open DeenStudio',
        kind: 'live',
        url: 'https://deen-studio.vercel.app/',
      },
    ],
    media: [
      {
        type: 'image',
        src: '/images/projects/deenstudio/verse-selection.png',
        thumbnailSrc: '/images/projects/deenstudio/verse-selection-preview.jpg',
        width: 1274,
        height: 1011,
        altOrCaption:
          'DeenStudio’s verse-selection interface, with Habibi suggestions, surah and ayah fields, reciter selection and four workflow steps.',
        caption:
          'Initial verse-selection interface captured from the public application. AI generation and a complete export were not exercised during portfolio development.',
      },
    ],
    challenge:
      'A creator workflow has to connect verse selection, Arabic rendering, visual generation and media export without making each step feel like a separate tool. Network and browser-media behavior add uncertainty around progress and completion.',
    solution:
      'The application guides users through verse selection, a visual template, generated content and export. Canvas composes the vertical scene, Web Audio can supply recitation tracks, and MediaRecorder records the resulting stream.',
    features: [
      {
        title: 'A guided creation flow',
        body: 'The React interface organizes the process into Verse, Template, Generate and Export steps, with progress and status feedback.',
        mediaIndex: 0,
      },
      {
        title: 'Generated visuals and social copy',
        body: 'The repository includes serverless handlers for DALL-E image generation, captions and Habibi suggestions, alongside fallback paths in the client.',
      },
      {
        title: 'WebM recording',
        body: 'The inspected exporter selects a supported WebM MIME type and downloads deenstudio.webm. No MP4 transcoding stage was found in this revision.',
      },
    ],
    architecture:
      'A React/Vite wizard coordinates Quran API data and generation requests. Vercel API handlers integrate image/caption generation. Canvas builds the scene, Web Audio can mix recitation into the stream, and MediaRecorder collects chunks into a WebM download. The source also retains an optional browser-direct OpenAI fallback, so this case study does not claim that every code path keeps keys exclusively server-side.',
    architectureNodes: [
      {
        id: 'wizard',
        label: 'React wizard',
        description:
          'The interface manages selected verses, themes, generated content and export progress. This product/UX layer was a shared contribution.',
      },
      {
        id: 'services',
        label: 'Content services',
        description:
          'Quran API data and serverless AI handlers supply content. The current source also contains a browser-direct fallback path, which needs deployment review before making stronger key-isolation claims.',
      },
      {
        id: 'media',
        label: 'Canvas → WebM',
        description:
          'Canvas frames and optional audio tracks enter MediaRecorder. The recorder creates a WebM blob and downloads it directly; it does not convert it to MP4.',
      },
    ],
    engineeringChallenges: [
      {
        title: 'Composing Arabic text and timed media',
        problem:
          'The scene needs text, backgrounds and recitation to share a coherent timeline.',
        approach:
          'The application combines Canvas rendering with an audio-backed recording stream and status feedback during export.',
        tradeoff:
          'Audio availability and supported recorder formats depend on browser capabilities and external media.',
      },
      {
        title: 'Resolving the export-format conflict',
        problem:
          'The README refers to MP4 while the Devpost implementation description and exporter specify WebM.',
        approach:
          'The portfolio follows the actual MIME selection and download code at the inspected revision.',
        result:
          'WebM is the documented implemented export here. MP4 is not claimed.',
      },
      {
        title: 'Keeping completion and fallback states clear',
        problem:
          'Network delays and generation failures can interrupt a multi-step workflow.',
        approach:
          'The source includes bounded request waits, fallback behavior and export-status/progress updates.',
        tradeoff:
          'Availability and successful end-to-end generation were not revalidated by invoking paid services for this portfolio review.',
      },
    ],
    deepDives: [
      {
        title: 'What the exporter actually produces',
        body: 'exportVideo checks WebM support, captures the Canvas stream, optionally adds Web Audio tracks and records chunks with MediaRecorder. The resulting blob retains that MIME type and is downloaded as deenstudio.webm. The reviewed source has no encoder or conversion step that produces MP4.',
      },
    ],
    outcomes: [
      'The shared application and public entry page are available at the linked deployment.',
      'The public page returned successfully and its initial interface was inspected. Paid AI generation, audio synchronization and a complete export were not rerun; no speed or quality benchmark is claimed.',
    ],
    nextSteps: [
      'Align README export wording with the WebM implementation.',
      'Review browser-direct key fallback and complete deployment/export acceptance separately.',
      'Confirm final team-approved copy and demonstration media.',
    ],
    pending: [
      'Team review of contribution copy and screenshots',
      'Full generation/export acceptance and deployment-boundary review',
    ],
    sources: [
      {
        label: 'Inspected exporter and interface',
        url: 'https://github.com/munadirkhan/DeenStudio/blob/b239eed55a68e387ce0db20949061c8d8313ac4c/src/App.jsx',
      },
      {
        label: 'Serverless image handler',
        url: 'https://github.com/munadirkhan/DeenStudio/blob/b239eed55a68e387ce0db20949061c8d8313ac4c/api/generate-image.js',
      },
      {
        label: 'Hackathon product description',
        url: 'https://devpost.com/software/deenstudio',
      },
    ],
  },
  'pokemon-style-rpg': {
    tagline: 'Exploring a tile-based world, one interaction at a time.',
    summary:
      'A Java Swing/AWT game project with a tile-rendered world, keyboard movement, collision checks and interactive locations. Starter selection and battle interfaces are present, with the battle system explicitly documented as work in progress.',
    role: 'Developer',
    projectType: 'Java desktop game',
    technologies: ['Java', 'Swing', 'AWT'],
    links: [
      {
        label: 'View GitHub repository',
        kind: 'github',
        url: repo('pokemon-style-rpg'),
      },
    ],
    media: [
      {
        type: 'image',
        src: '/images/projects/pokemon-style-rpg/world.png',
        width: 1149,
        height: 865,
        altOrCaption:
          'Player character on a path in the tile-based game world, surrounded by trees, grass and water.',
        caption: 'World exploration — original repository screenshot.',
      },
      {
        type: 'image',
        src: '/images/projects/pokemon-style-rpg/starter.png',
        width: 1036,
        height: 523,
        altOrCaption:
          'Starter selection screen offering Charmander, Bulbasaur and Squirtle.',
        caption: 'Starter selection — original repository screenshot.',
      },
      {
        type: 'image',
        src: '/images/projects/pokemon-style-rpg/battle.png',
        width: 1098,
        height: 697,
        altOrCaption:
          'Work-in-progress battle interface with a player Pokémon and Fight, Bag, Pokémon and Run actions.',
        caption:
          'Battle interface — work in progress, as identified in the repository.',
      },
    ],
    challenge:
      'A tile-based game needs to connect pixel positions, world coordinates and map cells while making movement and location interactions consistent.',
    solution:
      'A Swing game panel coordinates updates and rendering. Separate player, tile and collision classes represent movement and the world; location-specific classes handle selection, stores, healing and battles.',
    features: [
      {
        title: 'World exploration',
        body: 'Keyboard input moves a player through a tile map. Collision checks inspect the projected tile positions before allowing movement.',
        mediaIndex: 0,
      },
      {
        title: 'Starter selection',
        body: 'The selection interface offers three starters and stores the chosen Pokémon in the player’s party.',
        mediaIndex: 1,
      },
      {
        title: 'An unfinished battle system',
        body: 'The project includes encounters and a battle interface. The README explicitly marks combat as in progress, so this page does not present it as a completed game.',
        mediaIndex: 2,
      },
    ],
    architecture:
      'GamePanel owns the update/render loop and composes the player, key handler, tile manager and collision checker. Entity classes hold player and Pokémon state; map classes implement location-specific screens. Tile data connects the world layout to rendering and collision behavior.',
    engineeringChallenges: [
      {
        title: 'Bridging pixels and map cells',
        problem:
          'Collision depends on the player’s bounds and intended direction, not just the current sprite center.',
        approach:
          'CollisionChecker converts the entity’s solid-area bounds and projected movement into tile rows and columns.',
        tradeoff:
          'The inspected collision code also dispatches location-specific screens by tile number, coupling map data to interactions.',
      },
    ],
    outcomes: [
      'The repository includes world, starter-selection and work-in-progress battle screenshots.',
      'Its README credits Darsh Patel as programmer. No frame-rate benchmark or completed-game claim is made.',
    ],
    learnings: [
      'Working with tile coordinates, collision bounds and object-oriented game state.',
    ],
    nextSteps: [
      'The repository proposes richer combat, inventory handling and save/load support; those remain planned rather than completed features.',
      'Review the exact public title and asset credits before final publication.',
    ],
    pending: [
      'Confirm final title and owner-approved case-study wording',
      'Review third-party artwork credits and intended publication',
    ],
    sources: [
      {
        label: 'README and project media',
        url: source('pokemon-style-rpg', rpg, 'README.md'),
      },
      {
        label: 'Game panel',
        url: source('pokemon-style-rpg', rpg, 'src/map/GamePanel.java'),
      },
      {
        label: 'Collision checker',
        url: source('pokemon-style-rpg', rpg, 'src/map/CollisionChecker.java'),
      },
    ],
  },
  'fsm-sequence-detector': {
    tagline: 'Comparing state encodings for a serial sequence detector.',
    summary:
      'A digital-logic project implemented in Intel Quartus Prime. The design detects 0001 and 0011 in a serial input stream, compares Gray and reverse Gray state encodings, and documents the circuit with tables, logic simplification and simulation waveforms.',
    role: 'Developer',
    projectType: 'Digital logic design',
    technologies: [
      'Intel Quartus Prime',
      'Finite-state machines',
      'Digital logic',
    ],
    links: [
      {
        label: 'View GitHub repository',
        kind: 'github',
        url: repo('fsm-sequence-detector'),
      },
    ],
    media: [
      {
        type: 'image',
        src: '/images/projects/fsm-sequence-detector/states.png',
        width: 964,
        height: 342,
        altOrCaption:
          'Gray-code state transition table with present state, next state for input zero or one, and output Z.',
        caption:
          'Gray-code transition table from the repository. A readable description of the detector follows below.',
      },
      {
        type: 'image',
        src: '/images/projects/fsm-sequence-detector/waveform.png',
        width: 940,
        height: 213,
        altOrCaption:
          'Quartus simulation waveform showing the clock, reset, serial input X and output Z over time.',
        caption:
          'Original Quartus waveform capture. This is repository evidence, not a simulation rerun during portfolio development.',
      },
      {
        type: 'image',
        src: '/images/projects/fsm-sequence-detector/comparison.png',
        width: 913,
        height: 286,
        altOrCaption:
          'Comparison table listing fewer gates and inputs for Gray code than reverse Gray code.',
        caption:
          'The repository’s cost comparison favors Gray code. Counts describe this design, not a general performance guarantee.',
      },
    ],
    challenge:
      'The detector must retain enough input history to recognize two sequences and update output Z correctly. State encoding changes the logic required to implement that behavior.',
    solution:
      'The design develops state tables for Gray and reverse Gray encodings, simplifies next-state/output logic using Karnaugh maps, and implements the selected circuit with D flip-flops and logic gates in Quartus.',
    features: [
      {
        title: 'Two sequence outcomes',
        body: 'The documented behavior sets Z to one after 0001 and resets it to zero after 0011.',
        mediaIndex: 0,
      },
      {
        title: 'Encoding comparison',
        body: 'The repository compares gate/input cost and selects the Gray-code design as the smaller implementation in that comparison.',
        mediaIndex: 2,
      },
      {
        title: 'Simulation evidence',
        body: 'A saved Quartus waveform shows the input and output signals. New hardware timing or independent simulation results are not claimed.',
        mediaIndex: 1,
      },
    ],
    architecture:
      'State is stored in D flip-flops. Combinational AND, OR and NOT logic calculates next-state functions and output behavior from the encoded state and input. State tables and Karnaugh maps connect the abstract detector to its gate-level implementation.',
    engineeringChallenges: [
      {
        title: 'Choosing an encoding with a concrete cost',
        problem:
          'Two encodings can express the same state-machine behavior while producing different logic expressions.',
        approach:
          'The project compares the simplified Gray and reverse Gray implementations and selects Gray code using its documented gate/input comparison.',
        tradeoff:
          'The comparison is specific to this circuit; it is not a claim about all finite-state-machine designs.',
        result:
          'The repository preserves both designs and the comparison table used for the selection.',
      },
    ],
    outcomes: [
      'The repository includes transition tables, Karnaugh maps, a Quartus project and a saved simulation waveform.',
      'Its README credits Darsh Patel as programmer. Portfolio work inspected these artifacts without rerunning Quartus.',
    ],
    nextSteps: [
      'Confirm the final role wording and add an owner-reviewed explanation of the simulation cases.',
    ],
    pending: [
      'Review role wording and source-based copy',
      'Confirm simulation interpretation before final publication',
    ],
    sources: [
      {
        label: 'README and implementation artifacts',
        url: source('fsm-sequence-detector', fsm, 'README.md'),
      },
    ],
  },
}
