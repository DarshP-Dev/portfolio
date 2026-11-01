export interface ProjectReturn {
  key: string
  href: string
}
export interface ProjectPosition {
  y: number
  width: number
  focusKey: string
}
const memory = new Map<string, ProjectPosition>()
const storageKey = 'darsh-portfolio.project-return.v1'

export function projectReturn(value: unknown): ProjectReturn | undefined {
  if (!value || typeof value !== 'object') return
  const item = value as Partial<ProjectReturn>
  if (
    typeof item.key === 'string' &&
    item.key.length <= 200 &&
    typeof item.href === 'string' &&
    /^\/(?:[?#].*)?$/.test(item.href) &&
    item.href.length < 1000
  )
    return { key: item.key, href: item.href }
}
export function rememberProjectPosition(
  key: string,
  position: ProjectPosition,
) {
  memory.set(key, position)
  if (memory.size > 20) memory.delete(memory.keys().next().value!)
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(Array.from(memory)))
  } catch {
    /* In-memory restoration remains available. */
  }
}
export function readProjectPosition(key: string): ProjectPosition | undefined {
  if (memory.has(key)) return memory.get(key)
  try {
    const saved: unknown = JSON.parse(
      sessionStorage.getItem(storageKey) ?? '[]',
    )
    if (!Array.isArray(saved)) return
    const item: unknown = saved.find(
      (entry) => Array.isArray(entry) && entry[0] === key,
    )?.[1]
    if (!item || typeof item !== 'object') return
    const position = item as ProjectPosition
    if (
      Number.isFinite(position.y) &&
      position.y >= 0 &&
      position.y <= 1e7 &&
      Number.isFinite(position.width) &&
      position.width > 0 &&
      typeof position.focusKey === 'string' &&
      /^[a-z]+:[a-z0-9-]+$/.test(position.focusKey)
    )
      return position
  } catch {
    /* Malformed or unavailable storage is a normal fallback. */
  }
}
