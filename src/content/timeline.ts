export interface TimelineEntry {
  id: string
  kind: 'education' | 'experience'
  title: string
  organization: string
  startDate: string
  endDate?: string
  summary: string
}
// TODO: Add only owner-verified entries and dates from the current resume.
// Student Works Canada Production Manager belongs to someone else; exclude it.
export const timeline: TimelineEntry[] = []
