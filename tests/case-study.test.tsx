import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import {
  projects,
  validateProjects,
  type Project,
} from '../src/content/projects'
import { CaseStudy } from '../src/components/projects/CaseStudy'
import { MediaGallery } from '../src/components/projects/MediaGallery'
import { projectShareImage } from '../src/app/metadata'
import {
  projectReturn,
  readProjectPosition,
  rememberProjectPosition,
} from '../src/app/project-return'

afterEach(() => vi.unstubAllGlobals())

describe('case-study content and publication', () => {
  it.each(projects)(
    'renders the shared section order and true source links for $title',
    (project) => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <CaseStudy
            project={project}
            next={projects[project.order % projects.length]}
          />
        </MemoryRouter>,
      )
      const ids = [
        'snapshot',
        'challenge',
        'solution',
        'architecture',
        'engineering',
        'results',
      ].map((id) => html.indexOf(`id="${project.slug}-${id}"`))
      expect(ids.every((position) => position >= 0)).toBe(true)
      expect(ids).toEqual(ids.toSorted((a, b) => a - b))
      expect(html.match(/<h1\b/g)).toHaveLength(1)
      expect(html).toContain('development draft')
      expect(html).not.toContain('href="#"')
      expect(html).not.toContain('case-study-fixture')
      for (const link of project.links)
        expect(html).toContain(`href="${link.url}"`)
    },
  )
  it('keeps personal responsibility distinct from team-built capabilities and excludes Interval', () => {
    const argus = projects.find((project) => project.id === 'argus')!
    const deen = projects.find((project) => project.id === 'deenstudio')!
    expect(argus.contribution?.credits).toContain('Munadir')
    expect(argus.role).toBe('Web/frontend collaborator')
    expect(argus.links.find((link) => link.kind === 'demo')?.label).toContain(
      'replay',
    )
    expect(deen.contribution?.credits).toContain('substantial amount')
    expect(
      deen.engineeringChallenges?.find((item) =>
        item.title.includes('export-format'),
      )?.result,
    ).toContain('MP4 is not claimed')
    expect(projects.map((project) => project.id)).not.toContain('interval')
    expect(
      projects
        .find((project) => project.id === 'bluffhouse')!
        .links.some((link) => link.kind === 'live'),
    ).toBe(false)
  })
  it('rejects unsafe, uncaptioned or malformed media and out-of-range feature references', () => {
    const base = projects[0]
    for (const media of [
      {
        type: 'image' as const,
        src: 'https://unverified.example/image.png',
        width: 0,
        height: 10,
        altOrCaption: '',
      },
      {
        type: 'image' as const,
        src: '/images/../private.png',
        width: 10,
        height: 10,
        altOrCaption: 'Test',
      },
      {
        type: 'video' as const,
        src: '/media/test.webm',
        width: 10,
        height: 10,
        altOrCaption: 'Test',
        hasAudio: true,
        poster: '/images/test.png',
      },
    ])
      expect(validateProjects([{ ...base, media: [media] }])).toContain(
        `Invalid media: ${base.slug}`,
      )
    expect(
      validateProjects([
        {
          ...base,
          features: [{ title: 'Test', body: 'Test', mediaIndex: 20 }],
        },
      ]),
    ).toContain(`Invalid feature media: ${base.slug}`)
    expect(validateProjects(projects)).toEqual([])
    expect(validateProjects([{ ...base, status: 'published' }])).toContain(
      `Published project is incomplete: ${base.slug}`,
    )
  })
  it('keeps SSR media usable with original-file links and native controlled video', () => {
    const rpg = projects.find((project) => project.id === 'pokemon-style-rpg')!
    const html = renderToStaticMarkup(
      <MediaGallery title={rpg.title} media={rpg.media} />,
    )
    expect(html).toContain('More project media')
    expect(html).toContain(
      'href="/images/projects/pokemon-style-rpg/starter.png"',
    )
    const video = renderToStaticMarkup(
      <MediaGallery
        title="Test"
        media={[
          {
            type: 'video',
            src: '/media/test.webm',
            poster: '/images/poster.png',
            width: 640,
            height: 360,
            altOrCaption: 'Test recording',
            captions: {
              src: '/media/captions.vtt',
              language: 'en',
              label: 'English',
            },
          },
        ]}
      />,
    )
    expect(video).toContain('controls=""')
    expect(video).toContain('muted=""')
    expect(video).toContain('preload="none"')
    expect(video).toContain('kind="captions"')
    expect(video).not.toContain('autoPlay')
  })
  it('produces distinct absolute share-card metadata only with a configured origin', () => {
    const rpg = projects.find((project) => project.id === 'pokemon-style-rpg')!
    expect(projectShareImage(rpg, undefined)).toBeUndefined()
    expect(
      projectShareImage(projects[0], 'https://portfolio.example')?.url,
    ).toBe('https://portfolio.example/og/personal-finance-tracker.png')
    expect(projectShareImage(rpg, 'https://portfolio.example')?.url).toBe(
      'https://portfolio.example/og/pokemon-style-rpg.png',
    )
  })
  it('has no publication-ready records merely because source-based copy is available', () => {
    expect(
      projects.every(
        (project) => project.status === 'draft' && project.pending.length > 0,
      ),
    ).toBe(true)
    const fake: Project = { ...projects[0], status: 'published', pending: [] }
    expect(validateProjects([fake])).not.toEqual([])
  })
})

describe('project return boundaries', () => {
  it('accepts only homepage return locations', () => {
    expect(
      projectReturn({ key: 'source', href: '/?intro=preview#projects' }),
    ).toEqual({ key: 'source', href: '/?intro=preview#projects' })
    for (const href of [
      'https://other.example',
      '//other.example',
      '/projects/argus',
      'javascript:alert(1)',
    ])
      expect(projectReturn({ key: 'bad', href })).toBeUndefined()
    expect(projectReturn(null)).toBeUndefined()
  })
  it('restores in memory even when session storage is blocked', () => {
    vi.stubGlobal('sessionStorage', {
      getItem() {
        throw Error('blocked')
      },
      setItem() {
        throw Error('blocked')
      },
    })
    rememberProjectPosition('blocked-test', {
      y: 1800,
      width: 1440,
      focusKey: 'gallery:argus',
    })
    expect(readProjectPosition('blocked-test')?.y).toBe(1800)
    expect(readProjectPosition('missing-test')).toBeUndefined()
  })
  it('discards corrupted or invalid persisted positions', () => {
    vi.stubGlobal('sessionStorage', {
      getItem: () =>
        JSON.stringify([
          ['invalid-test', { y: -20, width: 0, focusKey: 'bad"selector' }],
        ]),
    })
    expect(readProjectPosition('invalid-test')).toBeUndefined()
    vi.stubGlobal('sessionStorage', { getItem: () => '{broken' })
    expect(readProjectPosition('corrupt-test')).toBeUndefined()
  })
})
