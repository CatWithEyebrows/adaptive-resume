import type { ResumeData, VariantSection, WorkSection } from "../../types/resume"

/**
 * Serializes enriched ResumeData to the enriched Markdown template format.
 * The output maps 1:1 back to enriched JSON when parsed by parseMarkdownResume().
 *
 * Format:
 *   # NAME
 *   Email: ...
 *   Links: [Alias](url), ...
 *
 *   ## SectionLabel
 *   ### [Variant Label] {active}
 *   Content...
 *
 *   ## Experience
 *   ### COMPANY (Dates)
 *   Role
 *   #### intro: [Label] {active}
 *   Content...
 *   - [x] Active bullet
 *   - [ ] Inactive bullet
 */
export function generateMarkdownFromResume(data: ResumeData): string {
  const lines: string[] = []

  // Header
  lines.push(`# ${data.name}`)
  lines.push(`Email: ${data.contact.email}`)
  if (data.contact.links.length > 0) {
    const linksStr = data.contact.links
      .map(l => `[${l.alias || l.url}](${l.url})`)
      .join(", ")
    lines.push(`Links: ${linksStr}`)
  }
  lines.push("")

  let experienceHeaderEmitted = false

  for (const section of data.sections) {
    if (section.type === "variant") {
      const s = section as VariantSection
      lines.push(`## ${s.label}`)
      lines.push("")
      for (const variant of s.variants) {
        const active = variant.id === s.activeVariantId ? " {active}" : ""
        lines.push(`### [${variant.label}]${active}`)
        lines.push(variant.content)
        lines.push("")
      }
    } else if (section.type === "work") {
      if (!experienceHeaderEmitted) {
        lines.push("## Experience")
        lines.push("")
        experienceHeaderEmitted = true
      }
      const w = section as WorkSection
      const datesStr = w.dates ? ` (${w.dates})` : ""
      lines.push(`### ${w.company}${datesStr}`)
      lines.push(w.role)
      lines.push("")

      if (w.intro && w.intro.variants.length > 0) {
        for (const variant of w.intro.variants) {
          const active = variant.id === w.intro.activeVariantId ? " {active}" : ""
          lines.push(`#### intro: [${variant.label}]${active}`)
          lines.push(variant.content)
          lines.push("")
        }
      }

      for (const bullet of w.bullets) {
        const isActive = w.activeBulletIds.includes(bullet.id)
        lines.push(`- ${isActive ? "[x]" : "[ ]"} ${bullet.content}`)
      }
      lines.push("")
    }
  }

  return lines.join("\n")
}
