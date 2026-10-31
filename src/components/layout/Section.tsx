import type { ReactNode } from 'react'

export function Section({
  id,
  number,
  label,
  title,
  children,
  className = '',
}: {
  id: string
  number: string
  label: string
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <section
      id={id}
      tabIndex={-1}
      aria-labelledby={`${id}-heading`}
      className={`section-shell ${className}`}
    >
      <div className="page-width">
        <div className="section-topline">
          <p className="eyebrow">{label}</p>
          <span className="section-number" aria-hidden="true">
            {number}
          </span>
        </div>
        <h2 id={`${id}-heading`}>{title}</h2>
        {children}
      </div>
    </section>
  )
}
