import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { site } from '../../content/site'
import { useHydrated } from '../../hooks/useHydrated'

export function SiteFooter() {
  const hydrated = useHydrated()
  const [copy, setCopy] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(site.email)
      setCopy('Copied')
    } catch {
      setCopy('Copy unavailable. Use the email link or select the address.')
    }
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopy(''), 4000)
  }
  return (
    <footer className="site-footer page-width">
      <Link
        to="/#home"
        className="brand"
        aria-label="DP. — Darsh Patel, back to top"
      >
        DP<span>.</span>
      </Link>
      <p>
        © {new Date().getFullYear()} {site.name}
      </p>
      <nav className="footer-links" aria-label="Social and resume links">
        <a href={site.github} target="_blank" rel="noopener noreferrer">
          GitHub <span className="sr-only">(opens in a new tab)</span>
        </a>
        <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
          LinkedIn <span className="sr-only">(opens in a new tab)</span>
        </a>
        <span className="footer-email">
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <button
            type="button"
            className="copy-email"
            aria-label="Copy email address"
            disabled={!hydrated}
            onClick={copyEmail}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <rect x="8" y="8" width="12" height="12" rx="2" />
              <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
            </svg>
          </button>
        </span>
        {site.resume ? (
          <a href={site.resume} download>
            Resume <span aria-hidden="true">↓</span>
          </a>
        ) : (
          <span className="footer-pending">Resume pending</span>
        )}
      </nav>
      <span className="footer-copy-status" role="status" aria-live="polite">
        {copy}
      </span>
    </footer>
  )
}
