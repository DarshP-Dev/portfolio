import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { site } from '../../content/site'
import { buildCommands, filterCommands, type CommandAction } from './commands'

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const results = useRef<HTMLUListElement>(null)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const id = useId()
  const navigate = useNavigate()
  const location = useLocation()
  const actions = useMemo(() => buildCommands(site.includeDrafts), [])
  const filtered = filterCommands(actions, query)
  const active = filtered.length ? Math.min(selected, filtered.length - 1) : -1

  useEffect(() => {
    const element = dialog.current!
    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    element.showModal()
    input.current?.focus()
    return () => {
      element.close()
      if (previous?.isConnected) previous.focus({ preventScroll: true })
    }
  }, [])

  useEffect(() => {
    results.current
      ?.querySelector(`[data-result-index="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [active, query])

  function activate(action: CommandAction) {
    dialog.current?.close()
    onClose()
    if (action.href.startsWith('/')) {
      navigate(action.href)
      if (action.href === `${location.pathname}${location.hash}`)
        queueMicrotask(() => {
          const target = action.href.includes('#')
            ? document.getElementById(action.href.split('#')[1])
            : document.querySelector<HTMLElement>('main h1')
          target?.scrollIntoView({ block: 'start' })
          target?.focus({ preventScroll: true })
        })
    } else window.location.assign(action.href)
  }

  return (
    <dialog
      ref={dialog}
      className="command-dialog"
      aria-labelledby={`${id}-title`}
      onCancel={onClose}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="command-panel">
        <div className="command-title-row">
          <h2 id={`${id}-title`}>Quick navigate</h2>
          <button
            type="button"
            className="dialog-close"
            onClick={onClose}
            aria-label="Close quick navigation"
          >
            Esc <span aria-hidden="true">×</span>
          </button>
        </div>
        <label className="sr-only" htmlFor={`${id}-input`}>
          Search pages and actions
        </label>
        <div className="command-input-row">
          <span aria-hidden="true">⌕</span>
          <input
            id={`${id}-input`}
            ref={input}
            type="text"
            role="combobox"
            autoComplete="off"
            spellCheck={false}
            placeholder="Where would you like to go?"
            aria-expanded="true"
            aria-autocomplete="list"
            aria-controls={`${id}-results`}
            aria-activedescendant={
              active >= 0 ? `${id}-option-${active}` : undefined
            }
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setSelected(0)
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault()
                if (filtered.length)
                  setSelected(
                    (Math.max(active, 0) +
                      (event.key === 'ArrowDown' ? 1 : -1) +
                      filtered.length) %
                      filtered.length,
                  )
              }
              if (event.key === 'Enter' && active >= 0) {
                event.preventDefault()
                activate(filtered[active])
              }
            }}
          />
        </div>
        <p
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {filtered.length} {filtered.length === 1 ? 'result' : 'results'}{' '}
          available.
        </p>
        <ul
          id={`${id}-results`}
          ref={results}
          className="command-results"
          role="listbox"
          aria-label="Navigation results"
        >
          {filtered.map((action, index) => (
            <li
              role="option"
              id={`${id}-option-${index}`}
              key={action.id}
              data-result-index={index}
              aria-selected={active === index}
              onPointerMove={() => setSelected(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => activate(action)}
            >
              <span className="command-result-icon" aria-hidden="true">
                {action.group === 'Section'
                  ? '↳'
                  : action.group === 'Project'
                    ? '□'
                    : '↗'}
              </span>
              <span className="command-result-copy">
                <strong>{action.label}</strong>
                <small>{action.description}</small>
              </span>
              <span className="command-result-group">{action.group}</span>
              <span className="command-return" aria-hidden="true">
                ↵
              </span>
            </li>
          ))}
        </ul>
        {!filtered.length && (
          <p className="command-empty">
            No matches. Try “projects”, “journey”, or a project name.
          </p>
        )}
        <div className="command-footer">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> move <kbd>↵</kbd> open
          </span>
          <span>
            {site.includeDrafts
              ? 'Draft pages included in preview'
              : 'Sections & published work'}
          </span>
        </div>
      </div>
    </dialog>
  )
}
