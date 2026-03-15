import { Document, Packer, Paragraph, TextRun, BorderStyle, AlignmentType, TabStopType, LevelFormat } from "docx";
import { F, toHalfPt, toDxa } from "../data/formatting";
import type { ResumeData, VariantSection, NestedSection, Bullet } from "../types/resume";

/**
 * Get the active variant content from a variant section.
 * @param section - The variant section.
 * @returns The active variant's content string.
 */
const getVariantContent = (section: VariantSection): string =>
  section.variants.find((v) => v.id === section.activeVariantId)?.content ?? "";

/**
 * Get the active intro content from a work section.
 * @param section - The work section.
 * @returns The intro content, or empty string if no intro.
 */
const getIntroContent = (section: NestedSection): string => {
  if (!section.intro) return "";
  return section.intro.variants.find((v) => v.id === section.intro!.activeVariantId)?.content ?? "";
};

/**
 * Get active bullets in display order (respects DND reordering).
 * @param section - The work section.
 * @returns Array of active bullet objects.
 */
const getActiveBullets = (section: NestedSection): Bullet[] =>
  section.bullets.filter((b) => section.activeBulletIds.includes(b.id));

/**
 * Build a section header paragraph with an underline border.
 * @param title - The section header text (e.g. "SKILLS", "WORK EXPERIENCE").
 * @param spacingBefore - Spacing before the paragraph in twips.
 * @returns A styled Paragraph for the section header.
 */
const buildSectionHeader = (title: string, spacingBefore = 120): Paragraph =>
  new Paragraph({
    spacing: { before: spacingBefore, after: 60 },
    border: {
      bottom: {
        color: F.sectionHeader.borderColor.replace("#", ""),
        space: 1,
        style: BorderStyle.SINGLE,
        size: 6,
      },
    },
    children: [
      new TextRun({
        text: title,
        font: "Calibri",
        bold: F.sectionHeader.bold,
        size: toHalfPt(F.sectionHeader.size),
        color: F.sectionHeader.color.replace("#", ""),
      }),
    ],
  });

/**
 * Build paragraphs for a variant section (e.g. summary or skills).
 * If the section has a sectionHeader, a header paragraph is included.
 * @param section - The variant section.
 * @returns Array of DOCX Paragraphs.
 */
const buildVariantParagraphs = (section: VariantSection): Paragraph[] => {
  const content = getVariantContent(section);
  const paragraphs: Paragraph[] = [];

  if (section.sectionHeader) {
    paragraphs.push(buildSectionHeader(section.sectionHeader));
    paragraphs.push(
      new Paragraph({
        spacing: { before: 60, after: 120 },
        children: [
          new TextRun({
            text: content,
            font: "Calibri",
            size: toHalfPt(F.skills.size),
            color: F.skills.color.replace("#", ""),
          }),
        ],
      })
    );
  } else {
    // Summary-style — no header, just the content
    paragraphs.push(
      new Paragraph({
        spacing: { before: 80, after: 120 },
        children: [
          new TextRun({
            text: content,
            font: "Calibri",
            size: toHalfPt(F.summary.size),
            color: F.summary.color.replace("#", ""),
          }),
        ],
      })
    );
  }

  return paragraphs;
};

/**
 * Build paragraphs for a work experience section.
 * Includes company name, role + dates, optional intro, and active bullets.
 * @param section - The work section.
 * @param isFirst - Whether this is the first work section (affects spacing).
 * @returns Array of DOCX Paragraphs.
 */
