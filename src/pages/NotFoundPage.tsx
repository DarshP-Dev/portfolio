import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <div className="not-found page-width">
      <p className="eyebrow">404 / Page not found</p>
      <h1 tabIndex={-1}>A little off course.</h1>
      <p>
        This page isn’t here. You can find your way back to the portfolio below.
      </p>
      <Link to="/" className="action-link">
        Back to Home <span aria-hidden="true">↗</span>
      </Link>
    </div>
  )
}
