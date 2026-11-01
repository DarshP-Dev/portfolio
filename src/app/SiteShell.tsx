import { useEffect, useRef, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { site } from '../content/site'
import { SiteNavigation } from '../components/navigation/SiteNavigation'
import { SignatureIntro } from '../components/intro/SignatureIntro'
import { pageMetadata } from './metadata'

function RouteEffects() {
  const { pathname, hash } = useLocation()
  const previous = useRef(pathname)
  useEffect(() => {
    const metadata = pageMetadata(pathname)
    document.title = metadata.title
    for (const [attribute, key, content] of [
      ['name', 'description', metadata.description],
      ['name', 'robots', metadata.robots],
      ['property', 'og:title', metadata.title],
      ['property', 'og:description', metadata.description],
      ['name', 'twitter:title', metadata.title],
      ['name', 'twitter:description', metadata.description],
    ]) {
      let element = document.querySelector<HTMLMetaElement>(
        `meta[${attribute}="${key}"]`,
      )
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, key)
        document.head.append(element)
      }
      element.content = content
    }
    for (const selector of [
      'link[rel="canonical"]',
      'meta[property="og:url"]',
    ]) {
      let element = document.querySelector(selector)
      if (metadata.canonical) {
        if (!element) {
          element = document.createElement(
            selector.startsWith('link') ? 'link' : 'meta',
          )
          element.setAttribute(
            selector.startsWith('link') ? 'rel' : 'property',
            selector.startsWith('link') ? 'canonical' : 'og:url',
          )
          document.head.append(element)
        }
        element.setAttribute(
          selector.startsWith('link') ? 'href' : 'content',
          metadata.canonical,
        )
      } else element?.remove()
    }
    const changed = previous.current !== pathname
    previous.current = pathname
    const target = hash
      ? document.getElementById(hash.slice(1))
      : changed
        ? document.querySelector<HTMLElement>('main h1')
        : null
    if (target) {
      target.scrollIntoView({ block: 'start', behavior: 'instant' })
      target.focus({ preventScroll: true })
    } else if (changed) window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

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