const buildNestedParagraphs = (section: NestedSection, isFirst: boolean): Paragraph[] => {
  const introContent = getIntroContent(section);
  const activeBullets = getActiveBullets(section);
  const paragraphs: Paragraph[] = [];

  // Company name
  paragraphs.push(
    new Paragraph({
      spacing: { before: isFirst ? 60 : 180 },
      children: [
        new TextRun({
          text: section.company,
          font: "Calibri",
          bold: F.company.bold,
          size: toHalfPt(F.company.size),
          color: F.company.color.replace("#", ""),
        }),
      ],
    })
  );

  // Role + dates
  paragraphs.push(
    new Paragraph({
      spacing: { before: 20, after: introContent ? 0 : 60 },
      tabStops: [
        {
          type: TabStopType.RIGHT,
          position: toDxa(F.page.widthIn - F.page.marginLeft - F.page.marginRight),
        },
      ],
      children: [
        new TextRun({
          text: section.role,
          font: "Calibri",
          italics: F.role.italic,
          size: toHalfPt(F.role.size),
          color: F.role.color.replace("#", ""),
        }),
        new TextRun({
          text: `\t${section.dates}`,
          font: "Calibri",
          size: toHalfPt(F.dates.size),
          color: F.dates.color.replace("#", ""),
        }),
      ],
    })
  );

  // Optional intro paragraph
  if (introContent) {
    paragraphs.push(
      new Paragraph({
        spacing: { before: 60, after: 60 },
        children: [
          new TextRun({
            text: introContent,
            font: "Calibri",
            size: toHalfPt(F.summary.size),
            color: F.summary.color.replace("#", ""),
          }),
        ],
      })
    );
  }

  // Bullets
  activeBullets.forEach((b) => {
    paragraphs.push(
      new Paragraph({
        spacing: { before: 40 },
        indent: { left: 360, hanging: 180 },
        numbering: { reference: "bullets", level: 0 },
        children: [
          new TextRun({
            text: b.content,
            font: "Calibri",
            size: toHalfPt(F.bullet.size),
            color: F.bullet.color.replace("#", ""),
          }),
        ],
      })
    );
  });

  return paragraphs;
};


/**
 * Generates and downloads a .docx resume file from the current resume state.
 * All sections are rendered dynamically from the data — no hardcoded content.
 *
 * @param data - The complete resume data.
 */
export const exportDocx = async (data: ResumeData): Promise<void> => {
  // Partition sections into fixed layout order: summary/skills → work → education
  const nonEduVariantSections = data.sections.filter(
    (s): s is VariantSection => s.type === "variant" && s.id !== "education"
  );
  const nestedSections = data.sections.filter(
    (s): s is NestedSection => s.type === "nested"
  );
  const educationSection = data.sections.find(
    (s): s is VariantSection => s.type === "variant" && s.id === "education"
  );

  // Build all section paragraphs
  const sectionParagraphs: Paragraph[] = [];

  // Variant sections (summary, skills, etc.) — excluding education
  nonEduVariantSections.forEach((section) => {
    sectionParagraphs.push(...buildVariantParagraphs(section));
  });

  // Nested sections (Work Experience, etc) header + entries
  if (nestedSections.length > 0) {
    sectionParagraphs.push(buildSectionHeader("WORK EXPERIENCE"));
    nestedSections.forEach((section, idx) => {
      sectionParagraphs.push(...buildNestedParagraphs(section, idx === 0));
    });
  }

  // Education (VariantSection with id="education")
  if (educationSection) {
    sectionParagraphs.push(...buildVariantParagraphs(educationSection));
  }

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "\u2022",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 360, hanging: 180 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: toDxa(F.page.marginTop),
              bottom: toDxa(F.page.marginBottom),
              left: toDxa(F.page.marginLeft),
              right: toDxa(F.page.marginRight),
            },
            size: {
              width: toDxa(F.page.widthIn),
              height: toDxa(F.page.heightIn),
            },
          },
        },
        children: [
          // Name
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: data.name,
                font: "Calibri",
                bold: F.name.bold,
                size: toHalfPt(F.name.size),
                color: F.name.color.replace("#", ""),
              }),
            ],
          }),

          // Contact Info
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 40, after: 120 },
            children: [
              new TextRun({
                text: data.contact.email,
                font: "Calibri",
                size: toHalfPt(F.contact.size),
                color: F.contact.sepColor.replace("#", ""),
              }),
              ...data.contact.links.flatMap((link) => [
                new TextRun({
                  text: " | ",
                  font: "Calibri",
                  size: toHalfPt(F.contact.size),
                  color: F.contact.sepColor.replace("#", ""),
                }),
                new TextRun({
                  text: link.alias ?? link.url,
                  font: "Calibri",
                  size: toHalfPt(F.contact.size),
                  color: F.contact.linkColor.replace("#", ""),
                }),
              ]),
            ],
          }),

          // All dynamic sections
          ...sectionParagraphs,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);

  const safeName = data.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  const filename = `${safeName}_resume.docx`;

  // Use File System Access API (native Save-As dialog) — cannot be blocked by Chrome
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await (window as unknown as Record<string, unknown> & {
        showSaveFilePicker: (opts: unknown) => Promise<FileSystemFileHandle>;
      }).showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: 'Word Document',
            accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (err: unknown) {
      // User cancelled the dialog — that's fine
      if (err instanceof Error && err.name === 'AbortError') return;
      console.error('[exportDocx] showSaveFilePicker failed, trying fallback:', err);
    }
  }

  // Fallback: open blob in new tab (user can right-click > Save As)
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
};
