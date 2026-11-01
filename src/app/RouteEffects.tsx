import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router'
import { pageMetadata } from './metadata'
import { readProjectPosition } from './project-return'

export function RouteEffects() {
  const { pathname, hash, key, state } = useLocation()
  const navigationType = useNavigationType()
  const previous = useRef(pathname)
  useEffect(() => {
    const original = history.scrollRestoration
    history.scrollRestoration = 'manual'
    return () => {
      history.scrollRestoration = original
    }
  }, [])
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
    const imageTags: [string, string, string | undefined][] = [
      ['property', 'og:type', metadata.type],
      [
        'name',
        'twitter:card',
        metadata.image ? 'summary_large_image' : 'summary',
      ],
      ['property', 'og:image', metadata.image?.url],
      ['property', 'og:image:alt', metadata.image?.alt],
      [
        'property',
        'og:image:width',
        metadata.image ? String(metadata.image.width) : undefined,
      ],
      [
        'property',
        'og:image:height',
        metadata.image ? String(metadata.image.height) : undefined,
      ],
      ['name', 'twitter:image', metadata.image?.url],
      ['name', 'twitter:image:alt', metadata.image?.alt],
    ]
    for (const [attribute, name, content] of imageTags) {
      let element = document.querySelector<HTMLMetaElement>(
        `meta[${attribute}="${name}"]`,
      )
      if (!content) {
        element?.remove()
        continue
      }
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, name)
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
    const restorationKey =
      typeof state?.restorePortfolio === 'string' ? state.restorePortfolio : key
    const saved =
      pathname === '/' && (navigationType === 'POP' || state?.restorePortfolio)
        ? readProjectPosition(restorationKey)
        : undefined
    let cancelled = false
    let frame = 0
    if (saved) {
      const anchor = document.querySelector<HTMLElement>(
        `[data-project-return="${CSS.escape(saved.focusKey)}"]`,
      )
      anchor?.focus({ preventScroll: true })
      const restore = () => {
        if (cancelled) return
        frame = requestAnimationFrame(() => {
          if (cancelled) return
          if (Math.abs(innerWidth - saved.width) > 1 && anchor)
            anchor.scrollIntoView({ block: 'center', behavior: 'instant' })
          else window.scrollTo({ top: saved.y, behavior: 'instant' })
        })
      }
      restore()
      document.fonts.ready.then(restore)
    } else if (target) {
      // Focus first releases decorative homepage stacking before positioning the target.
      target.focus({ preventScroll: true })
      target.scrollIntoView({ block: 'start', behavior: 'instant' })
    } else if (changed) window.scrollTo(0, 0)
    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
    }
  }, [pathname, hash, key, state, navigationType])
  return null
}
