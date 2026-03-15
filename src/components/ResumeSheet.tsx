import type { ReactElement } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import type { VariantSection, NestedSection } from "@/types/resume";
import { F } from "@/data/formatting";
import { buildSectionGroups } from "./control-panel/sectionGroups";

export function ResumeSheet(): ReactElement | null {
  const { data } = useResumeStore();

  if (!data) return null;

  const { name, contact, sections } = data;

  const summarySection = sections.find(
    (s): s is VariantSection => s.type === "variant" && s.id === "summary"
  );
  const blocks = buildSectionGroups(sections);

  const getVariantContent = (section: VariantSection): string =>
    section.variants.find((v) => v.id === section.activeVariantId)?.content ?? "";

  const getIntroContent = (section: NestedSection): string => {
    if (!section.intro) return "";
    return section.intro.variants.find((v) => v.id === section.intro!.activeVariantId)?.content ?? "";
  };

  const getActiveBullets = (section: NestedSection) =>
    section.bullets.filter((b) => section.activeBulletIds.includes(b.id));

  const tight: React.CSSProperties = { lineHeight: 1.2 };

  const renderSectionHeader = (text: string) => (
    <h2
      className="uppercase font-bold border-b"
      style={{
        fontSize: `${F.sectionHeader.size}pt`,
        color: F.sectionHeader.color,
        borderColor: F.sectionHeader.borderColor,
        borderBottomWidth: "1px",
        paddingBottom: "1px",
        ...tight,
      }}
    >
      {text}
    </h2>
  );

  const renderVariantBlock = (section: VariantSection) => (
    <div key={section.id} style={{ marginTop: "10px" }}>
      {renderSectionHeader(section.sectionHeader ?? section.label)}
      <div style={{ fontSize: `${F.skills.size}pt`, marginTop: "3px", ...tight }}>
        {getVariantContent(section)}
      </div>
    </div>
  );

  const renderNestedGroup = (nestedSections: NestedSection[], header?: string) => (
    <div key={nestedSections[0]?.id || "nested-group"} style={{ marginTop: "10px" }}>
      {renderSectionHeader(header || "Work Experience")}
      {nestedSections.map((section, idx) => {
        const introContent = getIntroContent(section);
        const activeBullets = getActiveBullets(section);

        return (
          <div key={section.id} style={{ marginTop: idx === 0 ? "4px" : "8px" }}>
            <div className="flex justify-between items-baseline">
              <h3
                style={{ fontSize: `${F.company.size}pt`, color: F.company.color, ...tight }}
                className="font-bold"
              >
                {section.company}
              </h3>
            </div>

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

            {introContent && (
              <div style={{ fontSize: `${F.summary.size}pt`, marginTop: "2px", ...tight }}>
                {introContent}
              </div>
            )}

            {activeBullets.length > 0 && (
              <ul
                className="list-outside list-disc"
                style={{
                  fontSize: `${F.bullet.size}pt`,
                  marginTop: "6px",
                  marginLeft: "18px",
                  ...tight,
                }}
              >
                {activeBullets.map((b) => (
                  <li key={b.id} style={{ paddingLeft: "2px", marginTop: "4px" }}>
                    {b.content}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );

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
        style={{ fontSize: `${F.contact.size}pt`, color: F.contact.sepColor, marginTop: "2px" }}
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

      {/* Summary (pinned) */}
      {summarySection && (
        <div style={{ fontSize: `${F.summary.size}pt`, marginTop: "6px", ...tight }}>
          {getVariantContent(summarySection)}
        </div>
      )}

      {/* Remaining sections in array order */}
      {blocks.map((block) =>
        block.kind === "variant"
          ? renderVariantBlock(block.section)
          : renderNestedGroup(block.sections, block.header)
      )}
    </div>
  );
}
