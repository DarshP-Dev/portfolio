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
  links: { label: string; url: string; kind: 'github' | 'live' | 'demo' }[]
  summary?: string
  role?: string
  collaborators?: string[]
  challenge?: string
  solution?: string
  architecture?: string
  outcomes?: string[]
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
export const projects: Project[] = [
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
    for (const link of project.links) {
      try {
        if (new URL(link.url).protocol !== 'https:')
          issues.push(`Unsafe link: ${project.slug}`)
      } catch {
        issues.push(`Invalid link: ${project.slug}`)
      }
    }
    if (
      project.status === 'published' &&
      (!project.summary?.trim() ||
        !project.role?.trim() ||
        !project.challenge?.trim() ||
        !project.solution?.trim() ||
        !project.architecture?.trim() ||
        !project.outcomes?.length ||
        !project.technologies.length ||
        !project.media.length ||
        project.pending.length)
    )
      issues.push(`Published project is incomplete: ${project.slug}`)
  }
  return issues
}
