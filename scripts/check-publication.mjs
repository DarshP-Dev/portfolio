import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

// Reserved .example origin is an isolated test value, never a deployed/domain setting.
for (const [label, overrides] of [
  ['preview', { VERCEL_ENV: 'preview', VITE_INCLUDE_DRAFTS: 'true' }],
  ['public', { VERCEL_ENV: 'production', VITE_INCLUDE_DRAFTS: 'false' }],
]) {
  const output = `.cache/phase6/publication-check/${label}`
  const env = {
    ...process.env,
    ...overrides,
    CONTACT_ENABLED: 'false',
    VITE_SITE_URL: 'https://portfolio.example',
    VITE_SITE_INDEXABLE: 'true',
    BUILD_OUTPUT_ROOT: output,
  }
  for (const script of ['scripts/build.mjs', 'scripts/check-built-site.mjs']) {
    const result = spawnSync(process.execPath, [script], {
      env,
      encoding: 'utf8',
    })
    if (result.status !== 0)
      throw new Error(
        `${label}: ${script} failed\n${result.stdout}\n${result.stderr}`,
      )
  }
  const root = resolve(output, 'dist')
  const { publicAssets } = await import(
    pathToFileURL(resolve(output, 'dist-ssr/entry-server.js')).href
  )
  const { resumeUrl } = publicAssets()
  assert.equal(resumeUrl, '/resume/Darsh_Patel_Resume.pdf')
  assert.deepEqual(
    await readFile(resolve(root, `.${resumeUrl}`)),
    await readFile(resolve('public', `.${resumeUrl}`)),
    'The approved PDF ships unchanged',
  )
  const html = await readFile(resolve(root, 'index.html'), 'utf8')
  assert.equal((html.match(/data-milestone=/g) || []).length, 8)
  assert.ok(html.includes('May 2027'))
  assert.ok(html.includes('Twelve Data API'))
  assert.ok(!html.includes('A more personal biography will be added'))
  const sitemap = await readFile(resolve(root, 'sitemap.xml'), 'utf8')
  assert.ok(html.includes('https://portfolio.example/og/portfolio.png'))
  assert.ok(html.includes('rel="canonical" href="https://portfolio.example/"'))
  const entries = await readdir(root)
  if (label === 'preview') {
    assert.equal(
      (html.match(/class="text-link timeline-case-study"/g) || []).length,
      3,
    )
    assert.ok(html.includes('content="noindex, nofollow"'))
    assert.ok(!sitemap.includes('<loc>'))
    const project = await readFile(
      resolve(root, 'projects/argus/index.html'),
      'utf8',
    )
    assert.ok(project.includes('https://portfolio.example/og/argus.png'))
    assert.ok(project.includes('content="noindex, nofollow"'))
  } else {
    assert.ok(
      !html.includes('timeline-case-study'),
      'Draft case-study links stay out of public timeline',
    )
    assert.ok(
      !html.includes('timeline-preview'),
      'Unapproved project media stays out of public timeline',
    )
    assert.ok(html.includes('content="index, follow"'))
    assert.equal(
      (sitemap.match(/<loc>/g) || []).length,
      1,
      'No currently unapproved project belongs in a public sitemap',
    )
    assert.ok(
      !entries.includes('projects'),
      'Draft HTML does not ship in a public build',
    )
    assert.deepEqual(
      await readdir(resolve(root, 'images/projects')),
      [],
      'Excluded draft screenshots/derivatives do not ship either',
    )
    assert.deepEqual(
      await readdir(resolve(root, 'videos/projects')),
      [],
      'Draft videos and captions do not ship',
    )
    assert.deepEqual(
      await readdir(resolve(root, 'og')),
      ['portfolio.png'],
      'Excluded draft share cards do not ship',
    )
    assert.deepEqual(
      await readdir(resolve(root, 'resume')),
      ['Darsh_Patel_Resume.pdf'],
      'Only the approved resume is copied',
    )
    assert.ok(
      !html.includes('intro-review'),
      'No prototype controls in public HTML',
    )
    const missing = await readFile(resolve(root, '404.html'), 'utf8')
    assert.ok(missing.includes('content="noindex, nofollow"'))
    assert.ok(!missing.includes('rel="canonical"'))
  }
  console.log(
    `Verified ${label}: raw canonical/OG, indexing policy, sitemap and draft exclusion.`,
  )
}
