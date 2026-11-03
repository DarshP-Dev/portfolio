// Owner-approved categories and technologies, checked against the approved resume.
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
  {
    name: 'Languages',
    technologies: [
      'Java',
      'Python',
      'TypeScript',
      'JavaScript',
      'C#',
      'C++',
      'SQL',
    ].map((name) => ({ name })),
  },
  {
    name: 'Frontend',
    technologies: [
      'React',
      'Next.js',
      'Tailwind CSS',
      'HTML',
      'CSS',
      'Vite',
    ].map((name) => ({ name })),
  },
  {
    name: 'Backend',
    technologies: [
      'Spring Boot',
      'Node.js',
      'Express',
      'Socket.IO',
      'REST APIs',
      'JWT',
      'Flyway',
    ].map((name) => ({ name })),
  },
  {
    name: 'Databases & Cloud',
    technologies: ['PostgreSQL', 'Neon', 'AWS', 'Vercel', 'Docker'].map(
      (name) => ({ name }),
    ),
  },
  {
    name: 'Developer Tools',
    technologies: [
      'Git',
      'GitHub',
      'Maven',
      'Postman',
      'VS Code',
      'IntelliJ IDEA',
      'Rider',
      'Onshape',
    ].map((name) => ({ name })),
  },
  {
    name: 'AI & Computer Vision',
    technologies: ['OpenCV', 'MediaPipe', 'Gemini API', 'Twelve Data API'].map(
      (name) => ({ name }),
    ),
  },
]
