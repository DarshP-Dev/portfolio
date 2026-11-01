import { Link, useLocation, type LinkProps } from 'react-router'
import type { Project } from '../../content/projects'
import {
  projectReturn,
  rememberProjectPosition,
} from '../../app/project-return'

export function ProjectLink({
  project,
  source,
  onClick,
  ...props
}: Omit<LinkProps, 'to' | 'state'> & {
  project: Pick<Project, 'slug'>
  source: 'hero' | 'gallery' | 'more' | 'card'
}) {
  const location = useLocation()
  const focusKey = `${source}:${project.slug}`
  return (
    <Link
      {...props}
      to={`/projects/${project.slug}`}
      data-project-return={focusKey}
      state={{
        portfolioReturn: {
          key: location.key,
          href: location.pathname + location.search + location.hash,
        },
      }}
      onClick={(event) => {
        onClick?.(event)
        if (
          !event.defaultPrevented &&
          event.button === 0 &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey &&
          !event.altKey &&
          location.pathname === '/'
        )
          rememberProjectPosition(location.key, {
            y: scrollY,
            width: innerWidth,
            focusKey,
          })
      }}
    />
  )
}

export function BackToProjects({
  children,
  className = 'text-link',
}: Pick<LinkProps, 'children' | 'className'>) {
  const location = useLocation()
  const back = projectReturn(location.state?.portfolioReturn)
  return (
    <Link
      to={back?.href ?? '/#projects'}
      state={back ? { restorePortfolio: back.key } : undefined}
      className={className}
    >
      {children}
    </Link>
  )
}

export function NextProjectLink({ project }: { project: Project }) {
  const location = useLocation()
  const back = projectReturn(location.state?.portfolioReturn)
  return (
    <Link
      className="next-project-link"
      to={`/projects/${project.slug}`}
      state={back ? { portfolioReturn: back } : undefined}
    >
      <span className="eyebrow">
        Next project / {String(project.order).padStart(2, '0')}
      </span>
      <strong>{project.title}</strong>
      <span>{project.tagline ?? 'Case study in preparation'}</span>
      <i aria-hidden="true">↗</i>
    </Link>
  )
}
