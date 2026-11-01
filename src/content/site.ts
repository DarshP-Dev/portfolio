export const site = {
  name: 'Darsh Patel',
  title: 'Darsh Patel — Software Engineering Portfolio',
  description:
    'Software Engineering student at Western University, exploring full-stack development, computer vision, and intelligent systems.',
  headline: 'Building thoughtful software, from idea to implementation.',
  // Phase 1 is a review build. Public indexing is deferred to Phase 6.
  includeDrafts: import.meta.env.VITE_INCLUDE_DRAFTS !== 'false',
  signatureIntroEnabled: import.meta.env.VITE_ENABLE_SIGNATURE_INTRO === 'true',
  canonicalOrigin: import.meta.env.VITE_SITE_URL || undefined,
  github: undefined as string | undefined, // TODO: Verify the public profile before linking.
  linkedin: undefined as string | undefined,
  email: undefined as string | undefined,
  resume: undefined as string | undefined,
}

export const navigation = [
  { id: 'home', label: 'Home' },
  { id: 'projects', label: 'Projects' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Journey' },
  { id: 'contact', label: 'Contact' },
] as const
