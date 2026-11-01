import * as fontkit from 'fontkit'
import { writeFile } from 'node:fs/promises'

// Build-time only. Match the actual hero: Geist 500, -0.075em tracking, 1.04 line-height.
// The static font avoids fontkit's variable WOFF2 instancing limitation.
const font = fontkit.openSync(
  'node_modules/@fontsource/geist/files/geist-latin-500-normal.woff2',
)
const run = font.layout('Darsh Patel.')
const fontSize = 200
const scale = fontSize / font.unitsPerEm
const height = fontSize * 1.04
const baseline =
  (height - (font.ascent - font.descent) * scale) / 2 + font.ascent * scale
let x = 0
const paths = run.glyphs.map((glyph, index) => {
  const position = run.positions[index]
  const path = glyph.path
    .transform(
      scale,
      0,
      0,
      -scale,
      x + position.xOffset * scale,
      baseline - position.yOffset * scale,
    )
    .toSVG()
  x += position.xAdvance * scale - fontSize * 0.075
  return path
})
const data = { width: x, height, name: paths.join('') }
await writeFile(
  'src/components/intro/name-path.json',
  JSON.stringify(data, null, 2) + '\n',
)
console.log(
  'Generated the Geist hero-name outline; font license is in public/font-licenses/geist.txt.',
)
