import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { JourneyTimeline } from '../src/components/home/JourneyTimeline'
import { SkillsConstellation } from '../src/components/home/SkillsConstellation'
import { AccordionGallery } from '../src/components/home/AccordionGallery'
import { projects } from '../src/content/projects'
import { timeline, timelineDate } from '../src/content/timeline'
import { skillCategories } from '../src/content/skills'
import { biography } from '../src/content/about'

describe('homepage content boundaries and fallbacks', () => {
  it('renders eight approved milestones with one mechanical design experience and no invented claims', () => {
    expect(timeline).toHaveLength(8)
    expect(timeline.map((entry) => entry.startDate)).toEqual(
      timeline
        .map((entry) => entry.startDate)
        .sort()
        .reverse(),
    )
    expect(new Set(timeline.map((entry) => entry.id)).size).toBe(8)
    expect(
      timeline.filter((entry) => entry.organization === 'DH Precision'),
    ).toHaveLength(1)
    expect(
      timeline
        .filter((entry) => entry.kind === 'hackathon')
        .map((entry) => [entry.projectId, entry.startDate]),
    ).toEqual([
      ['argus', '2026-10'],
      ['bluffhouse', '2026-10'],
      ['deenstudio', '2026-05'],
    ])
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <JourneyTimeline entries={timeline} />
        <SkillsConstellation categories={skillCategories} />
      </MemoryRouter>,
    )
    expect(html).not.toContain('Timeline in preparation')
    expect(html).not.toContain('Verified skills pending')
    expect(html).toContain('June 2029 (expected)')
    expect(html).toContain('93.5%')
    expect(html).toContain('Munadir')
    expect(html).toContain('May 2027')
    expect(html.match(/timeline-year/g)).toHaveLength(8)
    expect(html).toContain('href="/projects/argus"')
    expect(html).toContain('href="/projects/bluffhouse"')
    expect(html).toContain('href="/projects/deenstudio"')
    expect(html).not.toContain('Student Works')
    expect(html).not.toContain('Independent Contract')
    expect(html).not.toMatch(/GPA|winner|award/i)
  })
  it('uses approved biography and readable categorized skills without proficiency scores', () => {
    expect(biography).toHaveLength(3)
    expect(biography.join(' ')).toContain('Western University')
    expect(skillCategories).toHaveLength(6)
    const names = skillCategories.flatMap((category) =>
      category.technologies.map((tech) => tech.name),
    )
    expect(names.length).toBeGreaterThan(30)
    expect(new Set(names).size).toBe(names.length)
    expect(names).toContain('Onshape')
    expect(names).toContain('MediaPipe')
    expect(timelineDate('2026-10')).toBe('October 2026')
    expect(timelineDate('Present')).toBe('Present')
  })
  it('renders provided milestone detail groups, dates, and real media without requiring JavaScript', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <JourneyTimeline
          entries={[
            {
              id: 'fixture-a',
              kind: 'education',
              title: 'Test education',
              organization: 'Test school',
              startDate: '2024',
              summary: 'Test summary',
              details: ['Test contribution'],
              preview: {
                src: '/test-only.webp',
                alt: 'Test media',
                width: 320,
                height: 180,
              },
            },
            {
              id: 'fixture-b',
              kind: 'experience',
              title: 'Test experience',
              organization: 'Test organization',
              startDate: '2025',
              summary: 'Test overview',
              details: ['Second test detail'],
            },
          ]}
        />
      </MemoryRouter>,
    )
    const groups = Array.from(
      html.matchAll(/<details[^>]*name="([^"]+)"/g),
      (match) => match[1],
    )
    expect(groups).toHaveLength(2)
    expect(groups[0]).toBe(groups[1])
    expect(html.match(/ open=""/g)).toHaveLength(1)
    expect(html).toContain('Test contribution')
    expect(html).toContain('alt="Test media"')
    expect(html).toContain('2024')
    expect(html).not.toContain('Timeline in preparation')
  })
  it('uses the same supplied technologies in the network and the readable grid', () => {
    const html = renderToStaticMarkup(
      <SkillsConstellation
        categories={[
          {
            name: 'Test category',
            technologies: [{ name: 'Test technology', logo: '/test-logo.svg' }],
          },
        ]}
      />,
    )
    expect(html).toContain('Test technology, see categorized skills')
    expect(html).toContain('<li>Test technology</li>')
    expect(html).toContain('src="/test-logo.svg"')
    expect(html).not.toContain('Verified skills pending')
  })
  it('handles empty or single-project galleries without sample content or fake media', () => {
    expect(
      renderToStaticMarkup(
        <MemoryRouter>
          <AccordionGallery projects={[]} />
        </MemoryRouter>,
      ),
    ).not.toContain('picsum')
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <AccordionGallery projects={[{ ...projects[0], media: [] }]} />
      </MemoryRouter>,
    )
    expect(html.match(/<li>/g)).toHaveLength(1)
    expect(html).toContain('href="/projects/personal-finance-tracker"')
    expect(html).toContain('Screenshot pending')
    expect(html).not.toContain('role="listitem"')
  })
})
