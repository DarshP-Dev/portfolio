// Adapted from the supplied React Bits AccordionGallery (David Haz).
// License: public/third-party/react-bits-license.txt. Native links always navigate.
import { useEffect, useRef } from 'react'
import { ProjectLink } from '../projects/ProjectLinks'
import { gsap } from 'gsap'
import type { Project } from '../../content/projects'
import { ProjectPreview } from './ProjectPreview'

export function AccordionGallery({ projects }: { projects: Project[] }) {
  const root = useRef<HTMLUListElement>(null)
  useEffect(() => {
    const list = root.current!
    const panels = Array.from(list.children) as HTMLElement[]
    if (panels.length < 2) return
    const media = gsap.matchMedia()
    media.add(
      '(min-width: 1100px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
      () => {
        const expand = (active: number, animate = true) => {
          const grow = (0.52 * (panels.length - 1)) / (1 - 0.52)
          panels.forEach((panel, index) => {
            panel.dataset.active = String(index === active)
            gsap.to(panel, {
              flexGrow: index === active ? grow : 1,
              duration: animate ? 0.55 : 0,
              ease: 'power3.out',
              overwrite: true,
            })
          })
        }
        const listeners = panels.map((panel, index) => {
          const enter = () => {
            // A pointer must not collapse a panel currently holding keyboard focus.
            const focused = panels.findIndex((item) =>
              item.contains(document.activeElement),
            )
            expand(focused >= 0 ? focused : index)
          }
          panel.addEventListener('pointerenter', enter)
          panel.addEventListener('focusin', enter)
          return () => {
            panel.removeEventListener('pointerenter', enter)
            panel.removeEventListener('focusin', enter)
          }
        })
        expand(Math.floor(panels.length / 2), false)
        return () => {
          listeners.forEach((remove) => remove())
          gsap.killTweensOf(panels)
          panels.forEach((panel) => {
            panel.style.removeProperty('flex-grow')
            delete panel.dataset.active
          })
        }
      },
    )
    return () => media.revert()
  }, [projects])
  return (
    <ul className="featured-gallery" ref={root} aria-label="Featured projects">
      {projects.map((project) => (
        <li key={project.id}>
          <ProjectLink
            project={project}
            source="gallery"
            className="gallery-link"
          >
            <div className="gallery-media">
              <ProjectPreview project={project} />
            </div>
            <div className="gallery-caption">
              <span className="mono quiet">
                {String(project.order).padStart(2, '0')}{' '}
                <span aria-hidden="true">/</span>{' '}
                {project.status === 'draft' ? 'Draft' : 'Project'}
              </span>
              <h3>{project.title}</h3>
              <p>
                {project.technologies.length
                  ? project.technologies.join(' · ')
                  : 'Case study in preparation'}
              </p>
              <span className="gallery-arrow" aria-hidden="true">
                ↗
              </span>
            </div>
          </ProjectLink>
        </li>
      ))}
    </ul>
  )
}
