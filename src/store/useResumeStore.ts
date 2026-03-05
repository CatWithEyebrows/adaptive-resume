import { create } from 'zustand';
import type { ResumeData, Section, VariantSection, WorkSection } from '../types/resume';

/**
 * Zustand store for resume state management.
 * Manages loading, section-based variant/bullet actions, and tag highlighting.
 */
interface ResumeStore {
  data: ResumeData | null;
  isMockData: boolean;
  isLoading: boolean;
  error: string | null;

  /** Fetch and initialize resume data from the JSON file. */
  init: () => Promise<void>;

  /** Import an entirely new parsed resume into the store. */
  importResume: (data: ResumeData) => void;

  /**
   * Set the active variant for a variant section or a work section's intro.
   * @param sectionId - The section ID to target.
   * @param variantId - The variant ID to activate.
   * @param isIntro - If true, targets the intro sub-slot of a work section.
   */
  setActiveVariant: (sectionId: string, variantId: string, isIntro?: boolean) => void;

  /**
   * Toggle a bullet's active state in a work section.
   * @param sectionId - The work section ID.
   * @param bulletId - The bullet ID to toggle.
   */
  toggleBullet: (sectionId: string, bulletId: string) => void;

  /**
   * Reorder all bullets in a work section.
   * @param sectionId - The work section ID.
   * @param bulletIds - The new ordered list of ALL bullet IDs.
   */
  reorderAllBullets: (sectionId: string, bulletIds: string[]) => void;

  /** Currently highlighted tags for filtering. */
  highlightedTags: string[];

  /** Toggle a tag in the highlighted tags list. */
  toggleTag: (tag: string) => void;
}

/**
 * Helper to update a specific section in the sections array by ID.
 * Returns a new sections array with the matched section replaced.
 *
 * @param sections - The current sections array.
 * @param sectionId - The ID of the section to update.
 * @param updater - Function that receives the found section and returns the updated version.
 * @returns A new sections array with the updated section.
 */
const updateSection = (
  sections: Section[],
  sectionId: string,
  updater: (section: Section) => Section
): Section[] =>
  sections.map((s) => (s.id === sectionId ? updater(s) : s));

export const useResumeStore = create<ResumeStore>((set) => ({
  data: null,
  isMockData: false,
  isLoading: true,
  error: null,
  highlightedTags: [],

  init: async (): Promise<void> => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch('/resume-data.json');
      if (!response.ok) {
        throw new Error('Failed to fetch resume data');
      }
      const data: ResumeData = await response.json();
      set({ data, isLoading: false, isMockData: true });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
    }
  },

  importResume: (data: ResumeData): void => {
    set({ data, isMockData: false });
  },

  setActiveVariant: (sectionId, variantId, isIntro = false): void => {
    set((state) => {
      if (!state.data) return state;

      return {
        data: {
          ...state.data,
          sections: updateSection(state.data.sections, sectionId, (section) => {
            if (isIntro && section.type === 'work' && section.intro) {
              // Update the intro sub-slot of a work section
              return {
                ...section,
                intro: { ...section.intro, activeVariantId: variantId },
              } as WorkSection;
            }
            if (!isIntro && section.type === 'variant') {
              // Update a top-level variant section
              return {
                ...section,
                activeVariantId: variantId,
              } as VariantSection;
            }
            return section;
          }),
        },
      };
    });
  },

  toggleBullet: (sectionId, bulletId): void => {
    set((state) => {
      if (!state.data) return state;

      return {
        data: {
          ...state.data,
          sections: updateSection(state.data.sections, sectionId, (section) => {
            if (section.type !== 'work') return section;
            const isActive = section.activeBulletIds.includes(bulletId);
            return {
              ...section,
              activeBulletIds: isActive
                ? section.activeBulletIds.filter((id) => id !== bulletId)
                : [...section.activeBulletIds, bulletId],
            } as WorkSection;
          }),
        },
      };
    });
  },

  reorderAllBullets: (sectionId, bulletIds): void => {
    set((state) => {
      if (!state.data) return state;

      return {
        data: {
          ...state.data,
          sections: updateSection(state.data.sections, sectionId, (section) => {
            if (section.type !== 'work') return section;
            const sortedBullets = [...section.bullets].sort(
              (a, b) => bulletIds.indexOf(a.id) - bulletIds.indexOf(b.id)
            );
            return {
              ...section,
              bullets: sortedBullets,
            } as WorkSection;
          }),
        },
      };
    });
  },

  toggleTag: (tag): void => {
    set((state) => ({
      highlightedTags: state.highlightedTags.includes(tag)
        ? state.highlightedTags.filter((t) => t !== tag)
        : [...state.highlightedTags, tag],
    }));
  },
}));
