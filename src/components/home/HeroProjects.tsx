import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { gsap } from 'gsap'
import type { Project } from '../../content/projects'
import { useHydrated } from '../../hooks/useHydrated'
import { ProjectPreview } from './ProjectPreview'

export function HeroProjects({ projects }: { projects: Project[] }) {
  const root = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLOListElement>(null)
  const [paused, setPaused] = useState(false)
  const pauseRef = useRef(paused)
  const hydrated = useHydrated()

  useEffect(() => {
    pauseRef.current = paused
    root.current?.dispatchEvent(new Event('orbitpausechange'))
  }, [paused])

  useEffect(() => {
    const element = root.current!
    const list = track.current!
    const items = Array.from(list.children) as HTMLElement[]
    if (!items.length) return
    const media = gsap.matchMedia()
    media.add('(min-width: 1100px)', () => {
      const motion = matchMedia('(prefers-reduced-motion: reduce)')
      const state = { angle: -Math.PI / 2 }
      let visible = false
      let interacting = false
      const place = () => {
        const width = list.clientWidth
        const height = list.clientHeight
        const radiusX = Math.max(0, (width - items[0].offsetWidth) / 2 - 8)
        const radiusY = (height - items[0].offsetHeight) / 2 - 12
        items.forEach((item, index) => {
          const angle = state.angle + (index / items.length) * Math.PI * 2
          item.style.left = `${width / 2 + Math.cos(angle) * radiusX}px`
          item.style.top = `${height / 2 + Math.sin(angle) * radiusY}px`
        })
      }
      const spin = gsap.to(state, {
        angle: state.angle + Math.PI * 2,
        duration: 36,
        ease: 'none',
        repeat: -1,
        paused: true,
        onUpdate: place,
      })
      const sync = () => {
        const nextSection =
          element.closest('.stack-section')?.nextElementSibling
        const covered =
          nextSection &&
          nextSection.getBoundingClientRect().top <
            list.getBoundingClientRect().bottom
        const running =
          !pauseRef.current &&
          !motion.matches &&
          visible &&
          !interacting &&
          !covered &&
          !document.querySelector('dialog[open]') &&
          !document.hidden
        spin.paused(!running)
        element.dataset.orbit = running ? 'playing' : 'paused'
      }
      const interaction = () => {
        interacting =
          list.matches(':hover') || list.contains(document.activeElement)
        sync()
      }
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting
        sync()
      })
      observer.observe(list)
      const dialogs = new MutationObserver(sync)
      dialogs.observe(document.body, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['open'],
      })
      const resize = new ResizeObserver(place)
      resize.observe(list)
      place()
      for (const event of [
        'pointerenter',
        'pointerleave',
        'focusin',
        'focusout',
      ]) {
        list.addEventListener(event, interaction)
      }
      motion.addEventListener('change', sync)
      element.addEventListener('orbitpausechange', sync)
      document.addEventListener('visibilitychange', sync)
      window.addEventListener('scroll', sync, { passive: true })
      return () => {
        spin.kill()
        observer.disconnect()
        dialogs.disconnect()
        resize.disconnect()
        motion.removeEventListener('change', sync)
        element.removeEventListener('orbitpausechange', sync)
        document.removeEventListener('visibilitychange', sync)
        window.removeEventListener('scroll', sync)
        for (const event of [
          'pointerenter',
          'pointerleave',
          'focusin',
          'focusout',
        ]) {
          list.removeEventListener(event, interaction)
        }
        items.forEach((item) => {
          item.style.removeProperty('left')
          item.style.removeProperty('top')
        })
        delete element.dataset.orbit
      }
    })
    return () => media.revert()
  }, [projects])

  const move = (direction: number) => {
    const list = track.current!
    const cards = Array.from(list.children) as HTMLElement[]
    const current = cards.reduce(
      (nearest, card, index) =>
        Math.abs(card.offsetLeft - cards[0].offsetLeft - list.scrollLeft) <
        Math.abs(
          cards[nearest].offsetLeft - cards[0].offsetLeft - list.scrollLeft,
        )
          ? index
          : nearest,
      0,
    )
    const target =
      cards[Math.max(0, Math.min(cards.length - 1, current + direction))]
    if (target) {
      list.scrollTo({
        left: target.offsetLeft - cards[0].offsetLeft,
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
      })
      target.querySelector('a')?.focus({ preventScroll: true })
    }
  }

  return (
    <div
      className="hero-work"
      ref={root}
      aria-label="Featured project previews"
    >
      <div className="section-topline">
        <p className="eyebrow">Selected work</p>
        {hydrated && projects.length > 1 && (
          <button
            className="orbit-control quiet-control"
            type="button"
            aria-pressed={paused}
            onClick={() => setPaused(!paused)}
          >
            {paused ? 'Resume orbit' : 'Pause orbit'}
          </button>
        )}
      </div>
      <ol className="hero-orbit" ref={track} id="hero-projects">
        {projects.map((project, index) => (
          <li
            key={project.id}
            style={
              {
                '--orbit-left': `${50 + 32 * Math.cos(-Math.PI / 2 + (index / projects.length) * Math.PI * 2)}%`,
                '--orbit-top': `${50 + 34 * Math.sin(-Math.PI / 2 + (index / projects.length) * Math.PI * 2)}%`,
              } as CSSProperties
            }
          >
            <Link
              to={`/projects/${project.slug}`}
              aria-label={`${String(project.order).padStart(2, '0')} ${project.title}`}
            >
              <ProjectPreview project={project} />
              <span className="orbit-title">
                {project.title}
                <span aria-hidden="true">↗</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
      {!projects.length && (
        <p className="content-note">Reviewed projects will appear here.</p>
      )}
      {hydrated && projects.length > 1 && (
        <div className="hero-row-controls">
          <span className="mono quiet">Swipe to explore</span>
          <button
            type="button"
            className="quiet-control"
            aria-label="Previous project preview"
            aria-controls="hero-projects"
            onClick={() => move(-1)}
          >
            ←
          </button>
          <button
            type="button"
            className="quiet-control"
            aria-label="Next project preview"
            aria-controls="hero-projects"
            onClick={() => move(1)}
          >
            →
          </button>
        </div>
      )}
      <p className="asset-note">Original project imagery is being prepared.</p>
    </div>
  )
}
