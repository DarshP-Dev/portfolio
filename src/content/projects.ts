import { projectStories } from './project-stories'

export type ProjectId =
  | 'personal-finance-tracker'
  | 'visioncontrol'
  | 'argus'
  | 'bluffhouse'
  | 'deenstudio'
  | 'pokemon-style-rpg'
  | 'fsm-sequence-detector'

export interface ProjectMedia {
  type: 'image' | 'video'
  src: string
  altOrCaption: string
  width: number
  height: number
  poster?: string
  caption?: string
  thumbnailSrc?: string
  hasAudio?: boolean
  captions?: { src: string; language: string; label: string }
}

export interface Project {
  id: ProjectId
  slug: string
  title: string
  order: number
  featured: boolean
  heroOrbit: boolean
  status: 'draft' | 'reviewed' | 'published'
  technologies: string[]
  media: ProjectMedia[]
  links: {
    label: string
    url: string
    kind: 'github' | 'live' | 'demo' | 'devpost'
  }[]
  summary?: string
  tagline?: string
  projectType?: string
  timeline?: string
  role?: string
  collaborators?: string[]
  contribution?: { summary: string; work: string[]; credits: string }
  challenge?: string
  solution?: string
  architecture?: string
  architectureNodes?: { id: string; label: string; description: string }[]
  features?: { title: string; body: string; mediaIndex?: number }[]
  engineeringChallenges?: {
    title: string
    problem: string
    approach: string
    tradeoff?: string
    result?: string
  }[]
  deepDives?: { title: string; body: string }[]
  outcomes?: string[]
  learnings?: string[]
  nextSteps?: string[]
  sources?: { label: string; url: string }[]
  pending: string[]
}

function draft(
  id: ProjectId,
  title: string,
  order: number,
  pending: string[],
): Project {
  return {
    id,
    slug: id,
    title,
    order,
    featured: order <= 5,
    heroOrbit: order <= 5,
    status: 'draft',
    technologies: [],
    media: [],
    links: [],
    pending,
  }
}

// TODO: Verify claims against each project's source and owner-approved copy.
// Empty arrays intentionally do not imply a verified stack, demo, or public repo.
const projectDrafts: Project[] = [
  draft('personal-finance-tracker', 'Personal Finance Tracker', 1, [
    'Confirm implemented features and architecture',
    'Supply redacted dashboard screenshots',
    'Verify role, stack, outcomes, repository and demo',
  ]),
  draft('visioncontrol', 'VisionControl', 2, [
    'Confirm current implementation and role',
    'Supply privacy-safe gesture demo',
    'Verify stack, benchmarks and repository',
  ]),
  draft('argus', 'Argus', 3, [
    'Confirm browser / terminal / UI contribution boundaries',
    'Credit collaborators and obtain asset permission',
    'Supply verified screenshots, stack and links',
  ]),
  draft('bluffhouse', 'BluffHouse', 4, [
    'Confirm gameplay implementation and ownership',
    'Supply actual gameplay images',
    'Verify stack, deployment and repository access',
  ]),
  draft('deenstudio', 'DeenStudio', 5, [
    'Supply purpose, role, stack and engineering story',
    'Supply real media and verified links',
  ]),
  draft('pokemon-style-rpg', 'Pokémon-style RPG', 6, [
    'Confirm exact project title, role and implementation',
    'Supply media, stack and verified links',
  ]),
  draft('fsm-sequence-detector', 'FSM Sequence Detector', 7, [
    'Confirm implementation, role and testing approach',
    'Supply media, stack and verified links',
  ]),
]

// Repository-backed observations remain drafts until owner review and missing media/roles are resolved.
export const projects: Project[] = projectDrafts.map((project) => ({
  ...project,
  ...projectStories[project.id],
}))

export function visibleProjects(
  items: readonly Project[],
  includeDrafts: boolean,
) {
  return items
    .filter((project) => includeDrafts || project.status === 'published')
    .toSorted((a, b) => a.order - b.order)
}

export function findProject(slug: string | undefined, includeDrafts: boolean) {
  return visibleProjects(projects, includeDrafts).find(
    (project) => project.slug === slug,
  )
}

export function validateProjects(items: readonly Project[]): string[] {
  const issues: string[] = []
  const slugs = new Set<string>()
  for (const project of items) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug))
      issues.push(`Invalid slug: ${project.slug}`)
    if (slugs.has(project.slug)) issues.push(`Duplicate slug: ${project.slug}`)
    slugs.add(project.slug)
    for (const link of [...project.links, ...(project.sources ?? [])]) {
      try {
        if (new URL(link.url).protocol !== 'https:')
          issues.push(`Unsafe link: ${project.slug}`)
      } catch {
        issues.push(`Invalid link: ${project.slug}`)
      }
    }
    const safeAsset = (src: string) =>
      /^\/(?!\/)[^\s\\?#<>"%]+$/.test(src) &&
      !src.split('/').some((part) => part === '.' || part === '..')
    for (const media of project.media) {
      if (
        !safeAsset(media.src) ||
        !media.altOrCaption.trim() ||
        !Number.isFinite(media.width) ||
        !Number.isFinite(media.height) ||
        media.width <= 0 ||
        media.height <= 0 ||
        (media.poster && !safeAsset(media.poster)) ||
        (media.thumbnailSrc && !safeAsset(media.thumbnailSrc)) ||
        (media.captions && !safeAsset(media.captions.src)) ||
        (media.type === 'video' &&
          (!media.poster || (media.hasAudio && !media.captions)))
      )
        issues.push(`Invalid media: ${project.slug}`)
    }
    for (const feature of project.features ?? []) {
      if (
        feature.mediaIndex !== undefined &&
        (!Number.isInteger(feature.mediaIndex) ||
          !project.media[feature.mediaIndex])
      )
        issues.push(`Invalid feature media: ${project.slug}`)
    }
    const nodeIds = new Set<string>()
    for (const node of project.architectureNodes ?? []) {
      if (
        !/^[a-z0-9-]+$/.test(node.id) ||
        nodeIds.has(node.id) ||
        !node.label.trim() ||
        !node.description.trim()
      )
        issues.push(`Invalid architecture node: ${project.slug}`)
      nodeIds.add(node.id)
    }
    if (
      project.status === 'published' &&
      (!project.summary?.trim() ||
        !project.tagline?.trim() ||
        !project.projectType?.trim() ||
        !project.role?.trim() ||
        !project.challenge?.trim() ||
        !project.solution?.trim() ||
        !project.architecture?.trim() ||
        !project.outcomes?.length ||
        !project.engineeringChallenges?.length ||
        !project.technologies.length ||
        !project.media.length ||
        project.pending.length)
    )
      issues.push(`Published project is incomplete: ${project.slug}`)
  }
  return issues
}
