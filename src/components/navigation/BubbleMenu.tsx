// Adapted from the supplied React Bits BubbleMenu: neutral pills and staggered scale/label reveal.
// Copyright (c) 2026 David Haz. See public/third-party/react-bits-license.txt.
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link, useLocation } from 'react-router'
import { gsap } from 'gsap'
import { navigation } from '../../content/site'

export function BubbleMenu({ beforeOpen }: { beforeOpen: () => void }) {
  const root = useRef<HTMLDetailsElement>(null)
  const panel = useRef<HTMLElement>(null)
  const summary = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(false)
  const location = useLocation()

  function close(restoreFocus = false) {
    if (root.current) root.current.open = false
    setOpen(false)
    if (restoreFocus) summary.current?.focus()
  }

  useEffect(() => {
    if (!open || !panel.current) return
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const pills = panel.current!.querySelectorAll('.pill-link')
      gsap.from(pills, {
        scale: 0.88,
        opacity: 0,
        duration: 0.35,
        stagger: 0.045,
        ease: 'back.out(1.2)',
      })
      gsap.from(panel.current!.querySelectorAll('.pill-label'), {
        y: 9,
        opacity: 0,
        duration: 0.3,
        stagger: 0.045,
        ease: 'power2.out',
      })
    })
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close(true)
      }
    }
    const onPointer = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !root.current?.contains(event.target) &&
        !summary.current?.contains(event.target)
      )
        close()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      media.revert()
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  return (
    <details
      className="bubble-menu"
      ref={root}
      onToggle={(event) => {
        const next = event.currentTarget.open
        if (next) beforeOpen()
        setOpen(next)
      }}
      onBlur={(event) => {
        if (
          event.relatedTarget instanceof Node &&
          !event.currentTarget.contains(event.relatedTarget)
        )
          close()
      }}
    >
      <summary
        ref={summary}
        className="bubble-control menu-toggle"
        aria-label={open ? 'Menu — close navigation' : 'Menu — open navigation'}
        aria-controls="bubble-navigation"
      >
        <span>Menu</span>
        <span className="menu-icon" aria-hidden="true">
          <i />
          <i />
        </span>
      </summary>
      <button
        className="menu-scrim"
        type="button"
        tabIndex={-1}
        aria-label="Close navigation backdrop"
        onClick={() => close(true)}
      />
      <nav
        id="bubble-navigation"
        ref={panel}
        className="bubble-panel"
        aria-label="Main navigation"
      >
        <div className="menu-caption">
          <span className="eyebrow">Find your way</span>
          <span className="mono quiet">01—06</span>
        </div>
        <ul className="pill-list">
          {navigation.map(({ id, label }, index) => (
            <li key={id}>
              <Link
                className="pill-link"
                to={`/#${id}`}
                style={
                  {
                    '--pill-rotation': `${[-2, 1.5, -1, 1.5, -1.5, 2][index]}deg`,
                  } as CSSProperties
                }
                onClick={() => {
                  close()
                  if (location.pathname === '/' && location.hash === `#${id}`)
                    queueMicrotask(() => {
                      const target = document.getElementById(id)
                      target?.scrollIntoView()
                      target?.focus({ preventScroll: true })
                    })
                }}
              >
                <span className="mono pill-number" aria-hidden="true">
                  0{index + 1}
                </span>
                <span className="pill-label">{label}</span>
                <span className="pill-arrow" aria-hidden="true">
                  ↗
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="menu-hint">
          A few things I’m building, learning, and exploring.
        </p>
      </nav>
    </details>
  )
}
