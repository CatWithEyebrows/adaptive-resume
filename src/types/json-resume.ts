export interface JSONResumeSchema {
  basics?: {
    name?: string
    email?: string
    url?: string
    summary?: string
    profiles?: Array<{
      network?: string
      username?: string
      url?: string
    }>
  }
  work?: Array<{
    name?: string
    position?: string
    startDate?: string
    endDate?: string
    summary?: string
    highlights?: string[]
  }>
  skills?: Array<{
    name?: string
    level?: string
    keywords?: string[]
  }>
  education?: Array<{
    institution?: string
    area?: string
    studyType?: string
    degree?: string
    location?: string
  }>
}
