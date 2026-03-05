import { describe, it, expect } from "vitest"
import { parseJsonResume } from "./json-resume"
import type { VariantSection, WorkSection } from "../../types/resume"

describe("parseJsonResume", () => {
  it("should parse a standard JSON resume into enriched format", () => {
    const jsonInput = {
      basics: {
        name: "John Smith",
        email: "john@smith.com",
        url: "johnsmith.com",
        summary: "I build things.",
        profiles: [{ network: "Twitter", url: "twitter.com/john" }]
      },
      work: [{
        name: "Acme Corp",
        position: "Developer",
        startDate: "2021",
        endDate: "2023",
        summary: "General coding",
        highlights: ["Did X", "Done Y"]
      }],
      skills: [{
        name: "Frontend",
        keywords: ["HTML", "CSS"]
      }],
      education: [{
        studyType: "B.S.",
        area: "Computer Science",
        institution: "State University",
        location: "San Francisco, CA"
      }]
    }

    const result = parseJsonResume(jsonInput)

    expect(result.name).toBe("John Smith")
    expect(result.contact.email).toBe("john@smith.com")
    expect(result.contact.links.length).toBe(2) // Portfolio + Twitter

    // Summary → VariantSection
    const summary = result.sections.find(s => s.id === "summary") as VariantSection
    expect(summary?.type).toBe("variant")
    expect(summary?.variants[0].content).toBe("I build things.")

    // Skills → VariantSection
    const skills = result.sections.find(s => s.id === "skills") as VariantSection
    expect(skills?.type).toBe("variant")

    // Work → WorkSection
    const work = result.sections.find(s => s.type === "work") as WorkSection
    expect(work.company).toBe("Acme Corp")
    expect(work.dates).toBe("2021 \u2013 2023")
    expect(work.bullets.length).toBe(2)
    // Smart limit: all 2 bullets active (< 4)
    expect(work.activeBulletIds.length).toBe(2)
    // Intro bug fixed: activeVariantId matches the variant id
    expect(work.intro?.activeVariantId).toBe(work.intro?.variants[0].id)

    // Education → VariantSection with id="education"
    const edu = result.sections.find(s => s.id === "education") as VariantSection
    expect(edu?.type).toBe("variant")
    expect(edu?.sectionHeader).toBe("EDUCATION")
    expect(edu?.variants[0].content).toContain("B.S.")
    expect(edu?.variants[0].content).toContain("State University")
    expect(edu?.variants[0].content).toContain("San Francisco")
  })

  it("should apply smart bullet limit (max 4 active) on standard conversion", () => {
    const result = parseJsonResume({
      basics: { name: "Test" },
      work: [{
        name: "BigCo",
        position: "Eng",
        highlights: ["B1", "B2", "B3", "B4", "B5", "B6"]
      }]
    })

    const work = result.sections.find(s => s.type === "work") as WorkSection
    expect(work.bullets.length).toBe(6)
    expect(work.activeBulletIds.length).toBe(4)
    expect(work.activeBulletIds).toEqual(work.bullets.slice(0, 4).map(b => b.id))
  })

  it("should handle missing data gracefully", () => {
    const result = parseJsonResume({})

    expect(result.name).toBe("Your Name")
    expect(result.contact.email).toBe("")
    expect(result.sections.length).toBe(0)
  })

  it("should not create empty sections if standard json arrays are empty", () => {
    const result = parseJsonResume({
      basics: { name: "Test User" },
      work: [],
      skills: [],
      education: []
    })

    expect(result.sections.length).toBe(0)
  })

  it("should pass through an enriched JSON resume directly", () => {
    const enrichedInput = {
      name: "Enriched User",
      contact: { email: "enriched@test.com", links: [] },
      sections: [
        {
          type: "variant",
          id: "summary",
          label: "Summary",
          variants: [{ id: "v1", label: "Default", tags: [], content: "I have variants" }],
          activeVariantId: "v1"
        },
        {
          type: "work",
          id: "test-work",
          company: "Test Co",
          role: "Tester",
          dates: "2020 \u2013 Present",
          bullets: [{ id: "b1", label: "Fixed bugs", tags: [], content: "Fixed all the bugs." }],
          activeBulletIds: ["b1"]
        },
        {
          type: "variant",
          id: "education",
          label: "Education",
          sectionHeader: "EDUCATION",
          variants: [{ id: "edu1", label: "B.S.", tags: [], content: "B.S. Testing \u2014 Test U (Test City)" }],
          activeVariantId: "edu1"
        }
      ]
    }

    const result = parseJsonResume(enrichedInput)

    expect(result.name).toBe("Enriched User")
    expect(result.contact.email).toBe("enriched@test.com")
    expect(result.sections.length).toBe(3)

    const summary = result.sections[0] as VariantSection
    expect(summary.variants[0].content).toBe("I have variants")

    const work = result.sections[1] as WorkSection
    expect(work.company).toBe("Test Co")
    expect(work.bullets.length).toBe(1)

    const edu = result.sections[2] as VariantSection
    expect(edu.id).toBe("education")
    expect(edu.variants[0].content).toContain("B.S. Testing")
  })

  it("should throw if enriched JSON is missing a name", () => {
    expect(() => parseJsonResume({
      name: "",
      contact: { email: "", links: [] },
      sections: [{ type: "variant", id: "summary", label: "Summary", variants: [], activeVariantId: "" }]
    })).toThrow("Invalid enriched resume")
  })

  it("should throw if enriched JSON has empty sections", () => {
    expect(() => parseJsonResume({
      name: "Someone",
      contact: { email: "", links: [] },
      sections: []
    })).toThrow("Invalid enriched resume")
  })
})
