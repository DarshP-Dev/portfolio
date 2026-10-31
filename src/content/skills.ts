// TODO: Populate from verified project work and the current resume.
// Categories are approved structure, not proficiency claims.
export const skillCategories = [
  'Languages',
  'Frontend',
  'Backend',
  'Databases',
  'Tools',
  'AI / Computer Vision',
].map((name) => ({ name, technologies: [] as string[] }))
