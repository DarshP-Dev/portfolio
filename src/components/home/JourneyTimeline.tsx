import { useEffect, useId, useRef } from 'react'
import { Link } from 'react-router'
import type { TimelineEntry } from '../../content/timeline'

export function JourneyTimeline({ entries }: { entries: TimelineEntry[] }) {
  const root = useRef<HTMLDivElement>(null)
  const group = useId()
  useEffect(() => {
    const element = root.current!
    const articles = Array.from(
      element.querySelectorAll<HTMLElement>('.timeline-milestone'),
    )
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let visible = false
    let disposed = false
    const measure = () => {
      frame = 0
      const length = articles.at(-1)!.offsetTop
      const progress = motion.matches
        ? length
        : Math.max(
            0,
            Math.min(
              length,
              innerHeight * 0.64 - element.getBoundingClientRect().top - 10,
            ),
          )
      element.style.setProperty('--journey-length', `${length}px`)
      element.style.setProperty('--journey-progress', `${progress}px`)
      articles.forEach((article) => {
        article.dataset.reached = String(
          motion.matches || article.offsetTop <= progress,
        )
      })
    }
    const schedule = () => {
      if (!frame && !disposed && (visible || motion.matches))
        frame = requestAnimationFrame(measure)
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      schedule()
    })
    observer.observe(element)
    const resize = new ResizeObserver(schedule)
    resize.observe(element)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    motion.addEventListener('change', schedule)
    document.fonts.ready.then(schedule)
    measure()
    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      resize.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      motion.removeEventListener('change', schedule)
    }
  }, [entries])
  return (
    <div className="editorial-timeline" ref={root}>
      <div className="timeline-track" aria-hidden="true">
        <span />
        <i />
      </div>
      {entries.map((entry, index) => (
        <article
          className="timeline-milestone"
          data-kind={entry.kind}
          key={entry.id}
        >
          <span className="timeline-node" aria-hidden="true" />
          <span className="timeline-year" aria-hidden="true">
            {entry.year ?? entry.startDate.match(/\b\d{4}\b/)?.[0]}
          </span>
          <p className="eyebrow">
            {entry.kind} / {entry.startDate}
            {entry.endDate ? ` — ${entry.endDate}` : ''}
          </p>
          <h3>{entry.title}</h3>
          <p className="timeline-organization">{entry.organization}</p>
          <p>{entry.summary}</p>
          {entry.preview && (
            <img
              className="timeline-preview"
              {...entry.preview}
              loading="lazy"
            />
          )}
          {!!entry.details?.length && (
            <details
              className="timeline-details"
              name={group}
              open={index === 0}
            >
              <summary>
                Explore <span aria-hidden="true">+</span>
              </summary>
              <div>
                {entry.details.map((detail) => (
                  <p key={detail}>{detail}</p>
                ))}
              </div>
            </details>
          )}
        </article>
      ))}
      {!entries.length && (
        <article className="timeline-milestone" data-kind="pending">
          <span className="timeline-node" aria-hidden="true" />
          <p className="eyebrow">Timeline in preparation</p>
          <h3>Verified milestones, coming next.</h3>
          <p>
            Education details, experience, and dates will be added from the
            current resume.
          </p>
          <details className="timeline-details" name={group}>
            <summary>
              What’s being prepared <span aria-hidden="true">+</span>
            </summary>
            <div>
              <p>
                Confirmed program dates, role descriptions, contributions, and
                approved images. Each milestone will include its original
                context and supporting details.
              </p>
              <p>No unverified employment or graduation dates are listed.</p>
            </div>
          </details>
        </article>
      )}
      <article className="timeline-milestone timeline-next" data-kind="next">
        <span className="timeline-node" aria-hidden="true" />
        <p className="eyebrow">Looking ahead</p>
        <h3>What’s Next?</h3>
        <p>
          Continuing to build thoughtful software and explore opportunities in
          software engineering, internships, co-op, and collaboration.
        </p>
        <Link to="/#contact" className="text-link">
          Contact Me <span aria-hidden="true">↗</span>
        </Link>
      </article>
    </div>
  )
}
