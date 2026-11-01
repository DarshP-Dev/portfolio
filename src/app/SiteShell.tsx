import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { site } from '../content/site'
import { SiteNavigation } from '../components/navigation/SiteNavigation'
import { SignatureIntro } from '../components/intro/SignatureIntro'
import { pageMetadata } from './metadata'
import { RouteEffects } from './RouteEffects'

export function SiteShell({ children }: { children: ReactNode }) {
  const { pathname, search } = useLocation()
  const introPreview =
    site.includeDrafts && new URLSearchParams(search).get('intro') === 'preview'
  return (
    <>
      <RouteEffects />
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <SignatureIntro
        enabled={site.signatureIntroEnabled || introPreview}
        preview={introPreview}
      />
      <SiteNavigation />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <footer className="site-footer page-width">
        <Link
          to="/#home"
          className="brand"
          aria-label="Darsh Patel — back to top"
        >
          DP<span>.</span>
        </Link>
        <p>
          © {new Date().getFullYear()} {site.name}
        </p>
        <p className="footer-note">
          Social links & resume pending verification.
        </p>
      </footer>
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {pathname === '/'
          ? 'Darsh Patel portfolio'
          : pageMetadata(pathname).title}
      </div>
    </>
  )
}
