import type { Project } from '../../content/projects'

/** Real media when available; deliberately abstract, labeled artwork otherwise. */
export function ProjectPreview({ project }: { project: Project }) {
  const image = project.media.find((media) => media.type === 'image')
  return image ? (
    <img
      className="project-preview-image"
      src={image.thumbnailSrc ?? image.src}
      alt={image.altOrCaption}
      width={image.width}
      height={image.height}
      loading="lazy"
      decoding="async"
    />
  ) : (
    <div className={`project-art project-art--${project.order}`}>
      <span className="project-art-index" aria-hidden="true">
        {String(project.order).padStart(2, '0')}
      </span>
      <span className="project-art-shape" aria-hidden="true" />
      <span className="project-art-note">Screenshot pending</span>
    </div>
  )
}
