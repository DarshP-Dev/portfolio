import { findProject, type Project } from '../content/projects'
import { site } from '../content/site'

export function projectShareImage(
  project: Project | undefined,
  origin: string | undefined,
) {
  if (!origin) return
  return {
    url: new URL(
      project ? `/og/${project.slug}.png` : '/og/portfolio.png',
      origin,
    ).href,
    alt: project
      ? `${project.title} — a project case study by Darsh Patel`
      : 'Darsh Patel — Software Engineering Portfolio',
    width: 1200,
    height: 630,
  }
}

export function pageMetadata(pathname: string) {
  const path = pathname.replace(/\/+$/, '') || '/'
  const project = path.startsWith('/projects/')
    ? findProject(path.slice('/projects/'.length), site.includeDrafts)
    : undefined
  const found = path === '/' || Boolean(project)
  return {
    type: project ? 'article' : 'website',
    image: found ? projectShareImage(project, site.canonicalOrigin) : undefined,
    title:
      path === '/'
        ? site.title
        : project
          ? `${project.title} — Darsh Patel`
          : 'Page not found — Darsh Patel',
    description: project
      ? project.summary ||
        `${project.title} by Darsh Patel. This draft case study is awaiting verified project details and media.`
      : found
        ? site.description
        : 'This page could not be found. Return to Darsh Patel’s portfolio.',
    robots:
      found &&
      site.indexingEnabled &&
      (!project || project.status === 'published')
        ? 'index, follow'
        : 'noindex, nofollow',
    canonical:
      found && site.canonicalOrigin
        ? new URL(path, site.canonicalOrigin).href
        : undefined,
    found,
  }
}
