import type { ReactElement } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import type { VariantSection, WorkSection } from "@/types/resume";
import { F } from "@/data/formatting";

/**
 * ResumeSheet renders the live resume preview as a US Letter–sized page.
 * All sections are rendered dynamically from the sections array —
 * no hardcoded company names or slot keys.
 *
 * Spacing is calibrated to match a tightly-packed single-page resume PDF.
 *
 * @returns The rendered resume page element.
 */
export function ResumeSheet(): ReactElement | null {
  const { data } = useResumeStore();

  if (!data) return null;

  const { name, contact, sections } = data;

  // Partition sections into their fixed layout slots
  const summarySection = sections.find((s): s is VariantSection => s.type === "variant" && s.id === "summary");
  const headerSections = sections.filter((s): s is VariantSection => s.type === "variant" && !!s.sectionHeader && s.id !== "education");
  const workSections = sections.filter((s): s is WorkSection => s.type === "work");
  const educationSection = sections.find((s): s is VariantSection => s.type === "variant" && s.id === "education");

  /**
   * Get the active content for a variant section.
   * @param section - The variant section.
   * @returns The active variant's content string.
   */
  const getVariantContent = (section: VariantSection): string =>
    section.variants.find((v) => v.id === section.activeVariantId)?.content ?? "";

  /**
   * Get the active intro content for a work section.
   * @param section - The work section.
   * @returns The active intro variant's content, or empty string.
   */
  const getIntroContent = (section: WorkSection): string => {
    if (!section.intro) return "";
    return section.intro.variants.find((v) => v.id === section.intro!.activeVariantId)?.content ?? "";
  };

  /**
   * Get active bullets in display order (respects DND reordering).
   * @param section - The work section.
   * @returns Array of active bullet objects.
   */
  const getActiveBullets = (section: WorkSection) =>
    section.bullets.filter((b) => section.activeBulletIds.includes(b.id));

  /** Shared line-height to match the reference PDF density. */
  const tight: React.CSSProperties = { lineHeight: 1.2 };

  return (
    <div
      className="bg-white mx-auto"
      style={{
        width: `${F.page.widthIn * 96}px`,
        minHeight: `${F.page.heightIn * 96}px`,
        paddingTop: `${F.page.marginTop * 96}px`,
        paddingBottom: `${F.page.marginBottom * 96}px`,
        paddingLeft: `${F.page.marginLeft * 96}px`,
        paddingRight: `${F.page.marginRight * 96}px`,
        fontFamily: F.font,
        color: F.summary.color,
        lineHeight: 1.2,
      }}
    >
      {/* Name */}
      <h1
        className="text-center font-bold"
        style={{ fontSize: `${F.name.size}pt`, color: F.name.color, ...tight }}
      >
        {name}
      </h1>

      {/* Contact */}
      <div
        className="text-center"
        style={{ fontSize: `${F.contact.size}pt`, color: F.contact.sepColor, marginTop: '2px' }}
      >
        {contact.email}
        {contact.links.map((link) => (
          <span key={link.url}>
            {" | "}
            <a href={`https://${link.url}`} style={{ color: F.contact.linkColor }}>
              {link.alias ?? link.url}
            </a>
          </span>
        ))}
      </div>

      {/* Summary (variant section without a header) */}
      {summarySection && (
        <div
          style={{ fontSize: `${F.summary.size}pt`, marginTop: '6px', ...tight }}
        >
          {getVariantContent(summarySection)}
        </div>
      )}

      {/* Other variant sections with section headers (e.g. Skills) */}
      {headerSections.map((section) => (
        <div key={section.id} style={{ marginTop: '10px' }}>
          <h2
            className="uppercase font-bold border-b"
            style={{
              fontSize: `${F.sectionHeader.size}pt`,
              color: F.sectionHeader.color,
              borderColor: F.sectionHeader.borderColor,
              borderBottomWidth: '1px',
              paddingBottom: '1px',
              ...tight,
            }}
          >
            {section.sectionHeader}
          </h2>
          <div style={{ fontSize: `${F.skills.size}pt`, marginTop: '3px', ...tight }}>
            {getVariantContent(section)}
          </div>
        </div>
      ))}

      {/* Work Experience */}
      {workSections.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <h2
            className="uppercase font-bold border-b"
            style={{
              fontSize: `${F.sectionHeader.size}pt`,
              color: F.sectionHeader.color,
              borderColor: F.sectionHeader.borderColor,
              borderBottomWidth: '1px',
              paddingBottom: '1px',
              ...tight,
            }}
          >
            Work Experience
          </h2>

          {workSections.map((section, idx) => {
            const introContent = getIntroContent(section);
            const activeBullets = getActiveBullets(section);

            return (
              <div key={section.id} style={{ marginTop: idx === 0 ? '4px' : '8px' }}>
                {/* Company name */}
                <div className="flex justify-between items-baseline">
                  <h3
                    style={{ fontSize: `${F.company.size}pt`, color: F.company.color, ...tight }}
                    className="font-bold"
                  >
                    {section.company}
                  </h3>
                </div>

                {/* Role + dates */}
                <div className="flex justify-between items-baseline">
                  <h4
                    style={{ fontSize: `${F.role.size}pt`, color: F.role.color, ...tight }}
                    className="italic"
                  >
                    {section.role}
                  </h4>
                  <span
                    className="whitespace-nowrap"
                    style={{ fontSize: `${F.dates.size}pt`, color: F.dates.color, ...tight }}
                  >
                    {section.dates}
                  </span>
                </div>

                {/* Optional intro paragraph */}
                {introContent && (
                  <div
                    style={{ fontSize: `${F.summary.size}pt`, marginTop: '2px', ...tight }}
                  >
                    {introContent}
                  </div>
                )}

                {/* Bullets */}
                {activeBullets.length > 0 && (
                  <ul
                    className="list-outside list-disc"
                    style={{
                      fontSize: `${F.bullet.size}pt`,
                      marginTop: '6px',
                      marginLeft: '18px',
                      ...tight,
                    }}
                  >
                    {activeBullets.map((b) => (
                      <li key={b.id} style={{ paddingLeft: '2px', marginTop: '4px' }}>
                        {b.content}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Education (VariantSection with id="education") */}
      {educationSection && (
        <div style={{ marginTop: '10px' }}>
          <h2
            className="uppercase font-bold border-b"
            style={{
              fontSize: `${F.sectionHeader.size}pt`,
              color: F.sectionHeader.color,
              borderColor: F.sectionHeader.borderColor,
              borderBottomWidth: '1px',
              paddingBottom: '1px',
              ...tight,
            }}
          >
            {educationSection.sectionHeader ?? "Education"}
          </h2>
          <div style={{ fontSize: `${F.education.size}pt`, marginTop: '3px', ...tight }}>
            {getVariantContent(educationSection)}
          </div>
        </div>
      )}
    </div>
  );
}
