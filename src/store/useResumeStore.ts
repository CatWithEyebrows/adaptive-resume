import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ResumeData, Section, VariantSection, NestedSection } from '../types/resume';

interface ResumeStore {
  data: ResumeData | null;
  isMockData: boolean;
  isLoading: boolean;
  error: string | null;

  init: () => Promise<void>;
  importResume: (data: ResumeData) => void;
  setActiveVariant: (sectionId: string, variantId: string, isIntro?: boolean) => void;
  toggleBullet: (sectionId: string, bulletId: string) => void;
  reorderAllBullets: (sectionId: string, bulletIds: string[]) => void;

  /** Reorder top-level section groups. Group sections share a sectionHeader. */
  reorderSections: (groupKeys: string[]) => void;

  /** Reorder individual nested entries within a specific block. */
  reorderNestedSections: (sectionHeader: string | undefined, nestedSectionIds: string[]) => void;

  highlightedTags: string[];
  toggleTag: (tag: string) => void;

  /** Allows external modules to update the resume tree directly */
  updateResumeData: (updater: (data: ResumeData) => ResumeData) => void;
}

const updateSection = (
  sections: Section[],
  sectionId: string,
  updater: (section: Section) => Section
): Section[] =>
  sections.map((s) => (s.id === sectionId ? updater(s) : s));

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set, get) => ({
      data: null,
      isMockData: false,
      isLoading: true,
      error: null,
      highlightedTags: [],

      init: async (): Promise<void> => {
        // If we have persisted real (non-mock) data, skip the mock fetch
        const { data, isMockData } = get();
        if (data && !isMockData) {
          set({ isLoading: false });
          return;
        }

        try {
          set({ isLoading: true, error: null });
          const response = await fetch('/resume-data.json');
          if (!response.ok) {
            throw new Error('Failed to fetch resume data');
          }
          const fetchedData: ResumeData = await response.json();
          set({ data: fetchedData, isLoading: false, isMockData: true });
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
                if (isIntro && section.type === 'nested' && section.intro) {
                  return {
                    ...section,
                    intro: { ...section.intro, activeVariantId: variantId },
                  } as NestedSection;
                }
                if (!isIntro && section.type === 'variant') {
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
                if (section.type !== 'nested') return section;
                const isActive = section.activeBulletIds.includes(bulletId);
                return {
                  ...section,
                  activeBulletIds: isActive
                    ? section.activeBulletIds.filter((id) => id !== bulletId)
                    : [...section.activeBulletIds, bulletId],
                } as NestedSection;
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
                if (section.type !== 'nested') return section;
                const sortedBullets = [...section.bullets].sort(
                  (a, b) => bulletIds.indexOf(a.id) - bulletIds.indexOf(b.id)
                );
                return {
                  ...section,
                  bullets: sortedBullets,
                } as NestedSection;
              }),
            },
          };
        });
      },

      reorderSections: (groupKeys): void => {
        set((state) => {
          if (!state.data) return state;

          const sections = state.data.sections;
          const summary = sections.find((s) => s.id === 'summary');
          const nonSummary = sections.filter((s) => s.id !== 'summary');

          const groupedMap = new Map<string, Section[]>();
          
          for (const s of nonSummary) {
            const key = s.type === 'nested' ? `nested-group-${s.sectionHeader || 'Work Experience'}` : s.id;
            if (!groupedMap.has(key)) groupedMap.set(key, []);
            groupedMap.get(key)!.push(s);
          }

          const reordered: Section[] = [];
          if (summary) reordered.push(summary);

          for (const key of groupKeys) {
            const group = groupedMap.get(key);
            if (group) reordered.push(...group);
          }

          return {
            data: { ...state.data, sections: reordered },
          };
        });
      },

      reorderNestedSections: (sectionHeader, nestedSectionIds): void => {
        set((state) => {
          if (!state.data) return state;

          const sections = state.data.sections;
          
          // Find all nested sections belonging to this specific header group
          const groupSections = sections.filter(
            (s): s is NestedSection => s.type === 'nested' && s.sectionHeader === sectionHeader
          );
          
          if (groupSections.length === 0) return state;

          const workMap = new Map(groupSections.map((s) => [s.id, s]));

          // Find start/end index of this EXACT group to replace bounds
          const firstWorkIdx = sections.findIndex((s) => s.type === 'nested' && s.sectionHeader === sectionHeader);
          const lastWorkIdx = sections.length - 1 - [...sections].reverse().findIndex((s) => s.type === 'nested' && s.sectionHeader === sectionHeader);

          // Build the reordered sections
          const reorderedWork: NestedSection[] = [];
          for (const id of nestedSectionIds) {
            const ws = workMap.get(id);
            if (ws) reorderedWork.push(ws);
          }

          // Splice into the sections array
          const newSections = [
            ...sections.slice(0, firstWorkIdx),
            ...reorderedWork,
            ...sections.slice(lastWorkIdx + 1),
          ];

          return {
            data: { ...state.data, sections: newSections },
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

      updateResumeData: (updater): void => {
        set((state) => {
          if (!state.data) return state;
          return {
            data: updater(state.data),
          };
        });
      },
    }),
    {
      name: 'adaptive-resume-storage',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version === 1 || version === 0) {
          // Migrate old `work` sections to `nested` generic sections
          if (persistedState.data?.sections) {
            persistedState.data.sections = persistedState.data.sections.map((s: any) => {
              if (s.type === 'work') {
                return {
                  ...s,
                  type: 'nested',
                  sectionHeader: 'Work Experience',
                };
              }
              return s;
            });
          }
        }
        return persistedState;
      },
      partialize: (state) => ({
        // Only persist user-uploaded data; mock/template data is re-fetched on init
        data: state.isMockData ? null : state.data,
        isMockData: state.isMockData,
      }),
    }
  )
);
