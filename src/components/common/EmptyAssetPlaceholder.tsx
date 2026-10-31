export function EmptyAssetPlaceholder({
  label,
  variant = 'project',
  number,
}: {
  label: string
  variant?: 'project' | 'portrait'
  number?: string
}) {
  return (
    <div className={`asset-placeholder asset-placeholder--${variant}`}>
      <span className="placeholder-corner" aria-hidden="true">
        {number || 'DP'}
      </span>
      <div className="placeholder-center" aria-hidden="true">
        <span className="placeholder-mark">
          {variant === 'portrait' ? 'DP.' : '↗'}
        </span>
      </div>
      <span className="placeholder-caption">{label}</span>
    </div>
  )
}
