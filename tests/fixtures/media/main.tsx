// Isolated test-only entry. Not imported by the application or included in dist.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MediaGallery } from '../../../src/components/projects/MediaGallery'
import type { ProjectMedia } from '../../../src/content/projects'
import '../../../src/index.css'
import '../../../src/components/projects/case-study.css'

const image: ProjectMedia = {
  type: 'image',
  src: '/images/projects/pokemon-style-rpg/world.png',
  width: 1149,
  height: 865,
  altOrCaption: 'Test image',
  caption: 'Test image caption',
}
const video: ProjectMedia = {
  type: 'video',
  src: '/tests/fixtures/media/test-video.webm',
  width: 64,
  height: 64,
  poster: image.src,
  altOrCaption: 'Test video',
  caption: 'Test video caption',
  captions: {
    src: '/tests/fixtures/media/captions.vtt',
    language: 'en',
    label: 'English',
  },
}
const mode = new URLSearchParams(location.search).get('mode')
const media =
  mode === 'empty'
    ? []
    : mode === 'single'
      ? [image]
      : mode === 'broken'
        ? [{ ...image, src: '/test-only/missing.png' }]
        : [image, video]
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <main className="page-width" style={{ paddingBlock: 24 }}>
      <h1 style={{ fontSize: '2rem', marginBottom: 24 }}>Test media viewer</h1>
      <MediaGallery media={media} title="Test project" />
      <a href="?mode=empty">Leave viewer</a>
    </main>
  </StrictMode>,
)
