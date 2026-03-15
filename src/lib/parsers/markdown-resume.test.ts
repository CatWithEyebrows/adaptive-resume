import { describe, it, expect } from "vitest"
import { parseMarkdownResume } from "./markdown-resume"
import type { VariantSection, NestedSection } from "../../types/resume"

describe("parseMarkdownResume — simple / backwards-compat format", () => {
  it("should parse simple markdown correctly", () => {
    const markdown = `
# Jane Doe
Email: jane.doe@example.com
Links: [GitHub](github.com/janedoe), LinkedIn (linkedin.com/in/janedoe)

## Summary
Experienced software engineer.

## Skills
JavaScript, TypeScript, React

## Experience
### TECH CORP (January 2020 - Present)
Senior Software Engineer
Led the backend team.
- Architected microservices.
- Optimized database.

## Education
B.S. Computer Science - University of Tech
`
    const result = parseMarkdownResume(markdown)

    expect(result.name).toBe("Jane Doe")
    expect(result.contact.email).toBe("jane.doe@example.com")
    expect(result.contact.links.length).toBe(2)
    expect(result.contact.links[0]).toEqual({ alias: "GitHub", url: "github.com/janedoe" })

    const summary = result.sections.find(s => s.id === "summary") as VariantSection
    expect(summary?.type).toBe("variant")

    const skills = result.sections.find(s => s.id === "skills") as VariantSection
    expect(skills?.type).toBe("variant")

    const work = result.sections.find(s => s.type === "nested") as NestedSection
    expect(work.company).toBe("TECH CORP")
    expect(work.dates).toBe("January 2020 - Present")
    expect(work.role).toBe("Senior Software Engineer")
    expect(work.intro).toBeDefined()
    expect(work.bullets.length).toBe(2)
    // Simple bullets → all active
    expect(work.activeBulletIds.length).toBe(2)

    // Education → VariantSection with id="education"
    const edu = result.sections.find(s => s.id === "education") as VariantSection
    expect(edu?.type).toBe("variant")
    expect(edu?.sectionHeader).toBe("EDUCATION")
    expect(edu?.variants[0].content).toContain("B.S. Computer Science")
  })

  it("should handle missing optional dates gracefully", () => {
    const markdown = `
# Dev Person
Email: dev@test.com

## Experience
### STARTUP CO
Lead Developer
Just doing my thing
- Built feature A
`
    const result = parseMarkdownResume(markdown)
    const work = result.sections.find(s => s.type === "nested") as NestedSection
    expect(work.company).toBe("STARTUP CO")
    expect(work.dates).toBe("")
    expect(work.bullets.length).toBe(1)
  })
})

describe("parseMarkdownResume — enriched format", () => {
  it("should parse enriched variant sections with {active} markers", () => {
    const markdown = `
# John Doe
Email: john@doe.com

## Summary

### [Staff Engineer] {active}
Staff engineer summary content.

### [Engineering Manager]
Manager summary content.

## Skills

### [Full Stack] {active}
TypeScript, React | Node.js, Python

## Education

### [B.S. CS] {active}
B.S. in Computer Science — State University (San Francisco, CA)
`
    const result = parseMarkdownResume(markdown)

    const summary = result.sections.find(s => s.id === "summary") as VariantSection
    expect(summary.variants.length).toBe(2)
    expect(summary.variants[0].label).toBe("Staff Engineer")
    expect(summary.variants[0].content).toBe("Staff engineer summary content.")
    expect(summary.variants[1].label).toBe("Engineering Manager")
    expect(summary.activeVariantId).toBe(summary.variants[0].id)

    const skills = result.sections.find(s => s.id === "skills") as VariantSection
    expect(skills.variants.length).toBe(1)
    expect(skills.activeVariantId).toBe(skills.variants[0].id)

    const edu = result.sections.find(s => s.id === "education") as VariantSection
    expect(edu.type).toBe("variant")
    expect(edu.sectionHeader).toBe("EDUCATION")
    expect(edu.variants[0].content).toContain("B.S. in Computer Science")
  })

  it("should parse enriched work sections with intro variants and checkbox bullets", () => {
    const markdown = `
# Test User
Email: test@user.com

## Experience

### ACME CORP (Jan 2020 – Present)
Senior Engineer

#### intro: [Technical Focus] {active}
Led architecture decisions.

#### intro: [Leadership Focus]
Managed a team of 8.

- [x] Built the payments system.
- [x] Optimized database queries.
- [ ] Wrote internal documentation (omitted).
`
    const result = parseMarkdownResume(markdown)
    const work = result.sections.find(s => s.type === "nested") as NestedSection

    expect(work.company).toBe("ACME CORP")
    expect(work.role).toBe("Senior Engineer")
    expect(work.intro?.variants.length).toBe(2)
    expect(work.intro?.variants[0].label).toBe("Technical Focus")
    expect(work.intro?.activeVariantId).toBe(work.intro?.variants[0].id)

    expect(work.bullets.length).toBe(3)
    expect(work.activeBulletIds.length).toBe(2)
    expect(work.activeBulletIds).not.toContain(work.bullets[2].id)
  })

  it("should default activeVariantId to first variant when none is {active}", () => {
    const markdown = `
# No Active
Email: na@test.com

## Summary

### [Option A]
Content A.

### [Option B]
Content B.
`
    const result = parseMarkdownResume(markdown)
    const summary = result.sections.find(s => s.id === "summary") as VariantSection
    expect(summary.variants.length).toBe(2)
    expect(summary.activeVariantId).toBe(summary.variants[0].id)
  })

  it("should throw if # Name is missing", () => {
    expect(() => parseMarkdownResume("## Summary\nSome content")).toThrow("must include a # Name")
  })

  it("should throw if no sections are present", () => {
    expect(() => parseMarkdownResume("# Someone\nEmail: a@b.com")).toThrow("at least one ## section")
  })
})
