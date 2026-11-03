import { useState } from 'react'
import screenshots from '../../content/bluffhouse-screenshots.json'
import type { ProjectMedia } from '../../content/projects'
import { MediaGallery } from './MediaGallery'

const bluffHouseChapters = [
  { title: 'The home lounge', images: [1] },
  { title: 'Gather the table', images: [2, 3] },
  { title: 'Play Blackjack', images: [8, 11] },
  { title: 'Call My Bluff', images: [9, 10] },
  { title: 'Become the House and build a wager', images: [4, 5, 6, 7] },
  { title: 'Party games and Connect Four', images: [12, 13, 14, 15] },
  { title: 'Shadow Blackjack', images: [16, 17, 18] },
  { title: 'Final standings and achievements', images: [19, 20] },
]

export function BluffHouseScreenshots() {
  const [expanded, setExpanded] = useState<string | null>(null)
  return (
    <section
      className="case-section bluffhouse-screenshots"
      aria-labelledby="bluffhouse-screenshots-heading"
    >
      <div className="case-section-label">
        <span className="mono">Gallery /</span>
        <h2 id="bluffhouse-screenshots-heading">From lounge to showdown</h2>
      </div>
      <div className="case-section-content">
        <p>
          Explore all 20 original screenshots in eight chapters. These are
          recorded local gameplay states with demo players and fictional chips.
          Open a chapter to browse or enlarge its images.
        </p>
        {bluffHouseChapters.map((chapter) => (
          <details
            className="bluffhouse-chapter"
            key={chapter.title}
            name="bluffhouse-chapters"
            onToggle={(event) => {
              if (event.currentTarget.open) setExpanded(chapter.title)
              else
                setExpanded((current) =>
                  current === chapter.title ? null : current,
                )
            }}
          >
            <summary>
              {chapter.title}{' '}
              <span className="mono">
                {' '}
                / {chapter.images.length}{' '}
                {chapter.images.length === 1 ? 'image' : 'images'}
              </span>
            </summary>
            {expanded === chapter.title && (
              <MediaGallery
                title={`Bluff House — ${chapter.title}`}
                media={chapter.images.map(
                  (number) => screenshots[number - 1] as ProjectMedia,
                )}
              />
            )}
            <noscript>
              <ul>
                {chapter.images.map((number) => (
                  <li key={number}>
                    <a href={screenshots[number - 1].src}>
                      {screenshots[number - 1].caption} — original PNG
                    </a>
                  </li>
                ))}
              </ul>
            </noscript>
          </details>
        ))}
      </div>
    </section>
  )
}
