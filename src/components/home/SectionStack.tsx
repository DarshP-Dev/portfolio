import {
  Children,
  useEffect,
  useRef,
  type ReactNode,
  type CSSProperties,
} from 'react'
import { gsap } from 'gsap'

/** ScrollStack concept, adapted to native window scrolling and natural-height sections.
 * A tall section scrolls fully before its trailing edge sticks. No scroll interception.
 */
export function SectionStack({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const elements = Array.from(
      root.current!.querySelectorAll<HTMLElement>(
        '.about-layout > *, .skills-constellation',
      ),
    )
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const tweens: gsap.core.Tween[] = []
      const observer = new IntersectionObserver(
        (entries) =>
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            tweens.push(
              gsap.fromTo(
                entry.target,
                { opacity: 0, y: 12 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.65,
                  ease: 'power2.out',
                  clearProps: 'opacity,transform',
                },
              ),
            )
            observer.unobserve(entry.target)
          }),
        { threshold: 0.15 },
      )
      elements.forEach((element) => observer.observe(element))
      const finish = () => tweens.forEach((tween) => tween.progress(1))
      root.current!.addEventListener('focusin', finish)
      const element = root.current!
      return () => {
        observer.disconnect()
        tweens.forEach((tween) => tween.kill())
        elements.forEach((element) => {
          element.style.removeProperty('opacity')
          element.style.removeProperty('transform')
        })
        element.removeEventListener('focusin', finish)
      }
    })
    return () => media.revert()
  }, [])
  useEffect(() => {
    const element = root.current!
    const panels = Array.from(element.children) as HTMLElement[]
    const media = matchMedia(
      '(min-width: 1100px) and (min-height: 600px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    )
    let frame = 0
    let disposed = false
    const clear = () =>
      panels.forEach((panel) =>
        panel.firstElementChild?.removeAttribute('style'),
      )
    const update = () => {
      frame = 0
      if (!media.matches) return
      const focused = element.contains(document.activeElement)
      element.dataset.stacking = focused ? 'focus' : 'active'
      const header =
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue(
            '--navigation-offset',
          ),
        ) || 90
      panels.forEach((panel, index) => {
        panel.style.setProperty(
          '--stack-top',
          `${Math.min(header, innerHeight - panel.offsetHeight)}px`,
        )
        const surface = panel.firstElementChild as HTMLElement
        const next = panels[index + 1]
        const progress =
          next && !focused
            ? Math.max(
                0,
                Math.min(
                  1,
                  (innerHeight - next.getBoundingClientRect().top) /
                    (innerHeight - header),
                ),
              )
            : 0
        // Only the preceding section recedes; the incoming section keeps its natural size.
        surface.style.transform = progress
          ? `scale(${1 - progress * 0.02})`
          : ''
      })
    }
    const schedule = () => {
      if (!frame && !disposed) frame = requestAnimationFrame(update)
    }
    const change = () => {
      if (!media.matches) {
        delete element.dataset.stacking
        clear()
      }
      schedule()
    }
    const resize = new ResizeObserver(schedule)
    panels.forEach((panel) => resize.observe(panel))
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    // Release decorative stacking before the browser scrolls a focused item into view.
    const focus = () => {
      if (media.matches) {
        element.dataset.stacking = 'focus'
        clear()
        schedule()
      }
    }
    element.addEventListener('focusin', focus)
    element.addEventListener('focusout', schedule)
    media.addEventListener('change', change)
    document.fonts.ready.then(() => {
      if (!disposed) schedule()
    })
    update()
    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      resize.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      element.removeEventListener('focusin', focus)
      element.removeEventListener('focusout', schedule)
      media.removeEventListener('change', change)
    }
  }, [])
  return (
    <div className="home-sections" ref={root}>
      {Children.toArray(children).map((child, index) => (
        <div
          className="stack-section"
          key={index}
          style={{ '--stack-order': index + 1 } as CSSProperties}
        >
          <div className="stack-surface">{child}</div>
        </div>
      ))}
    </div>
  )
}
