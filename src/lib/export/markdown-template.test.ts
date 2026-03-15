import { describe, it, expect } from "vitest"
import { generateMarkdownFromResume } from "./markdown-template"
import { parseMarkdownResume } from "../parsers/markdown-resume"
import type { ResumeData, VariantSection, NestedSection } from "../../types/resume"

const sampleData: ResumeData = {
  name: "JANE DOE",
  contact: {
    email: "jane@doe.com",
    links: [
      { url: "github.com/janedoe", alias: "GitHub" },
      { url: "linkedin.com/in/janedoe", alias: "LinkedIn" }
    ]
  },
  sections: [
    {
      type: "variant",
      id: "summary",
      label: "Summary",
      variants: [
        { id: "sum-1", label: "Frontend", tags: [], content: "Frontend engineer summary." },
        { id: "sum-2", label: "Fullstack", tags: [], content: "Fullstack engineer summary." }
      ],
      activeVariantId: "sum-1"
    },
    {
      type: "variant",
      id: "skills",
      label: "Skills",
      sectionHeader: "SKILLS",
      variants: [
        { id: "sk-1", label: "Default", tags: [], content: "TypeScript, React | Node.js" }
      ],
      activeVariantId: "sk-1"
    },
    {
      type: "nested",
      sectionHeader: "Experience",
      id: "work-1",
      company: "ACME CORP",
      role: "Senior Engineer",
      dates: "Jan 2020 \u2013 Present",
      intro: {
        label: "Acme Intro",
        variants: [
          { id: "intro-1", label: "Technical", tags: [], content: "Led architecture." },
          { id: "intro-2", label: "Leadership", tags: [], content: "Managed a team." }
        ],
        activeVariantId: "intro-1"
      },
      bullets: [
        { id: "b1", label: "Bullet 1", tags: [], content: "Built the payments engine." },
        { id: "b2", label: "Bullet 2", tags: [], content: "Optimized database queries." },
        { id: "b3", label: "Bullet 3", tags: [], content: "Wrote documentation." }
      ],
      activeBulletIds: ["b1", "b2"]
    },
    {
      type: "variant",
      id: "education",
      label: "Education",
      sectionHeader: "EDUCATION",
      variants: [
        { id: "edu-1", label: "B.S. CS", tags: [], content: "B.S. in Computer Science \u2014 State University (SF, CA)" }
      ],
      activeVariantId: "edu-1"
    }
  ]
}

describe("generateMarkdownFromResume", () => {
  it("should emit the correct header block", () => {
    const md = generateMarkdownFromResume(sampleData)
    expect(md).toContain("# JANE DOE")
    expect(md).toContain("Email: jane@doe.com")
    expect(md).toContain("[GitHub](github.com/janedoe)")
    expect(md).toContain("[LinkedIn](linkedin.com/in/janedoe)")
  })

  it("should emit named variant headers with {active} on the active variant", () => {
    const md = generateMarkdownFromResume(sampleData)
    expect(md).toContain("### [Frontend] {active}")
    expect(md).toContain("### [Fullstack]")
    expect(md).not.toContain("### [Fullstack] {active}")
  })

  it("should emit the Experience header before the first work section", () => {
    const md = generateMarkdownFromResume(sampleData)
    expect(md).toContain("## Experience")
    expect(md).toContain("### ACME CORP (Jan 2020 \u2013 Present)")
    expect(md).toContain("Senior Engineer")
  })

  it("should emit intro variants with {active} marker", () => {
    const md = generateMarkdownFromResume(sampleData)
    expect(md).toContain("#### intro: [Technical] {active}")
    expect(md).toContain("#### intro: [Leadership]")
  })

  it("should emit [x] for active bullets and [ ] for inactive", () => {
    const md = generateMarkdownFromResume(sampleData)
    expect(md).toContain("- [x] Built the payments engine.")
    expect(md).toContain("- [x] Optimized database queries.")
    expect(md).toContain("- [ ] Wrote documentation.")
  })

  it("should emit education as a variant section after experience", () => {
    const md = generateMarkdownFromResume(sampleData)
    expect(md).toContain("## Education")
    expect(md).toContain("### [B.S. CS] {active}")
    expect(md).toContain("B.S. in Computer Science")
    // Education must appear after experience in the output
    const expIdx = md.indexOf("## Experience")
    const eduIdx = md.indexOf("## Education")
    expect(eduIdx).toBeGreaterThan(expIdx)
  })
})

describe("round-trip: enriched JSON → markdown → enriched JSON", () => {
  it("should produce equivalent ResumeData after a round-trip", () => {
    const md = generateMarkdownFromResume(sampleData)
    const roundTripped = parseMarkdownResume(md)

    // Name and contact
    expect(roundTripped.name).toBe(sampleData.name)
    expect(roundTripped.contact.email).toBe(sampleData.contact.email)
    expect(roundTripped.contact.links.length).toBe(sampleData.contact.links.length)

    // Summary: 2 variants, correct active
    const origSummary = sampleData.sections[0] as VariantSection
    const rtSummary = roundTripped.sections.find(s => s.id === "summary") as VariantSection
    expect(rtSummary.variants.length).toBe(origSummary.variants.length)
    expect(rtSummary.variants[0].label).toBe(origSummary.variants[0].label)
    expect(rtSummary.variants[0].content).toBe(origSummary.variants[0].content)
    expect(rtSummary.variants[1].label).toBe(origSummary.variants[1].label)
    // Active variant is index 0
    expect(rtSummary.activeVariantId).toBe(rtSummary.variants[0].id)

    // Work: bullets and active state preserved
    const origWork = sampleData.sections[2] as NestedSection
    const rtWork = roundTripped.sections.find(s => s.type === "nested") as NestedSection
    expect(rtWork.company).toBe(origWork.company)
    expect(rtWork.role).toBe(origWork.role)
    expect(rtWork.bullets.length).toBe(origWork.bullets.length)
    expect(rtWork.activeBulletIds.length).toBe(origWork.activeBulletIds.length)
    // First two bullets active, third inactive
    expect(rtWork.activeBulletIds).toContain(rtWork.bullets[0].id)
    expect(rtWork.activeBulletIds).toContain(rtWork.bullets[1].id)
    expect(rtWork.activeBulletIds).not.toContain(rtWork.bullets[2].id)

    // Intro variants preserved
    expect(rtWork.intro?.variants.length).toBe(origWork.intro?.variants.length)
    expect(rtWork.intro?.variants[0].label).toBe(origWork.intro?.variants[0].label)
    expect(rtWork.intro?.activeVariantId).toBe(rtWork.intro?.variants[0].id)

    // Education as VariantSection
    const rtEdu = roundTripped.sections.find(s => s.id === "education") as VariantSection
    expect(rtEdu.type).toBe("variant")
    expect(rtEdu.sectionHeader).toBe("EDUCATION")
    expect(rtEdu.variants[0].content).toContain("B.S. in Computer Science")
  })
})
