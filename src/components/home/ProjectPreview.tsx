import type { Project } from '../../content/projects'
import { responsiveImage } from '../common/responsive-image'

/** Real media when available; deliberately abstract, labeled artwork otherwise. */
export function ProjectPreview({
  project,
  hero = false,
  priority = false,
}: {
  project: Project
  hero?: boolean
  priority?: boolean
}) {
  const image = project.media.find((media) => media.type === 'image')
  return image ? (
    <img
      className="project-preview-image"
      src={image.thumbnailSrc ?? image.src}
      {...responsiveImage(
        image.src,
        hero
          ? '(min-width: 1100px) 180px, (min-width: 640px) 38vw, 85vw'
          : '(min-width: 1100px) 640px, (min-width: 640px) 45vw, 90vw',
      )}
      alt={image.altOrCaption}
      width={image.width}
      height={image.height}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
    />
  ) : (
    <div className={`project-art project-art--${project.order}`}>
      <span className="project-art-index" aria-hidden="true">
        {String(project.order).padStart(2, '0')}
      </span>{' '}
      <span className="project-art-shape" aria-hidden="true" />
      <span className="project-art-note">Screenshot pending</span>
    </div>
  )
}
