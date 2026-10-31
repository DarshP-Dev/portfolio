import { Link, useParams } from 'react-router'
import { findProject } from '../content/projects'
import { site } from '../content/site'
import { EmptyAssetPlaceholder } from '../components/common/EmptyAssetPlaceholder'
import { NotFoundPage } from './NotFoundPage'

export function ProjectPage() {
  const { slug } = useParams()
  const project = findProject(slug, site.includeDrafts)
  if (!project) return <NotFoundPage />
  return (
    <article className="project-page page-width">
      <Link to="/#projects" className="text-link back-link">
        ← Back to All Projects
      </Link>
      <div className="project-page-heading">
        <p className="eyebrow">
          Project {String(project.order).padStart(2, '0')} / Draft case study
        </p>
        <h1 tabIndex={-1}>{project.title}</h1>
        <p className="lead-copy">
          {project.summary ||
            'The project is part of the selected work. Its engineering story and original media are awaiting review.'}
        </p>
      </div>
      <EmptyAssetPlaceholder
        label={`${project.title} — original project media pending`}
        number={String(project.order).padStart(2, '0')}
      />
      <section className="case-study-note" aria-labelledby="draft-heading">
        <p className="eyebrow">Content status</p>
        <h2 id="draft-heading">An honest starting point.</h2>
        <p>
          This is a development draft, not a completed case study.
          Implementation details, contributions, and outcomes will appear once
          verified.
        </p>
        <h3>Before this case study is published</h3>
        <ul>
          {project.pending.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {project.id === 'argus' && (
          <p>
            Argus is a team project. Darsh’s contribution will be described
            separately from the team’s work.
          </p>
        )}
      </section>
      <div className="project-page-end">
        <Link to="/#projects" className="text-link">
          ← Back to Projects
        </Link>
        <span className="mono quiet">Case study in preparation</span>
      </div>
    </article>
  )
}
