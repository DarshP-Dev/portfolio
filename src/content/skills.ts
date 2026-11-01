// TODO: Populate from verified project work and the current resume.
// Categories are approved structure, not proficiency claims.
export interface SkillTechnology {
  name: string
  /** An approved local logo asset. A text abbreviation is used when absent. */
  logo?: string
}
export interface SkillCategory {
  name: string
  technologies: SkillTechnology[]
}
export const skillCategories: SkillCategory[] = [
  'Languages',
  'Frontend',
  'Backend',
  'Databases',
  'Tools',
  'AI / Computer Vision',
].map((name) => ({ name, technologies: [] }))
