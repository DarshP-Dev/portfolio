import { useParams } from 'react-router'
import { findProject, projects, visibleProjects } from '../content/projects'
import { site } from '../content/site'
import { CaseStudy } from '../components/projects/CaseStudy'
import { NotFoundPage } from './NotFoundPage'

export function ProjectPage() {
  const { slug } = useParams()
  const project = findProject(slug, site.includeDrafts)
  if (!project) return <NotFoundPage />
  const visible = visibleProjects(projects, site.includeDrafts)
  const next =
    visible.length > 1
      ? visible[(visible.indexOf(project) + 1) % visible.length]
      : undefined
  return <CaseStudy key={project.slug} project={project} next={next} />
}
