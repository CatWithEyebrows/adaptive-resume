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
 * - "work": A work experience entry with company info, optional intro, and bullets.
 */
export type Section = VariantSection | WorkSection;

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
 * A work experience section with company metadata, optional intro variants, and bullets.
 *
 * @param type - Discriminator, always "work".
 * @param id - Unique identifier for this section.
 * @param company - Company name displayed on the resume (e.g. "Acme Corp — Engineering Team").
 * @param role - Job title (e.g. "Senior Implementation Consultant").
 * @param dates - Date range string (e.g. "September 2024 – Present").
 * @param intro - Optional intro paragraph with swappable variants.
 * @param bullets - Pool of available bullet points for this role.
 * @param activeBulletIds - IDs of currently active (checked) bullets.
 */
export interface WorkSection {
  type: "work";
  id: string;
  company: string;
  role: string;
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

