/**
 * Root resume data structure.
 * Contains personal info and an ordered array of sections.
 * Education, summary, and skills are all VariantSections inside sections[].
 */
export interface ResumeData {
  name: string;
  contact: ContactInfo;
  sections: Section[];
}

/**
 * Discriminated union for resume sections.
 * - "variant": A section with swappable content variants (e.g. summary, skills).
 * - "nested": A section with a title (company/institution), subtitle (role/degree), optional intro, and bullets.
 */
export type Section = VariantSection | NestedSection;

/**
 * A section whose content is selected from a list of mutually exclusive variants.
 * Used for summary, skills, or any other single-choice content block.
 *
 * @param type - Discriminator, always "variant".
 * @param id - Unique identifier for this section.
 * @param label - Display name shown in the ControlPanel heading.
 * @param sectionHeader - Optional override for the resume section header (e.g. "SKILLS").
 * @param variants - The available content variants.
 * @param activeVariantId - The currently selected variant ID.
 */
export interface VariantSection {
  type: "variant";
  id: string;
  label: string;
  sectionHeader?: string;
  variants: Variant[];
  activeVariantId: string;
}

/**
 * A generalized multi-item nested section (e.g., Work Experience, Education, Projects).
 * Contains title metadata (mapped to company/role for backward compatibility), optional intro variants, and bullets.
 *
 * @param type - Discriminator, always "nested" (previously "work").
 * @param id - Unique identifier for this section.
 * @param sectionHeader - Optional overarching group header (e.g. "EDUCATION", "EXPERIENCE"). Adjacent nested sections with the same header are grouped together in the Control Panel.
 * @param company - Primary title displayed on the resume (e.g. "Acme Corp", "State University", "Personal Portfolio").
 * @param role - Subtitle (e.g. "Senior Implementation Consultant", "B.S. Computer Science").
 * @param dates - Date range string (e.g. "September 2024 – Present").
 * @param intro - Optional intro paragraph with swappable variants.
 * @param bullets - Pool of available bullet points for this entry.
 * @param activeBulletIds - IDs of currently active (checked) bullets.
 */
export interface NestedSection {
  type: "nested"; // generic concept of section with bullets
  id: string;
  sectionHeader?: string;
  company: string; // Used generically as "Title"
  role: string;    // Used generically as "Subtitle"
  dates: string;
  intro?: {
    label: string;
    variants: Variant[];
    activeVariantId: string;
  };
  bullets: Bullet[];
  activeBulletIds: string[];
}

/**
 * A content variant for slot/intro selectors.
 *
 * @param id - Unique variant identifier.
 * @param label - Short label shown in the radio selector.
 * @param tags - Tags for filtering/highlighting.
 * @param content - The full text content of this variant.
 */
export interface Variant {
  id: string;
  label: string;
  tags: string[];
  content: string;
}

/**
 * A bullet point within a work experience section.
 *
 * @param id - Unique bullet identifier.
 * @param label - Short label shown in the checkbox selector.
 * @param tags - Tags for filtering/highlighting.
 * @param content - The full text content of this bullet.
 * @param variants - Optional sub-variants of this bullet (not yet used).
 */
export interface Bullet {
  id: string;
  label: string;
  tags: string[];
  content: string;
  variants?: Variant[];
}

/**
 * Contact information displayed in the resume header.
 * @param email - Email address (plain text, no link).
 * @param links - Array of contact links with optional display aliases.
 */
export interface ContactInfo {
  email: string;
  links: ContactLink[];
}

/**
 * A contact link with an optional display alias.
 * If alias is provided, the alias is shown as clickable text.
 * If alias is omitted, the full URL is shown.
 *
 * @param url - Full URL (e.g. "github.com/username").
 * @param alias - Optional display text (e.g. "GitHub").
 */
export interface ContactLink {
  url: string;
  alias?: string;
}

