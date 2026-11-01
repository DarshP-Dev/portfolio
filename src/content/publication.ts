/** Public metadata only. Never pass server credentials into the browser define. */
export interface PublicationSettings {
  canonicalOrigin?: string
  indexingEnabled: boolean
}

export function resumeAssetPath(input: string | undefined) {
  const path = input?.trim() || '/resume/Darsh_Patel_Resume.pdf'
  if (!/^\/resume\/[a-zA-Z0-9][a-zA-Z0-9._-]*\.pdf$/.test(path))
    throw new Error(
      'VITE_RESUME_PATH must name a PDF directly inside /resume/.',
    )
  return path
}

export function includePublicAsset(
  path: string,
  projectSlugs: readonly string[],
  resumeUrl?: string,
) {
  if (path.split('/').some((segment) => segment.startsWith('.'))) return false
  if (path.startsWith('images/projects/'))
    return projectSlugs.includes(path.split('/')[2])
  if (path.startsWith('og/'))
    return (
      path === 'og/portfolio.png' ||
      projectSlugs.includes(path.slice(3).replace(/\.png$/, ''))
    )
  if (path.startsWith('resume/')) return `/${path}` === resumeUrl
  return true
}

export function canonicalOrigin(input: string | undefined) {
  const value = input?.trim().replace(/\/+$/, '')
  if (!value) return undefined
  try {
    const url = new URL(value)
    if (
      url.protocol === 'https:' &&
      url.origin === value &&
      !url.username &&
      !url.password
    )
      return url.origin
  } catch {
    /* Report a configuration error without reflecting environment contents. */
  }
  throw new Error(
    'VITE_SITE_URL must be an HTTPS origin without a path, credentials, query or fragment.',
  )
}

export function publicationSettings(
  env: Record<string, string | undefined>,
  build: boolean,
): PublicationSettings {
  const origin = canonicalOrigin(env.VITE_SITE_URL)
  const requested = env.VITE_SITE_INDEXABLE === 'true'
  const preview = ['preview', 'development'].includes(env.VERCEL_ENV ?? '')
  // Preview deployments stay noindex even when they inherit production settings.
  if (requested && build && !preview) {
    if (!origin)
      throw new Error('Public indexing requires a verified VITE_SITE_URL.')
    if (env.VITE_INCLUDE_DRAFTS !== 'false')
      throw new Error(
        'Public indexing requires VITE_INCLUDE_DRAFTS=false. Review drafts must stay noindex.',
      )
  }
  return {
    canonicalOrigin: origin,
    indexingEnabled:
      requested &&
      build &&
      !preview &&
      !!origin &&
      env.VITE_INCLUDE_DRAFTS === 'false',
  }
}

export function escapeXml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;',
      })[character]!,
  )
}

export function crawlerFiles(
  settings: PublicationSettings,
  publishedPaths: readonly string[],
) {
  const origin = settings.canonicalOrigin
  const paths =
    settings.indexingEnabled && origin
      ? [
          '/',
          ...publishedPaths.filter((path) =>
            /^\/projects\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(path),
          ),
        ]
      : []
  return {
    robots: paths.length
      ? `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${origin}/sitemap.xml\n`
      : 'User-agent: *\nDisallow: /\n',
    sitemap: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Array.from(
      new Set(paths),
    )
      .map(
        (path) =>
          `  <url><loc>${escapeXml(new URL(path, origin).href)}</loc></url>`,
      )
      .join('\n')}\n</urlset>\n`,
  }
}
