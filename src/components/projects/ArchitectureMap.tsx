import { useId, useState } from 'react'
import type { Project } from '../../content/projects'

export function ArchitectureMap({
  nodes,
}: {
  nodes: NonNullable<Project['architectureNodes']>
}) {
  const [active, setActive] = useState<string>()
  const id = useId()
  return (
    <div className="architecture-map">
      <ol className="architecture-flow" aria-label="Architecture components">
        {nodes.map((node, index) => (
          <li key={node.id}>
            <button
              type="button"
              aria-controls={`${id}-${node.id}`}
              onFocus={() => setActive(node.id)}
              onClick={() => setActive(node.id)}
            >
              <span className="mono">0{index + 1}</span>
              {node.label}
              <span aria-hidden="true">↓</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="architecture-descriptions">
        {nodes.map((node) => (
          <div
            key={node.id}
            id={`${id}-${node.id}`}
            data-active={node.id === active}
          >
            <h3>{node.label}</h3>
            <p>{node.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
