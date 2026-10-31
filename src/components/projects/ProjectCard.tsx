import { Link } from 'react-router'
import type { Project } from '../../content/projects'
import { EmptyAssetPlaceholder } from '../common/EmptyAssetPlaceholder'

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="project-card">
      <Link to={`/projects/${project.slug}`} className="project-link">
        <EmptyAssetPlaceholder
          label="Project screenshot pending"
          number={String(project.order).padStart(2, '0')}
        />
        <div className="project-caption">
          <div>
            <h3>{project.title}</h3>
            <p>
              {project.status === 'draft'
                ? 'Draft case study · content pending'
                : project.summary}
            </p>
          </div>
          <span className="project-arrow" aria-hidden="true">
            ↗
          </span>
        </div>
      </Link>
    </article>
  )
}
