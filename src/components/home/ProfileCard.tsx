// Light, reduced-motion adaptation of the supplied React Bits ProfileCard.
// Copyright David Haz; public/third-party/react-bits-license.txt.
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { gsap } from 'gsap'

export function ProfileCard({
  avatarUrl,
  placeholder = false,
}: {
  avatarUrl?: string
  placeholder?: boolean
}) {
  const [imageFailed, setImageFailed] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = root.current!
    const media = gsap.matchMedia()
    media.add(
      '(min-width: 1100px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
      () => {
        let sweep: gsap.core.Timeline | undefined
        const reset = () =>
          gsap.to(element, {
            '--pc-rotate-x': '0deg',
            '--pc-rotate-y': '0deg',
            '--pc-shift-x': '0px',
            '--pc-shift-y': '0px',
            '--pc-active': 0,
            duration: 0.6,
            overwrite: true,
          })
        const aim = (event: PointerEvent) => {
          if (event.pointerType !== 'mouse') return
          sweep?.kill()
          const rect = element.getBoundingClientRect()
          const x = Math.max(
            -1,
            Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1),
          )
          const y = Math.max(
            -1,
            Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1),
          )
          gsap.to(element, {
            '--pc-rotate-x': `${-y * 6}deg`,
            '--pc-rotate-y': `${x * 6}deg`,
            '--pc-shift-x': `${x * 4}px`,
            '--pc-shift-y': `${y * 4}px`,
            '--pc-pointer-x': `${(x + 1) * 50}%`,
            '--pc-pointer-y': `${(y + 1) * 50}%`,
            '--pc-active': 1,
            duration: 0.45,
            ease: 'power3.out',
            overwrite: true,
          })
        }
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (!entry.isIntersecting) return
            sweep = gsap
              .timeline()
              .fromTo(
                element,
                { '--pc-pointer-x': '10%', '--pc-active': 0 },
                {
                  '--pc-pointer-x': '85%',
                  '--pc-active': 0.65,
                  duration: 0.9,
                  ease: 'sine.inOut',
                },
              )
              .to(element, { '--pc-active': 0, duration: 0.7 })
            observer.disconnect()
          },
          { threshold: 0.35 },
        )
        observer.observe(element)
        element.addEventListener('pointermove', aim)
        element.addEventListener('pointerleave', reset)
        return () => {
          observer.disconnect()
          sweep?.kill()
          gsap.killTweensOf(element)
          element.removeEventListener('pointermove', aim)
          element.removeEventListener('pointerleave', reset)
          element.removeAttribute('style')
        }
      },
    )
    return () => media.revert()
  }, [])
  return (
    <div className="profile-card" ref={root}>
      <div className="profile-card-body">
        <div className="profile-card-tile">
          {avatarUrl && !imageFailed ? (
            <img
              ref={(image) => {
                if (image?.complete && !image.naturalWidth) setImageFailed(true)
              }}
              className="profile-card-photo"
              src={avatarUrl}
              alt={
                placeholder
                  ? 'Darsh Patel — temporary DP portrait placeholder'
                  : 'Darsh Patel'
              }
              onError={() => setImageFailed(true)}
              width="680"
              height="850"
              loading="lazy"
            />
          ) : (
            <div className="profile-card-placeholder">
              <span className="mono">Portrait / 01</span>
              <span className="profile-monogram" aria-hidden="true">
                DP<span>.</span>
              </span>
              <span className="eyebrow">Owner portrait pending</span>
            </div>
          )}
          <span className="profile-card-holo" aria-hidden="true" />
          <span className="profile-card-glare" aria-hidden="true" />
          <div className="profile-card-info">
            <h3>Darsh Patel</h3>
            <p>Software Engineering Student</p>
          </div>
        </div>
        <div className="profile-card-footer">
          <span className="mono">@DarshP-Dev</span>
          <Link to="/#contact" className="profile-contact">
            Contact Me{' '}
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 6 9 7 9-7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
