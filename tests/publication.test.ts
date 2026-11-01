import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  canonicalOrigin,
  crawlerFiles,
  escapeXml,
  publicationSettings,
  resumeAssetPath,
  includePublicAsset,
} from '../src/content/publication'
import { pageMetadata, projectShareImage } from '../src/app/metadata'
import { projects } from '../src/content/projects'
import { responsiveImage } from '../src/components/common/responsive-image'
import variants from '../src/content/image-variants.json'

describe('publication configuration and crawler boundaries', () => {
  it('copies only included project assets and the configured approved resume into build output', () => {
    expect(includePublicAsset('images/projects/argus/hub.png', ['argus'])).toBe(
      true,
    )
    expect(includePublicAsset('images/projects/argus/hub-960.webp', [])).toBe(
      false,
    )
    expect(includePublicAsset('og/argus.png', [])).toBe(false)
    expect(includePublicAsset('og/portfolio.png', [])).toBe(true)
    expect(
      includePublicAsset('resume/old.pdf', [], '/resume/approved.pdf'),
    ).toBe(false)
    expect(
      includePublicAsset('resume/approved.pdf', [], '/resume/approved.pdf'),
    ).toBe(true)
    expect(includePublicAsset('resume/approved.pdf', [])).toBe(false)
    expect(includePublicAsset('resume/.gitkeep', [])).toBe(false)
  })
  it('allows an approved resume filename to be configured without exposing arbitrary paths or URLs', () => {
    expect(resumeAssetPath(undefined)).toBe('/resume/Darsh_Patel_Resume.pdf')
    expect(resumeAssetPath('/resume/Darsh_Patel_Resume_Final.pdf')).toBe(
      '/resume/Darsh_Patel_Resume_Final.pdf',
    )
    for (const path of [
      '/resume/../secret.pdf',
      'https://external.example/resume.pdf',
      '/images/resume.pdf',
      '/resume/file.html',
      '/resume/subdirectory/file.pdf',
    ])
      expect(() => resumeAssetPath(path)).toThrow('VITE_RESUME_PATH')
  })
  const publicEnv = {
    VITE_SITE_URL: 'https://portfolio.example',
    VITE_SITE_INDEXABLE: 'true',
    VITE_INCLUDE_DRAFTS: 'false',
  }
  it('accepts only a bare HTTPS canonical origin, without reflecting invalid values', () => {
    expect(canonicalOrigin('')).toBeUndefined()
    expect(canonicalOrigin(' https://portfolio.example/ ')).toBe(
      'https://portfolio.example',
    )
    for (const input of [
      'http://portfolio.example',
      'javascript:alert(1)',
      'https://portfolio.example/path',
      'https://owner:secret@portfolio.example',
      'https://portfolio.example?draft=true',
      'https://portfolio.example#test',
    ]) {
      expect(() => canonicalOrigin(input)).toThrow(
        'VITE_SITE_URL must be an HTTPS origin',
      )
    }
  })
  it('keeps review, development and Vercel previews noindex even with inherited publication settings', () => {
    expect(publicationSettings({}, true).indexingEnabled).toBe(false)
    expect(publicationSettings(publicEnv, false).indexingEnabled).toBe(false)
    for (const VERCEL_ENV of ['preview', 'development'])
      expect(
        publicationSettings(
          { ...publicEnv, VERCEL_ENV, VITE_INCLUDE_DRAFTS: 'true' },
          true,
        ).indexingEnabled,
      ).toBe(false)
    expect(publicationSettings(publicEnv, true).indexingEnabled).toBe(true)
    expect(() =>
      publicationSettings({ ...publicEnv, VITE_INCLUDE_DRAFTS: 'true' }, true),
    ).toThrow('VITE_INCLUDE_DRAFTS=false')
    expect(() =>
      publicationSettings({ ...publicEnv, VITE_SITE_URL: '' }, true),
    ).toThrow('verified VITE_SITE_URL')
  })
  it('emits no invented dates or draft URLs and deduplicates/escapes valid public sitemap entries', () => {
    const review = crawlerFiles(
      { indexingEnabled: false, canonicalOrigin: 'https://portfolio.example' },
      ['/projects/argus'],
    )
    expect(review.robots).toBe('User-agent: *\nDisallow: /\n')
    expect(review.sitemap).not.toContain('<loc>')
    const live = crawlerFiles(publicationSettings(publicEnv, true), [
      '/projects/approved-project',
      '/projects/approved-project',
      '/api/contact',
      '//external.example',
      '/projects/x?draft=true',
    ])
    expect(live.robots).toContain(
      'Sitemap: https://portfolio.example/sitemap.xml',
    )
    expect(live.sitemap.match(/<loc>/g)).toHaveLength(2)
    expect(live.sitemap).toContain(
      'https://portfolio.example/projects/approved-project',
    )
    expect(live.sitemap).not.toMatch(
      /lastmod|external\.example|api\/contact|draft=true/,
    )
    expect(escapeXml('A&B<"test">')).toBe('A&amp;B&lt;&quot;test&quot;&gt;')
  })
  it('keeps errors and current drafts noindex and uses one correctly sized share card per route', () => {
    expect(pageMetadata('/missing').canonical).toBeUndefined()
    expect(pageMetadata('/missing').image).toBeUndefined()
    expect(pageMetadata('/missing').robots).toBe('noindex, nofollow')
    const cards = [undefined, ...projects].map((project) =>
      projectShareImage(project, 'https://portfolio.example')!,
    )
    expect(new Set(cards.map((card) => card.url)).size).toBe(8)
    for (const card of cards) {
      expect(card).toMatchObject({ width: 1200, height: 630 })
      const buffer = readFileSync(
        resolve('public', `.${new URL(card.url).pathname}`),
      )
      expect(buffer.subarray(1, 4).toString()).toBe('PNG')
      expect([buffer.readUInt32BE(16), buffer.readUInt32BE(20)]).toEqual([
        1200, 630,
      ])
    }
  })
})

describe('responsive derivatives preserve source material', () => {
  it('covers every real project image with existing WebP files, matching proportions and original fallbacks', () => {
    for (const project of projects)
      for (const media of project.media.filter(
        (item) => item.type === 'image',
      )) {
        expect(existsSync(resolve('public', `.${media.src}`))).toBe(true)
        const image = (
          variants as Record<
            string,
            {
              width: number
              height: number
              variants: { src: string; width: number }[]
            }
          >
        )[media.src]
        expect(image).toBeDefined()
        expect(image.width / image.height).toBeCloseTo(
          media.width / media.height,
          1,
        )
        expect(
          image.variants.every((variant) => variant.width <= image.width),
        ).toBe(true)
        expect(responsiveImage(media.src, '90vw').srcSet).toContain('webp')
        for (const variant of image.variants) {
          const bytes = readFileSync(resolve('public', `.${variant.src}`))
          expect(bytes.subarray(8, 12).toString()).toBe('WEBP')
        }
      }
    expect(responsiveImage('/unlisted-image.png', '90vw')).toEqual({})
  })
})
