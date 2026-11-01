import type { ReactNode } from 'react'
import { useLocation } from 'react-router'
import { site } from '../content/site'
import { SiteNavigation } from '../components/navigation/SiteNavigation'
import { SignatureIntro } from '../components/intro/SignatureIntro'
import { pageMetadata } from './metadata'
import { RouteEffects } from './RouteEffects'
import { SiteFooter } from '../components/layout/SiteFooter'

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
      <SiteFooter />
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
