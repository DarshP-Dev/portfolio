import { useEffect, useId, useRef, useState } from 'react'
import type { ProjectMedia } from '../../content/projects'
import { useHydrated } from '../../hooks/useHydrated'
import { EmptyAssetPlaceholder } from '../common/EmptyAssetPlaceholder'
import { responsiveImage } from '../common/responsive-image'

function MediaAsset({
  media,
  eager = false,
}: {
  media: ProjectMedia
  eager?: boolean
}) {
  const [failed, setFailed] = useState(false)
  if (failed)
    return (
      <div className="media-error" role="status">
        <p>This media could not be loaded.</p>
        <button
          type="button"
          className="quiet-control"
          onClick={() => setFailed(false)}
        >
          Try again
        </button>
      </div>
    )
  if (media.type === 'video')
    return (
      <video
        src={media.src}
        controls
        playsInline
        muted
        preload="none"
        poster={media.poster}
        width={media.width}
        height={media.height}
        aria-label={media.altOrCaption}
        onError={() => setFailed(true)}
      >
        {media.captions && (
          <track
            kind="captions"
            src={media.captions.src}
            srcLang={media.captions.language}
            label={media.captions.label}
            default
          />
        )}
        Your browser cannot play this video.{' '}
        <a href={media.src}>Open the video file</a>.
      </video>
    )
  return (
    <img
      ref={(image) => {
        if (image?.complete && !image.naturalWidth) setFailed(true)
      }}
      src={media.src}
      {...responsiveImage(media.src, '(min-width: 1280px) 1200px, 95vw')}
      alt={media.altOrCaption}
      width={media.width}
      height={media.height}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}

function pauseVideos(element: HTMLElement | null) {
  element?.querySelectorAll('video').forEach((video) => video.pause())
}

export function MediaGallery({
  media,
  title,
}: {
  media: readonly ProjectMedia[]
  title: string
}) {
  const [selected, setSelected] = useState(0)
  const [open, setOpen] = useState(false)
  const [zoomed, setZoomed] = useState(false)
  const ready = useHydrated()
  const root = useRef<HTMLDivElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const swipe = useRef<{ x: number; y: number } | null>(null)
  const id = useId()
  const current = media[Math.min(selected, media.length - 1)]

  useEffect(() => {
    if (!open) return
    const element = dialog.current!
    const opener = trigger.current
    pauseVideos(root.current)
    element.showModal()
    closeButton.current?.focus()
    return () => {
      pauseVideos(element)
      element.close()
      if (opener?.isConnected) opener.focus({ preventScroll: true })
    }
  }, [open])

  if (!current)
    return (
      <div className="case-media-pending">
        <EmptyAssetPlaceholder
          label={`${title} — original project media pending`}
        />
        <p>Original screenshots or a demo will be added after review.</p>
      </div>
    )
  const choose = (index: number) => {
    if (index < 0 || index >= media.length) return
    pauseVideos(root.current)
    setSelected(Math.max(0, Math.min(media.length - 1, index)))
    setZoomed(false)
  }
  const controls = (modal: boolean) => (
    <div className="media-controls">
      <button
        type="button"
        className="quiet-control"
        aria-disabled={selected === 0}
        aria-label="Previous media"
        onClick={() => choose(selected - 1)}
      >
        ←
      </button>
      <span className="mono">
        {selected + 1} / {media.length}
      </span>
      <button
        type="button"
        className="quiet-control"
        aria-disabled={selected === media.length - 1}
        aria-label="Next media"
        onClick={() => choose(selected + 1)}
      >
        →
      </button>
      {modal && current.type === 'image' && (
        <button
          type="button"
          className="quiet-control media-zoom"
          aria-pressed={zoomed}
          onClick={() => setZoomed(!zoomed)}
        >
          {zoomed ? 'Fit image' : 'Zoom image'}
        </button>
      )}
    </div>
  )
  return (
    <div className="case-media-gallery" ref={root}>
      <figure>
        <div
          className="case-media-stage"
          id={`${id}-stage`}
          onPointerDown={(event) => {
            if (event.pointerType === 'touch' && current.type === 'image')
              swipe.current = { x: event.clientX, y: event.clientY }
          }}
          onPointerCancel={() => {
            swipe.current = null
          }}
          onPointerUp={(event) => {
            const start = swipe.current
            swipe.current = null
            if (!start || event.pointerType !== 'touch') return
            const x = event.clientX - start.x,
              y = event.clientY - start.y
            if (Math.abs(x) > 60 && Math.abs(x) > Math.abs(y) * 1.5)
              choose(selected + (x < 0 ? 1 : -1))
          }}
        >
          <MediaAsset key={current.src} media={current} eager />
          {ready && (
            <button
              type="button"
              ref={trigger}
              className="media-enlarge quiet-control"
              onClick={() => setOpen(true)}
              aria-haspopup="dialog"
            >
              {current.type === 'image' ? 'Enlarge image' : 'Open video viewer'}{' '}
              <span aria-hidden="true">↗</span>
            </button>
          )}
        </div>
        <figcaption>
          <span className="mono">
            Media / {String(selected + 1).padStart(2, '0')}
          </span>
          <p>{current.caption ?? current.altOrCaption}</p>
        </figcaption>
      </figure>
      {ready && media.length > 1 && (
        <>
          {controls(false)}
          <ol className="media-selector" aria-label={`${title} media`}>
            {media.map((item, index) => (
              <li key={item.src}>
                <button
                  type="button"
                  aria-pressed={selected === index}
                  aria-controls={`${id}-stage`}
                  onClick={() => choose(index)}
                >
                  <span className="mono">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span>{item.caption ?? item.altOrCaption}</span>
                </button>
              </li>
            ))}
          </ol>
        </>
      )}
      <p
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Media {selected + 1} of {media.length}:{' '}
        {current.caption ?? current.altOrCaption}
      </p>
      {!ready && media.length > 1 && (
        <details className="media-nojs">
          <summary>More project media</summary>
          <ul>
            {media.slice(1).map((item) => (
              <li key={item.src}>
                <a href={item.src}>{item.caption ?? item.altOrCaption}</a>
              </li>
            ))}
          </ul>
        </details>
      )}
      <dialog
        className="media-dialog"
        ref={dialog}
        aria-labelledby={`${id}-dialog-title`}
        onCancel={(event) => {
          event.preventDefault()
          setOpen(false)
        }}
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()
          if (
            event.target === event.currentTarget &&
            (event.clientX < rect.left ||
              event.clientX > rect.right ||
              event.clientY < rect.top ||
              event.clientY > rect.bottom)
          )
            setOpen(false)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Tab') {
            const nodes = Array.from(
              event.currentTarget.querySelectorAll<HTMLElement>(
                'button:not(:disabled), a[href], video, [tabindex="0"]',
              ),
            ).filter((node) => node.getClientRects().length > 0)
            const first = nodes[0],
              last = nodes.at(-1)
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault()
              last?.focus()
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault()
              first?.focus()
            }
            return
          }
          if (
            (event.target as HTMLElement).closest('video, [data-zoomed="true"]')
          )
            return
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault()
            choose(selected + (event.key === 'ArrowLeft' ? -1 : 1))
          }
        }}
      >
        {open && (
          <>
            <div className="media-dialog-heading">
              <h2 id={`${id}-dialog-title`}>{title} — media</h2>
              <button
                type="button"
                className="quiet-control"
                ref={closeButton}
                onClick={() => setOpen(false)}
              >
                Close viewer <span aria-hidden="true">×</span>
              </button>
            </div>
            <div
              className="media-dialog-stage"
              data-zoomed={zoomed}
              tabIndex={zoomed ? 0 : undefined}
              role={zoomed ? 'region' : undefined}
              aria-label={
                zoomed ? 'Zoomed image; scroll to explore' : undefined
              }
            >
              <MediaAsset key={current.src} media={current} />
            </div>
            <p className="media-dialog-caption">
              {current.caption ?? current.altOrCaption}
            </p>
            {controls(true)}
          </>
        )}
      </dialog>
    </div>
  )
}
