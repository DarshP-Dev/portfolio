import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import App from './App'
import { pageMetadata } from './app/metadata'
import { projects, validateProjects, visibleProjects } from './content/projects'
import { site } from './content/site'

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
