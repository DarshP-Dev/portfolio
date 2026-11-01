import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { readIntroSeen, markIntroSeen, shouldPlayIntro } from './session'
import { IntroSequence } from './IntroSequence'
import { useHydrated } from '../../hooks/useHydrated'
import './intro.css'

export function SignatureIntro({
  enabled,
  preview,
}: {
  enabled: boolean
  preview: boolean
}) {
  const ready = useHydrated()
  const location = useLocation()
  const initial = useRef({ pathname: location.pathname, hash: location.hash })
  const [playing, setPlaying] = useState(false)
  const [run, setRun] = useState(0)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const dismissForHistory = () => setPlaying(false)
    window.addEventListener('popstate', dismissForHistory)
    return () => window.removeEventListener('popstate', dismissForHistory)
  }, [])

  useEffect(() => {
    if (!enabled) return
    const frame = requestAnimationFrame(() => {
      let seen: boolean
      try {
        seen = readIntroSeen(sessionStorage)
      } catch {
        seen = readIntroSeen()
      }
      if (
        !shouldPlayIntro({
          ...initial.current,
          seen,
          reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
          scrollY: window.scrollY,
          modalOpen: Boolean(document.querySelector('dialog[open]')),
        })
      )
        return
      try {
        markIntroSeen(sessionStorage)
      } catch {
        markIntroSeen()
      }
      setPlaying(true)
    })
    return () => cancelAnimationFrame(frame)
  }, [enabled])

  function finish() {
    setPlaying(false)
    requestAnimationFrame(() =>
      document.getElementById('hero-name')?.focus({ preventScroll: true }),
    )
  }

  return (
    <>
      {preview && ready && location.pathname === '/' && (
        <aside
          className="intro-review"
          aria-label="Signature intro preview controls"
        >
          <div>
            <strong>Signature intro / motion review</strong>
            <p>
              The homepage intro remains off until this prototype is approved.
            </p>
          </div>
          <button
            type="button"
            className="bubble-control"
            onClick={() => {
              if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
                setNotice(
                  'Reduced motion is enabled. The decorative intro is bypassed.',
                )
                return
              }
              window.scrollTo(0, 0)
              setNotice('')
              setRun((value) => value + 1)
              setPlaying(true)
            }}
          >
            Replay intro <span aria-hidden="true">↻</span>
          </button>
          <span role="status" className="intro-review-notice">
            {notice}
          </span>
        </aside>
      )}
      {playing && location.pathname === '/' && (
        <IntroSequence key={run} onFinish={finish} />
      )}
    </>
  )
}
