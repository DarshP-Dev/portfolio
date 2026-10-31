import { describe, it, expect } from 'vitest'
import {
  projects,
  findProject,
  visibleProjects,
  validateProjects,
} from '../src/content/projects'
import { render, prerenderPaths } from '../src/entry-server'
import { pageMetadata } from '../src/app/metadata'

describe('project publication boundaries', () => {
  it('tracks seven drafts, five featured and two supporting projects', () => {
    expect(projects).toHaveLength(7)
    expect(projects.filter((project) => project.featured)).toHaveLength(5)
    expect(projects.filter((project) => !project.featured)).toHaveLength(2)
    expect(validateProjects(projects)).toEqual([])
    expect(visibleProjects(projects, false)).toEqual([])
    expect(findProject('argus', false)).toBeUndefined()
    expect(findProject('argus', true)?.title).toBe('Argus')
  })
  it('rejects duplicate routes, unsafe URLs, and incomplete published records', () => {
    expect(validateProjects([projects[0], projects[0]])).toContain(
      'Duplicate slug: personal-finance-tracker',
    )
    expect(
      validateProjects([
        {
          ...projects[0],
          links: [
            { kind: 'live', label: 'Unsafe', url: 'javascript:alert(1)' },
          ],
        },
      ]),
    ).toContain('Unsafe link: personal-finance-tracker')
    expect(
      validateProjects([{ ...projects[0], status: 'published' }]),
    ).toContain('Published project is incomplete: personal-finance-tracker')
  })
})

describe('server-rendered foundation', () => {
  it('renders all homepage sections in their prescribed order with one h1', () => {
    const { html } = render('/')
    const ids = ['home', 'projects', 'about', 'skills', 'experience', 'contact']
    expect(ids.map((id) => html.indexOf(`id="${id}"`))).toEqual(
      ids.map((id) => html.indexOf(`id="${id}"`)).toSorted((a, b) => a - b),
    )
    for (const id of ids) expect(html).toContain(`id="${id}"`)
    expect(html.match(/<h1\b/g)).toHaveLength(1)
    expect(html).toContain(
      'Building thoughtful software, from idea to implementation.',
    )
    expect(html).not.toContain('Get started')
    expect(html).not.toContain('href="#"')
  })
  it.each(projects)(
    'renders $title directly with honest draft content and distinct metadata',
    (project) => {
      const path = `/projects/${project.slug}`
      const { html, metadata } = render(path)
      expect(html).toContain(project.title)
      expect(html).toContain('development draft')
      expect(html.match(/<h1\b/g)).toHaveLength(1)
      expect(metadata.title).toBe(`${project.title} — Darsh Patel`)
      expect(metadata.robots).toBe('noindex, nofollow')
      expect(prerenderPaths()).toContain(path)
    },
  )
  it('handles unknown and malformed project routes as not found', () => {
    for (const path of [
      '/missing',
      '/projects/missing',
      '/projects/argus/extra',
    ]) {
      expect(render(path).html).toContain('A little off course.')
      expect(pageMetadata(path).found).toBe(false)
    }
  })
})
