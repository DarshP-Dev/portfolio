import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useHydrated } from '../../hooks/useHydrated'
import { BubbleMenu } from './BubbleMenu'
import { CommandPalette } from './CommandPalette'
import { isEditable } from './commands'
import './navigation.css'

export function SiteNavigation() {
  const [commandOpen, setCommandOpen] = useState(false)
  const header = useRef<HTMLElement>(null)
  const ready = useHydrated()
  useEffect(() => {
    const element = header.current!
    const measure = () =>
      document.documentElement.style.setProperty(
        '--navigation-offset',
        `${Math.ceil(element.getBoundingClientRect().height) + 24}px`,
      )
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    measure()
    return () => {
      observer.disconnect()
      document.documentElement.style.removeProperty('--navigation-offset')
    }
  }, [])
  function openSearch() {
    const details = header.current?.querySelector('details')
    if (details) details.open = false
    setCommandOpen(true)
  }
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.repeat ||
        !(event.ctrlKey || event.metaKey) ||
        event.altKey ||
        event.shiftKey ||
        event.key.toLowerCase() !== 'k' ||
        isEditable(event.target) ||
        document.querySelector('dialog[open], [aria-modal="true"]')
      )
        return
      event.preventDefault()
      const details = header.current?.querySelector('details')
      if (details) details.open = false
      setCommandOpen(true)
    }
    window.addEventListener('keydown', onKey)
    const dismissForHistory = () => {
      const details = header.current?.querySelector('details')
      if (details) details.open = false
      setCommandOpen(false)
    }
    window.addEventListener('popstate', dismissForHistory)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('popstate', dismissForHistory)
    }
  }, [])
  return (
    <>
      <header className="site-header navigation-header page-width" ref={header}>
        <Link
          to="/#home"
          className="brand brand-bubble"
          aria-label="Darsh Patel — home"
        >
          DP<span>.</span>
        </Link>
        <div className="header-actions">
          <button
            className="bubble-control search-trigger"
            type="button"
            onClick={openSearch}
            disabled={!ready}
            aria-haspopup="dialog"
          >
            <span aria-hidden="true">⌕</span>
            <span>Search</span>
            <kbd aria-hidden="true">⌘ / Ctrl K</kbd>
          </button>
          <BubbleMenu beforeOpen={() => setCommandOpen(false)} />
        </div>
      </header>
      {commandOpen && <CommandPalette onClose={() => setCommandOpen(false)} />}
    </>
  )
}
