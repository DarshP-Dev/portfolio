import type { ReactNode } from 'react'
import { Link } from 'react-router'
import type { Project } from '../../content/projects'
import { MediaGallery } from './MediaGallery'
import { ArchitectureMap } from './ArchitectureMap'
import { BackToProjects, NextProjectLink } from './ProjectLinks'
import './case-study.css'

function CaseSection({
  project,
  id,
  number,
  title,
  children,
}: {
  project: Project
  id: string
  number: string
  title: string
  children: ReactNode
}) {
  return (
    <section
      className="case-section"
      id={`${project.slug}-${id}`}
      tabIndex={-1}
      aria-labelledby={`${id}-heading`}
    >
      <div className="case-section-label">
        <span className="mono">{number} /</span>
        <h2 id={`${id}-heading`}>{title}</h2>
      </div>
      <div className="case-section-content">{children}</div>
    </section>
  )
}
function Pending({ children }: { children: ReactNode }) {
  return <p className="case-pending">{children}</p>
}

export function CaseStudy({
  project,
  next,
}: {
  project: Project
  next?: Project
}) {
  return (
    <article className="case-study page-width">
      <BackToProjects className="text-link back-link">
        ← Back to All Projects
      </BackToProjects>
      <header className="case-hero">
        <p className="eyebrow">
          Project {String(project.order).padStart(2, '0')} /{' '}
          {project.status === 'published' ? 'Case study' : 'Draft case study'}
        </p>
        <h1 tabIndex={-1}>{project.title}</h1>
        <p className="case-tagline">
          {project.tagline ?? 'The engineering story is being prepared.'}
        </p>
        <p className="case-summary">
          {project.summary ??
            'Original media and an owner-reviewed account of the project will be added here. Implementation details and outcomes remain pending.'}
        </p>
        {project.technologies.length > 0 && (
          <ul className="case-technologies" aria-label="Project technologies">
            {project.technologies.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
        )}
        {!!project.links.length && (
          <div className="case-external-links">
            {project.links.map((link) => (
              <a
                className="text-link"
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label} <span aria-hidden="true">↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ))}
          </div>
        )}
        {project.status !== 'published' && (
          <p className="case-review-note">
            This is a development draft.{' '}
            {project.sources?.length
              ? 'Technical descriptions are grounded in the linked repository sources; personal contribution, media and outcomes still require the review noted below.'
              : 'Project details and media are awaiting verification.'}
          </p>
        )}
      </header>
      <section aria-label="Project media showcase">
        <MediaGallery
          key={project.slug}
          media={project.media}
          title={project.title}
        />
      </section>
      <nav className="case-contents" aria-label="On this page">
        <span className="mono">In this case study</span>
        {[
          ['snapshot', 'Snapshot'],
          ['challenge', 'Challenge'],
          ['solution', 'Solution'],
          ['architecture', 'Under the hood'],
          ['engineering', 'Engineering'],
          ['results', 'Results'],
        ].map(([id, label]) => (
          <Link key={id} to={`#${project.slug}-${id}`}>
            {label}
          </Link>
        ))}
      </nav>
      <CaseSection
        project={project}
        id="snapshot"
        number="01"
        title="Project snapshot"
      >
        <dl className="case-snapshot">
          <div>
            <dt>Role</dt>
            <dd>{project.role ?? 'Pending owner verification'}</dd>
          </div>
          <div>
            <dt>Project type</dt>
            <dd>{project.projectType ?? 'Pending owner verification'}</dd>
          </div>
          {project.timeline && (
            <div>
              <dt>Timeline</dt>
              <dd>{project.timeline}</dd>
            </div>
          )}
          {!!project.collaborators?.length && (
            <div>
              <dt>Collaborators</dt>
              <dd>{project.collaborators.join(', ')}</dd>
            </div>
          )}
        </dl>
        {project.contribution && (
          <div className="case-contribution">
            <h3>My contribution</h3>
            <p>{project.contribution.summary}</p>
            <ul>
              {project.contribution.work.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="case-team-note">{project.contribution.credits}</p>
          </div>
        )}
        {project.id === 'argus' && !project.contribution && (
          <p className="case-team-note">
            Argus is a team project. Darsh’s browser, terminal and UI
            contribution boundaries, along with collaborator credits, must be
            confirmed before publication.
          </p>
        )}
      </CaseSection>
      <CaseSection
        project={project}
        id="challenge"
        number="02"
        title="The challenge"
      >
        {project.challenge ? (
          <p className="case-lead">{project.challenge}</p>
        ) : (
          <Pending>
            The problem, goals and constraints will be described after owner
            review.
          </Pending>
        )}
      </CaseSection>
      <CaseSection
        project={project}
        id="solution"
        number="03"
        title="The solution"
      >
        {project.solution ? (
          <p>{project.solution}</p>
        ) : (
          <Pending>
            Verified features and user workflows are being prepared.
          </Pending>
        )}
        {!!project.features?.length && (
          <div className="case-features">
            {project.features.map((feature, index) => {
              const media =
                feature.mediaIndex === undefined
                  ? undefined
                  : project.media[feature.mediaIndex]
              return (
                <div className="case-feature" key={feature.title}>
                  <span className="mono quiet">0{index + 1}</span>
                  <div>
                    <h3>{feature.title}</h3>
                    <p>{feature.body}</p>
                    {media?.type === 'image' && (
                      <figure>
                        <img
                          src={media.src}
                          width={media.width}
                          height={media.height}
                          alt={media.altOrCaption}
                          loading="lazy"
                          decoding="async"
                        />
                        <figcaption>
                          {media.caption ?? media.altOrCaption}
                        </figcaption>
                      </figure>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CaseSection>
      <CaseSection
        project={project}
        id="architecture"
        number="04"
        title="Under the hood"
      >
        {project.architecture ? (
          <p>{project.architecture}</p>
        ) : (
          <Pending>
            An accurate architecture and data-flow explanation will follow the
            source review.
          </Pending>
        )}
        {!!project.architectureNodes?.length && (
          <ArchitectureMap nodes={project.architectureNodes} />
        )}
        {!!project.deepDives?.length && (
          <div className="case-deep-dives">
            {project.deepDives.map((detail) => (
              <details key={detail.title}>
                <summary>
                  {detail.title}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{detail.body}</p>
              </details>
            ))}
          </div>
        )}
      </CaseSection>
      <CaseSection
        project={project}
        id="engineering"
        number="05"
        title="Engineering challenges"
      >
        {project.engineeringChallenges?.length ? (
          <div className="engineering-decisions">
            {project.engineeringChallenges.map((challenge) => (
              <article key={challenge.title}>
                <h3>{challenge.title}</h3>
                <dl>
                  {[
                    ['Context', challenge.problem],
                    ['Decision', challenge.approach],
                    ['Tradeoff', challenge.tradeoff],
                    ['Evidence', challenge.result],
                  ]
                    .filter(([, body]) => body)
                    .map(([label, body]) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>{body}</dd>
                      </div>
                    ))}
                </dl>
              </article>
            ))}
          </div>
        ) : (
          <Pending>
            Specific technical decisions, tradeoffs and their evidence are
            awaiting verification.
          </Pending>
        )}
      </CaseSection>
      <CaseSection
        project={project}
        id="results"
        number="06"
        title="Results & next steps"
      >
        <div className="case-results">
          <div>
            <h3>Implementation evidence</h3>
            {project.outcomes?.length ? (
              <ul>
                {project.outcomes.map((outcome) => (
                  <li key={outcome}>{outcome}</li>
                ))}
              </ul>
            ) : (
              <Pending>
                No results or performance metrics have been verified yet.
              </Pending>
            )}
          </div>
          {!!project.learnings?.length && (
            <div>
              <h3>Learning from the work</h3>
              <ul>
                {project.learnings.map((learning) => (
                  <li key={learning}>{learning}</li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <h3>Next steps</h3>
            {project.nextSteps?.length ? (
              <ul>
                {project.nextSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            ) : (
              <Pending>
                Owner-reviewed improvements and lessons will appear here.
              </Pending>
            )}
          </div>
        </div>
        {project.status !== 'published' && (
          <details className="case-review-details">
            <summary>Sources & review status</summary>
            {!!project.sources?.length && (
              <>
                <h3>Implementation sources</h3>
                <ul>
                  {project.sources.map((item) => (
                    <li key={item.url}>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.label} ↗
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <h3>Before publication</h3>
            <ul>
              {project.pending.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </details>
        )}
      </CaseSection>
      <section className="case-continue" aria-labelledby="continue-heading">
        <p className="eyebrow">Keep exploring</p>
        <h2 id="continue-heading">There’s more to build.</h2>
        {next && <NextProjectLink project={next} />}
        <BackToProjects>← Back to Projects</BackToProjects>
      </section>
    </article>
  )
}
