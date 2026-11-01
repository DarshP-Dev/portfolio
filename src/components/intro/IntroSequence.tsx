import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import namePath from './name-path.json'
import { createStringWinding } from './string-winding'

// A connected, hand-drawn cursive monogram; a centreline rather than outlined sans-serif letters.
const signature =
  'M348 190 C372 155 390 94 400 56 C412 23 440 28 456 60 C483 114 454 179 408 187 C371 195 366 160 392 153 C420 144 435 184 460 183 C485 181 487 134 499 83 C508 43 530 27 552 43 C580 64 558 116 524 116 C503 116 511 94 528 99 C549 107 557 136 584 143'
const centerX = namePath.width / 2
const centerY = namePath.height / 2

function circlePath(radius: number) {
  return `M${centerX + radius} ${centerY} a${radius} ${radius} 0 1 1 ${-2 * radius} 0 a${radius} ${radius} 0 1 1 ${2 * radius} 0 Z`
}

const smallBall = circlePath(18.2)
const tinyPoint = circlePath(2)
const coilScale = 2 / 56

export function IntroSequence({ onFinish }: { onFinish: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  const ink = useRef<SVGPathElement>(null)
  const finishCallback = useRef(onFinish)
  useEffect(() => {
    finishCallback.current = onFinish
  }, [onFinish])

  useEffect(() => {
    const element = dialog.current!
    const canvas = svg.current!
    const path = ink.current!
    let disposed = false
    let finished = false
    let context: ReturnType<typeof gsap.context> | undefined
    let timeline: ReturnType<typeof gsap.timeline> | undefined
    const originalStyles = new Map<
      HTMLElement,
      { opacity: string; filter: string }
    >()
    const restoreContent = () => {
      originalStyles.forEach((style, node) => {
        node.style.opacity = style.opacity
        node.style.filter = style.filter
      })
    }
    const finish = () => {
      if (!finished && !disposed) {
        finished = true
        element.style.visibility = 'hidden'
        element.close()
        context?.revert()
        restoreContent()
        finishCallback.current()
      }
    }
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    if (motion.matches) {
      const frame = requestAnimationFrame(finish)
      return () => cancelAnimationFrame(frame)
    }
    try {
      element.showModal()
    } catch {
      const frame = requestAnimationFrame(finish)
      return () => cancelAnimationFrame(frame)
    }
    const deadline = window.setTimeout(finish, 11000)
    const interrupt = () => finish()
    const onVisibility = () => {
      if (document.hidden) finish()
    }
    motion.addEventListener('change', interrupt)
    window.addEventListener('resize', interrupt)
    document.addEventListener('visibilitychange', onVisibility)

    async function animate() {
      try {
        const [{ MorphSVGPlugin }] = await Promise.all([
          import('gsap/MorphSVGPlugin'),
          document.fonts.load('500 100px "Geist Variable"'),
        ])
        if (disposed || finished) return
        gsap.registerPlugin(MorphSVGPlugin)
        const target = document.querySelector<HTMLElement>('.hero-wordmark')
        if (!target) {
          finish()
          return
        }
        const reveal = document.querySelectorAll<HTMLElement>(
          '.hero-copy > :not(h1), .hero-bottom, .hero-work',
        )
        for (const node of [target, ...Array.from(reveal)])
          originalStyles.set(node, {
            opacity: node.style.opacity,
            filter: node.style.filter,
          })
        const length = path.getTotalLength()
        const thread = createStringWinding(
          Array.from({ length: 161 }, (_, index) => {
            const point = path.getPointAtLength((length * index) / 160)
            return { x: point.x, y: point.y }
          }),
          { x: centerX, y: centerY },
        )
        const winding = { phase: 0 }
        const nameWidth = Math.min(window.innerWidth - 44, 1000)
        const startWidth = Math.max(700, nameWidth)
        const startHeight = (startWidth * namePath.height) / namePath.width
        context = gsap.context(() => {
          gsap.set(canvas, {
            width: startWidth,
            height: startHeight,
            left: (window.innerWidth - startWidth) / 2,
            top: (window.innerHeight - startHeight) / 2,
          })
          gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
          gsap.set(target, { opacity: 0 })
          gsap.set(reveal, { opacity: 0, filter: 'blur(3px)' })
          const stage = (value: string) => {
            element.dataset.stage = value
          }
          timeline = gsap.timeline({ onComplete: finish })
          timeline
            .call(stage, ['trace'])
            .to(path, {
              strokeDashoffset: 0,
              duration: 1.15,
              ease: 'power1.inOut',
            })
            .set(path, { strokeDasharray: 'none', strokeDashoffset: 0 })
            .to({}, { duration: 0.12 })
            .call(stage, ['spiral'])
            .set(path, { attr: { d: thread.pathAt(0) } })
            .addLabel('unravel')
            .to(winding, {
              phase: 1,
              duration: 2.4,
              ease: 'sine.inOut',
              onUpdate: () => {
                const phase = winding.phase
                const feed = Math.min(1, phase / 0.84)
                const tightening = Math.max(0, Math.min(1, (phase - 0.7) / 0.3))
                const scale =
                  1 -
                  tightening *
                    tightening *
                    (3 - 2 * tightening) *
                    (1 - coilScale)
                // The reel turns from the first pickup onward. Only ink already
                // collected into the reel rotates; the uncollected tail stays put.
                path.setAttribute(
                  'd',
                  thread.pathAt(feed, phase * Math.PI * 5.5, scale),
                )
                if (phase >= 0.7 && element.dataset.stage === 'spiral')
                  stage('condense')
              },
            })
            .to(
              path,
              {
                stroke: '#18181b',
                strokeWidth: 3.2,
                duration: 1.75,
                ease: 'sine.inOut',
              },
              'unravel',
            )
            .to(
              path,
              { strokeWidth: 1, duration: 0.65, ease: 'sine.inOut' },
              'unravel+=1.75',
            )
            .to(path, {
              morphSVG: { shape: tinyPoint, shapeIndex: 0 },
              fillOpacity: 1,
              strokeWidth: 0,
              duration: 0.1,
              ease: 'sine.inOut',
            })
            .call(stage, ['point'])
            .to({}, { duration: 0.12 })
            .call(stage, ['pop'])
            .to(path, {
              morphSVG: { shape: smallBall, shapeIndex: 0 },
              duration: 0.36,
              ease: 'back.out(1.6)',
            })
            .call(stage, ['ball'])
            .to({}, { duration: 0.12 })
            .call(stage, ['name'])
            .to(path, {
              morphSVG: { shape: namePath.name, shapeIndex: 'auto' },
              strokeWidth: 0,
              duration: 1.55,
              ease: 'power2.inOut',
            })
            .to(
              canvas,
              {
                width: nameWidth,
                height: (nameWidth * namePath.height) / namePath.width,
                left: (window.innerWidth - nameWidth) / 2,
                top:
                  (window.innerHeight -
                    (nameWidth * namePath.height) / namePath.width) /
                  2,
                duration: 0.9,
                ease: 'power2.inOut',
              },
              '<',
            )
            .call(stage, ['handoff'])
            .to(canvas, {
              left: () => target.getBoundingClientRect().left,
              top: () => target.getBoundingClientRect().top,
              width: () => target.getBoundingClientRect().width,
              height: () => target.getBoundingClientRect().height,
              duration: 0.85,
              ease: 'power2.inOut',
            })
            // Let the name settle for half a second before the slower page reveal.
            .call(stage, ['landed'])
            .to({}, { duration: 0.5 })
            .call(stage, ['reveal'])
            .addLabel('page-reveal')
            .to(
              element,
              { backgroundColor: 'rgba(250,250,248,0)', duration: 0.9 },
              'page-reveal',
            )
            .to(
              reveal,
              {
                opacity: 1,
                filter: 'blur(0px)',
                duration: 0.9,
                stagger: 0.035,
                ease: 'power2.out',
              },
              'page-reveal',
            )
            .to(target, { opacity: 1, duration: 0.12 }, '-=.1')
            .to(canvas, { opacity: 0, duration: 0.12 }, '<')
            .call(stage, ['settled'])
        })
      } catch {
        finish()
      }
    }
    void animate()
    return () => {
      disposed = true
      window.clearTimeout(deadline)
      timeline?.kill()
      context?.revert()
      restoreContent()
      motion.removeEventListener('change', interrupt)
      window.removeEventListener('resize', interrupt)
      document.removeEventListener('visibilitychange', onVisibility)
      element.close()
    }
  }, [])

  return (
    <dialog
      ref={dialog}
      className="signature-intro"
      aria-label="Signature introduction"
      data-stage="preparing"
      onCancel={(event) => {
        event.preventDefault()
        onFinish()
      }}
    >
      <button
        type="button"
        className="intro-skip bubble-control"
        autoFocus
        onClick={onFinish}
      >
        Skip Intro <span aria-hidden="true">↗</span>
      </button>
      <svg
        ref={svg}
        className="intro-canvas"
        viewBox={`0 0 ${namePath.width} ${namePath.height}`}
        aria-hidden="true"
        focusable="false"
        overflow="visible"
      >
        <path
          ref={ink}
          d={signature}
          fill="#18181b"
          fillOpacity="0"
          stroke="#8b8b84"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="intro-caption" aria-hidden="true">
        A signature, taking shape.
      </span>
    </dialog>
  )
}
