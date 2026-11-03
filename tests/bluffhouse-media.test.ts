import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { projects } from '../src/content/projects'
import provenance from '../docs/media/bluffhouse.json'

describe('Bluff House reviewed media', () => {
  it('keeps five source images and the narrated video identical to reviewed originals', () => {
    expect(provenance.screenshotCollection).toHaveLength(20)
    for (const asset of provenance.screenshotCollection) {
      expect(
        createHash('sha256').update(readFileSync(asset.output)).digest('hex'),
      ).toBe(asset.sha256)
    }
    for (const asset of provenance.selection) {
      if ('sha256' in asset) {
        expect(
          createHash('sha256').update(readFileSync(asset.output)).digest('hex'),
        ).toBe(asset.sha256)
      }
    }
    const project = projects.find((project) => project.id === 'bluffhouse')!
    expect(project.status).toBe('draft')
    expect(
      project.media.filter((media) => media.type === 'image'),
    ).toHaveLength(5)
    expect(project.media.find((media) => media.type === 'video')).toMatchObject(
      { hasAudio: true, captions: { language: 'en' } },
    )
    expect(
      readFileSync(
        'public/videos/projects/bluffhouse/gameplay-en.vtt',
        'utf8',
      ).replace(/\r\n/g, '\n'),
    ).toMatch(/^WEBVTT\n\n1\n00:00:00\.076 -->/)
  })
})
