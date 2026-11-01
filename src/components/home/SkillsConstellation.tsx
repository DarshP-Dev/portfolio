import { useId, useState, type CSSProperties } from 'react'
import type { SkillCategory } from '../../content/skills'

const positions = [
  [17, 24],
  [50, 16],
  [83, 24],
  [17, 73],
  [50, 83],
  [83, 73],
]
// Each technology belongs to exactly one category; cap the visual network at 18.
export function SkillsConstellation({
  categories,
}: {
  categories: SkillCategory[]
}) {
  const [active, setActive] = useState<number | null>(null)
  const id = useId()
  const hasSkills = categories.some((category) => category.technologies.length)
  return (
    <>
      <div
        className="skills-constellation"
        aria-label="Skills by category"
        onMouseLeave={() => setActive(null)}
      >
        <span className="constellation-center mono" aria-hidden="true">
          A connected
          <br />
          toolkit<span>DP / 03</span>
        </span>
        <svg
          className="constellation-lines"
          viewBox="0 0 1000 440"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {categories.map((category, index) => {
            const [x, y] = positions[index % positions.length]
            return (
              <path
                key={category.name}
                data-active={active === index}
                d={`M500 220 Q${x * 10} 220 ${x * 10} ${y * 4.4}`}
              />
            )
          })}
        </svg>
        {categories.map((category, index) => {
          const [x, y] = positions[index % positions.length]
          return (
            <div
              className="constellation-cluster"
              key={category.name}
              data-active={active === index}
              style={{ left: `${x}%`, top: `${y}%` } as CSSProperties}
            >
              <button
                type="button"
                aria-controls={`${id}-category-${index}`}
                onClick={() => setActive(index)}
                onPointerEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                onBlur={() => setActive(null)}
              >
                {category.name === 'AI / Computer Vision'
                  ? 'AI / CV'
                  : category.name}
              </button>
              <ul
                className="constellation-technologies"
                aria-label={`${category.name} technologies`}
              >
                {category.technologies.slice(0, 3).map((tech) => (
                  <li key={tech.name}>
                    <a
                      href={`#${id}-category-${index}`}
                      onFocus={() => setActive(index)}
                      aria-label={`${tech.name}, see categorized skills`}
                    >
                      {tech.logo ? (
                        <img
                          src={tech.logo}
                          alt=""
                          width="24"
                          height="24"
                          loading="lazy"
                        />
                      ) : (
                        <span aria-hidden="true">{tech.name.slice(0, 2)}</span>
                      )}
                      <span className="technology-tooltip">{tech.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
              {!category.technologies.length && (
                <span className="constellation-pending">
                  Skills pending verification
                </span>
              )}
            </div>
          )
        })}
        {!hasSkills && (
          <span className="constellation-note mono">
            Category map · technology logos pending verification
          </span>
        )}
      </div>
      <div className="skills-grid grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, index) => (
          <div
            className="skill-category"
            key={category.name}
            id={`${id}-category-${index}`}
          >
            <span className="mono quiet">0{index + 1}</span>
            <h3>{category.name}</h3>
            {category.technologies.length ? (
              <ul>
                {category.technologies.map((tech) => (
                  <li key={tech.name}>{tech.name}</li>
                ))}
              </ul>
            ) : (
              <p>Verified skills pending</p>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
