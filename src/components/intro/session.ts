export const INTRO_SESSION_KEY = 'darsh-portfolio.signature-intro.v1'
let seenInMemory = false

export function readIntroSeen(storage?: Pick<Storage, 'getItem'>) {
  if (seenInMemory) return true
  try {
    return storage?.getItem(INTRO_SESSION_KEY) === 'seen'
  } catch {
    return false
  }
}

export function markIntroSeen(storage?: Pick<Storage, 'setItem'>) {
  seenInMemory = true
  try {
    storage?.setItem(INTRO_SESSION_KEY, 'seen')
  } catch {
    /* In-memory fallback remains valid for this document. */
  }
}

export function shouldPlayIntro({
  pathname,
  hash,
  reducedMotion,
  seen,
  scrollY,
  modalOpen,
}: {
  pathname: string
  hash: string
  reducedMotion: boolean
  seen: boolean
  scrollY: number
  modalOpen: boolean
}) {
  return (
    pathname === '/' &&
    !hash &&
    !reducedMotion &&
    !seen &&
    scrollY < 24 &&
    !modalOpen
  )
}
