import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { JourneyTimeline } from '../src/components/home/JourneyTimeline'
import { SkillsConstellation } from '../src/components/home/SkillsConstellation'
import { AccordionGallery } from '../src/components/home/AccordionGallery'
import { projects } from '../src/content/projects'
import { timeline } from '../src/content/timeline'
import { skillCategories } from '../src/content/skills'

describe('homepage content boundaries and fallbacks', () => {
  it('keeps unverified skills and employment out of the review build', () => {
    expect(timeline).toEqual([])
    expect(
      skillCategories.every((category) => !category.technologies.length),
    ).toBe(true)
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <JourneyTimeline entries={timeline} />
        <SkillsConstellation categories={skillCategories} />
      </MemoryRouter>,
    )
    expect(html).toContain('Timeline in preparation')
    expect(html).toContain('Verified skills pending')
    expect(html).not.toContain('Student Works')
    expect(html).not.toContain('Online')
    expect(html).not.toContain('timeline-year')
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
        <AccordionGallery projects={[projects[0]]} />
      </MemoryRouter>,
    )
    expect(html.match(/<li>/g)).toHaveLength(1)
    expect(html).toContain('href="/projects/personal-finance-tracker"')
    expect(html).toContain('Screenshot pending')
    expect(html).not.toContain('role="listitem"')
  })
})
