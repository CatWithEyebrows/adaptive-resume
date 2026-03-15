import { z } from "zod"
import type { JSONResumeSchema } from "../../types/json-resume"
import type { ResumeData } from "../../types/resume"
import { generateId } from "./utils"

const MAX_ACTIVE_BULLETS = 4

// Loosely validate the structure to accept most JSON Resumes
export const jsonResumeZodSchema = z.object({
  basics: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    url: z.string().optional(),
    summary: z.string().optional(),
    profiles: z.array(z.object({
      network: z.string().optional(),
      username: z.string().optional(),
      url: z.string().optional()
    })).optional()
  }).optional(),
  work: z.array(z.object({
    name: z.string().optional(),
    position: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    summary: z.string().optional(),
    highlights: z.array(z.string()).optional()
  })).optional(),
  skills: z.array(z.object({
    name: z.string().optional(),
    level: z.string().optional(),
    keywords: z.array(z.string()).optional()
  })).optional(),
  education: z.array(z.object({
    institution: z.string().optional(),
    area: z.string().optional(),
    studyType: z.string().optional(),
    degree: z.string().optional(),
    location: z.string().optional()
  })).optional()
})

export function parseJsonResume(data: unknown): ResumeData {
  // --- ENRICHED JSON AUTO-DETECT ---
  // If the uploaded JSON has sections[], it's our internal enriched format — pass through directly.
  if (data && typeof data === 'object' && 'sections' in data && Array.isArray((data as any).sections)) {
    const rawData = data as any

    if (!rawData.name?.trim() || !rawData.sections.length) {
      throw new Error('Invalid enriched resume: must have a name and at least one section.')
    }

    return {
      name: rawData.name,
      contact: rawData.contact ?? { email: "", links: [] },
      sections: rawData.sections
    }
  }

  // --- STANDARD JSON RESUME → ENRICHED CONVERSION ---
  const parsed = jsonResumeZodSchema.parse(data) as JSONResumeSchema

  const resumeData: ResumeData = {
    name: parsed.basics?.name || "Your Name",
    contact: {
      email: parsed.basics?.email || "",
      links: [
        ...(parsed.basics?.url ? [{ url: parsed.basics.url, alias: "Portfolio" }] : []),
        ...(parsed.basics?.profiles?.map((p: any) => ({
          url: p.url || "",
          alias: p.network || "Link"
        })) || [])
      ]
    },
    sections: []
  }

  // Map Summary
  if (parsed.basics?.summary) {
    const variantId = `summary-${generateId()}`
    resumeData.sections.push({
      type: "variant",
      id: "summary",
      label: "Summary",
      variants: [{ id: variantId, label: "Default Summary", tags: ["default"], content: parsed.basics.summary }],
      activeVariantId: variantId
    })
  }

  // Map Skills
  if (parsed.skills?.length) {
    const variantId = `skills-${generateId()}`
    const skillStrings = parsed.skills.map((skill: any) => {
      const keywords = skill.keywords?.join(", ") || ""
      return skill.name ? `${skill.name}: ${keywords}` : keywords
    }).filter(Boolean).join(" | ")

    resumeData.sections.push({
      type: "variant",
      id: "skills",
      label: "Skills",
      sectionHeader: "SKILLS",
      variants: [{ id: variantId, label: "Default Skills", tags: ["default"], content: skillStrings }],
      activeVariantId: variantId
    })
  }

  // Map Work Experience
  if (parsed.work?.length) {
    parsed.work.forEach((job: any) => {
      const bullets = (job.highlights || []).map((h: string) => ({
        id: `bullet-${generateId()}`,
        label: h.substring(0, 30) + (h.length > 30 ? "..." : ""),
        tags: [],
        content: h
      }))

      const introId = job.summary ? `intro-${generateId()}` : undefined

      resumeData.sections.push({
        type: "nested",
        sectionHeader: "Experience",
        id: `nested-${generateId()}`,
        company: job.name || "Company",
        role: job.position || "Role",
        dates: `${job.startDate || ""} \u2013 ${job.endDate || "Present"}`.trim(),
        intro: introId ? {
          label: "Experience Intro",
          variants: [{ id: introId, label: "Default Intro", tags: ["default"], content: job.summary }],
          activeVariantId: introId
        } : undefined,
        bullets,
        activeBulletIds: bullets.slice(0, MAX_ACTIVE_BULLETS).map((b: any) => b.id)
      })
    })
  }

  // Map Education as a VariantSection (same type as summary/skills)
  if (parsed.education?.[0]) {
    const edu = parsed.education[0]
    const degree = edu.degree || `${edu.studyType || ""} ${edu.area || ""}`.trim()
    const institution = edu.institution || ""
    const location = edu.location || ""
    const parts = [degree, institution, location ? `(${location})` : ""].filter(Boolean)
    const content = parts.join(" \u2014 ")
    const eduId = `edu-${generateId()}`

    resumeData.sections.push({
      type: "variant",
      id: "education",
      label: "Education",
      sectionHeader: "EDUCATION",
      variants: [{ id: eduId, label: degree || "Education", tags: [], content }],
      activeVariantId: eduId
    })
  }

  return resumeData
}
