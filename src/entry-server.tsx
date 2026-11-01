import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import App from './App'
import { pageMetadata } from './app/metadata'
import { projects, validateProjects, visibleProjects } from './content/projects'
import { site } from './content/site'
import { crawlerFiles } from './content/publication'
export { includePublicAsset as includeAsset } from './content/publication'

export function render(path: string) {
  return {
    html: renderToString(
      <StaticRouter location={path}>
        <App />
      </StaticRouter>,
    ),
    metadata: pageMetadata(path),
  }
}

export function prerenderPaths() {
  const issues = validateProjects(projects)
  if (issues.length) throw new Error(issues.join('\n'))
  return [
    '/',
    ...visibleProjects(projects, site.includeDrafts).map(
      (project) => `/projects/${project.slug}`,
    ),
  ]
}

export function publicationFiles() {
  return crawlerFiles(
    site,
    projects
      .filter((project) => project.status === 'published')
      .map((project) => `/projects/${project.slug}`),
  )
}

/** Build-only input for local asset generation; no separate handwritten content list. */
export function assetProjects() {
  return projects
}

export function publicAssets() {
  return {
    projectSlugs: visibleProjects(projects, site.includeDrafts).map(
      (project) => project.slug,
    ),
    resumeUrl: site.resume,
  }
}

export function publicLinks() {
  return [
    ...new Set([
      site.github,
      site.linkedin,
      ...projects.flatMap((project) =>
        [...project.links, ...(project.sources ?? [])].map((link) => link.url),
      ),
    ]),
  ]
}
