import type { ProjectId } from './projects'

export interface TimelineEntry {
  id: string
  kind: 'education' | 'experience' | 'hackathon'
  title: string
  organization: string
  startDate: string
  endDate?: string
  expectedEnd?: boolean
  location?: string
  projectId?: ProjectId
  summary: string
  year?: string
  details?: string[]
  preview?: { src: string; alt: string; width: number; height: number }
}
// Owner-verified dates use YYYY-MM. Equal start months keep their supplied order;
// participation dates are not inferred from winner-announcement dates.
// Student Works Canada Production Manager belongs to someone else; exclude it.
const milestones: TimelineEntry[] = [
  {
    id: 'argus-hackathon',
    kind: 'hackathon',
    title: 'Argus',
    organization: 'Nebius × NVIDIA Global AI Hackathon',
    startDate: '2026-10',
    projectId: 'argus',
    summary:
      'Frontend development, browser integrations, and extension functionality for a collaborative AI agent project.',
    details: [
      'My work focused on the frontend, browser integrations, extension functionality, and related interface and terminal workflows.',
      'Collaborated with Munadir, whose work included core-agent development.',
    ],
  },
  {
    id: 'bluff-house-hackathon',
    kind: 'hackathon',
    title: 'Bluff House',
    organization: 'Build With AI: Basics',
    startDate: '2026-10',
    projectId: 'bluffhouse',
    summary:
      'Led much of the development of a multiplayer Blackjack party game with real-time functionality and social bluffing mechanics.',
    details: [
      'Built real-time multiplayer gameplay and social bluffing mechanics for a Blackjack party game.',
    ],
  },
  {
    id: 'stealth-ai-startup',
    kind: 'experience',
    title: 'Co-Founder',
    organization: 'Stealth AI Startup',
    startDate: '2026-07',
    endDate: 'Present',
    location: 'Toronto, Ontario',
    summary:
      'Working on AI-driven systems intended to improve business operations and workflows.',
  },
  {
    id: 'deenstudio-hackathon',
    kind: 'hackathon',
    title: 'DeenStudio',
    organization: 'Western MSA Hackathon',
    startDate: '2026-05',
    projectId: 'deenstudio',
    summary:
      'Joint product design and implementation of a Quran video creator with Munadir.',
    details: [
      'Collaborated on product design and implementation, including the verse-to-video workflow.',
      'Munadir handled a substantial portion of the coding.',
    ],
  },
  {
    id: 'dh-precision',
    kind: 'experience',
    title: 'AutoCAD Designer',
    organization: 'DH Precision',
    startDate: '2025-07',
    endDate: '2025-08',
    location: 'Etobicoke, Ontario',
    summary:
      'Used Onshape for mechanical design, including a custom ring bearing to support and stabilize a bench-mounted mechanical arm.',
    details: [
      'Created the mechanical design in Onshape, accounting for part fit, alignment, stability, and manufacturability.',
    ],
  },
  {
    id: 'western-university',
    kind: 'education',
    title: 'Western University',
    organization: 'Bachelor of Engineering, Software Engineering',
    startDate: '2024-09',
    endDate: '2029-06',
    expectedEnd: true,
    summary:
      'Studying Software Engineering, with expected graduation in June 2029.',
    details: [
      'Relevant coursework: Data Structures & Algorithms, Software Construction, Software Design, Database Systems, Computer Networks, Web Technologies, Discrete Structures, Digital Logic Systems, and Quantum Computing.',
    ],
  },
  {
    id: 'campaign-volunteer',
    kind: 'experience',
    title: 'Campaign Assistant — Volunteer',
    organization: 'Liberal Party of Canada',
    startDate: '2021-08',
    endDate: '2022-01',
    location: 'Markham, Ontario',
    summary: 'Volunteered as a campaign assistant.',
  },
  {
    id: 'middlefield-collegiate',
    kind: 'education',
    title: 'Middlefield Collegiate Institute',
    organization: 'High School Diploma',
    startDate: '2020-09',
    endDate: '2024-06',
    summary:
      'Academic honours and student leadership in mathematics and robotics.',
    details: [
      'Graduated with a 93.5% average.',
      "Academic achievements: four-year Honour Roll, Ontario Scholar, and Principal's Honour Roll.",
      'Co-President of Math Club and Robotics Club.',
      'Marketing Manager of Gujarati Students Association; member of Badminton Club.',
    ],
  },
]

export const timeline = milestones.sort((a, b) =>
  b.startDate.localeCompare(a.startDate),
)

export function timelineDate(value: string) {
  if (!/^\d{4}-\d{2}$/.test(value)) return value
  return new Intl.DateTimeFormat('en-CA', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}-01T00:00:00Z`))
}
