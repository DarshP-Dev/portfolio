import { describe, it, expect, vi } from 'vitest'
import {
  buildCommands,
  filterCommands,
} from '../src/components/navigation/commands'
import { shouldPlayIntro } from '../src/components/intro/session'

describe('command index', () => {
  it('excludes drafts and unavailable owner actions from the public index', () => {
    const actions = buildCommands()
    expect(actions.filter((action) => action.group === 'Section')).toHaveLength(
      6,
    )
    expect(
      actions
        .filter((action) => action.group === 'Action')
        .map((action) => action.id),
    ).toEqual(['github', 'linkedin', 'email'])
    expect(actions.some((action) => action.id === 'resume')).toBe(false)
  })
  it('includes explicitly labeled project drafts only in review mode', () => {
    const projects = buildCommands(true).filter(
      (action) => action.group === 'Project',
    )
    expect(projects).toHaveLength(7)
    expect(
      projects.every((action) => action.description.includes('Draft')),
    ).toBe(true)
    expect(new Set(buildCommands(true).map((action) => action.id)).size).toBe(
      16,
    )
  })
  it('filters case-insensitive multi-word queries and journey synonyms', () => {
    expect(
      filterCommands(buildCommands(true), ' FINANCE  TRACKER '),
    ).toHaveLength(1)
    expect(filterCommands(buildCommands(), 'journey')[0].href).toBe(
      '/#experience',
    )
    expect(filterCommands(buildCommands(), 'nothing matches')).toEqual([])
    expect(filterCommands(buildCommands(), '  ')).toHaveLength(9)
  })
})

describe('intro eligibility', () => {
  const initial = {
    pathname: '/',
    hash: '',
    reducedMotion: false,
    seen: false,
    scrollY: 0,
    modalOpen: false,
  }
  it('plays only for a first session at the top of the homepage', () => {
    expect(shouldPlayIntro(initial)).toBe(true)
    for (const override of [
      { pathname: '/projects/argus' },
      { hash: '#contact' },
      { reducedMotion: true },
      { seen: true },
      { scrollY: 100 },
      { modalOpen: true },
    ])
      expect(shouldPlayIntro({ ...initial, ...override })).toBe(false)
  })
  it('falls back to document memory if session storage is unavailable', async () => {
    vi.resetModules()
    const { markIntroSeen, readIntroSeen } =
      await import('../src/components/intro/session')
    const blocked = {
      getItem: () => {
        throw new Error('Unavailable')
      },
      setItem: () => {
        throw new Error('Unavailable')
      },
    }
    expect(readIntroSeen(blocked)).toBe(false)
    expect(() => markIntroSeen(blocked)).not.toThrow()
    expect(readIntroSeen(blocked)).toBe(true)
  })
})
