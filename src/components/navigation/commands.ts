import { navigation, site } from '../../content/site'
import { projects, visibleProjects } from '../../content/projects'

export interface CommandAction {
  id: string
  label: string
  description: string
  group: 'Section' | 'Project' | 'Action'
  href: string
  keywords?: string
}

export function buildCommands(includeDrafts = false): CommandAction[] {
  const sections: CommandAction[] = navigation.map(({ id, label }) => ({
    id,
    label: id === 'experience' ? 'Experience & Education' : label,
    description:
      id === 'experience' ? 'My journey' : `Go to ${label.toLowerCase()}`,
    group: 'Section',
    href: `/#${id}`,
    keywords: id === 'experience' ? 'journey timeline resume education' : id,
  }))
  const work: CommandAction[] = visibleProjects(projects, includeDrafts).map(
    (project) => ({
      id: project.id,
      label: project.title,
      description:
        project.status === 'published'
          ? 'Read the case study'
          : 'Draft case study · preview only',
      group: 'Project',
      href: `/projects/${project.slug}`,
      keywords: project.technologies.join(' '),
    }),
  )
  const actions: CommandAction[] = []
  for (const [id, label, href] of [
    ['resume', 'Resume', site.resume],
    ['github', 'GitHub', site.github],
    ['linkedin', 'LinkedIn', site.linkedin],
    ['email', 'Email Darsh', site.email ? `mailto:${site.email}` : undefined],
  ] as const) {
    if (href)
      actions.push({
        id,
        label,
        href,
        group: 'Action',
        description:
          id === 'resume' ? 'Open the verified resume PDF' : `Open ${label}`,
      })
  }
  return [...sections, ...work, ...actions]
}

export function filterCommands(
  actions: readonly CommandAction[],
  query: string,
) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  return actions.filter((action) =>
    terms.every((term) =>
      `${action.label} ${action.description} ${action.group} ${action.keywords || ''}`
        .toLowerCase()
        .includes(term),
    ),
  )
}

export function isEditable(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    Boolean(
      target.closest(
        'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]',
      ),
    )
  )
}
