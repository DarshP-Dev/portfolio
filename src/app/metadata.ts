import { findProject, type Project } from '../content/projects'
import { site } from '../content/site'

export function projectShareImage(
  project: Project | undefined,
  origin: string | undefined,
) {
  const image = project?.media.find((media) => media.type === 'image')
  if (!image || !origin) return
  return {
    url: new URL(image.src, origin).href,
    alt: image.altOrCaption,
    width: image.width,
    height: image.height,
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
    image: projectShareImage(project, site.canonicalOrigin),
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
    robots: 'noindex, nofollow',
    canonical:
      found && site.canonicalOrigin
        ? new URL(path, site.canonicalOrigin).href
        : undefined,
    found,
  }
}
