import { create } from "zustand";
import { useResumeStore } from "./useResumeStore";
import type { Bullet, Section, Variant, NestedSection } from "@/types/resume";

interface EditStore {
  isEditMode: boolean;
  setEditMode: (mode: boolean) => void;

  addVariant: (sectionId: string, variant: Variant, isIntro?: boolean) => void;
  updateVariant: (sectionId: string, variantId: string, updatedVariant: Variant, isIntro?: boolean) => void;

  addBullet: (sectionId: string, bullet: Bullet) => void;
  updateBullet: (sectionId: string, bulletId: string, updatedBullet: Bullet) => void;
  deleteBullet: (sectionId: string, bulletId: string) => void;

  addSection: (section: Section) => void;
  updateSectionMetadata: (sectionId: string, details: Partial<Section>) => void;
  deleteSection: (sectionId: string) => void;

  addNestedEntry: (entry: NestedSection) => void;
  deleteNestedEntry: (sectionId: string) => void;
  deleteNestedGroup: (sectionHeader: string) => void;
  renameNestedGroup: (oldHeader: string, newHeader: string) => void;

  deleteVariant: (sectionId: string, variantId: string, isIntro?: boolean) => void;
}

export const useEditStore = create<EditStore>()((set) => ({
  isEditMode: false,
  setEditMode: (mode) => set({ isEditMode: mode }),

  addVariant: (sectionId, variant, isIntro = false) => {
    useResumeStore.getState().updateResumeData((data) => ({
      ...data,
      sections: data.sections.map((section) => {
        if (section.id !== sectionId) return section;

        if (isIntro && section.type === "nested") {
          return {
            ...section,
            intro: section.intro
              ? {
                  ...section.intro,
                  variants: [...section.intro.variants, variant],
                  activeVariantId: variant.id,
                }
              : undefined,
          } as NestedSection;
        }

        if (!isIntro && section.type === "variant") {
          return {
            ...section,
            variants: [...section.variants, variant],
            activeVariantId: variant.id,
          };
        }

        return section;
      }),
    }));
  },

  updateVariant: (sectionId, variantId, updatedVariant, isIntro = false) => {
    useResumeStore.getState().updateResumeData((data) => ({
      ...data,
      sections: data.sections.map((section) => {
        if (section.id !== sectionId) return section;

        if (isIntro && section.type === "nested" && section.intro) {
          return {
            ...section,
            intro: {
              ...section.intro,
              variants: section.intro.variants.map((v) => (v.id === variantId ? updatedVariant : v)),
            },
          } as NestedSection;
        }

        if (!isIntro && section.type === "variant") {
          return {
            ...section,
            variants: section.variants.map((v) => (v.id === variantId ? updatedVariant : v)),
          };
        }

        return section;
      }),
    }));
  },

  addBullet: (sectionId, bullet) => {
    useResumeStore.getState().updateResumeData((data) => ({
      ...data,
      sections: data.sections.map((section) => {
        if (section.id !== sectionId || section.type !== "nested") return section;
        return {
          ...section,
          bullets: [...section.bullets, bullet],
          activeBulletIds: [...section.activeBulletIds, bullet.id], // auto check it
        } as NestedSection;
      }),
    }));
  },

  updateBullet: (sectionId, bulletId, updatedBullet) => {
    useResumeStore.getState().updateResumeData((data) => ({
      ...data,
      sections: data.sections.map((section) => {
        if (section.id !== sectionId || section.type !== "nested") return section;
        return {
          ...section,
          bullets: section.bullets.map((b) => (b.id === bulletId ? updatedBullet : b)),
        } as NestedSection;
      }),
    }));
  },

  deleteBullet: (sectionId, bulletId) => {
    useResumeStore.getState().updateResumeData((data) => ({
      ...data,
      sections: data.sections.map((section) => {
        if (section.id !== sectionId || section.type !== "nested") return section;
        return {
          ...section,
          bullets: section.bullets.filter((b) => b.id !== bulletId),
          activeBulletIds: section.activeBulletIds.filter((id) => id !== bulletId)
        } as NestedSection;
      }),
    }));
  },

  addSection: (section) => {
    useResumeStore.getState().updateResumeData((data) => ({
      ...data,
      sections: [...data.sections, section],
    }));
  },

  updateSectionMetadata: (sectionId, details) => {
    useResumeStore.getState().updateResumeData((data) => ({
      ...data,
      sections: data.sections.map((section) => {
        if (section.id !== sectionId) return section;
        
        // If updating label for a variant section, also update sectionHeader if it's there
        if (section.type === "variant" && "label" in details && details.label) {
          return { ...section, ...details, sectionHeader: details.label } as Section;
        }

        return { ...section, ...details } as Section;
      }),
    }));
  },

  deleteSection: (sectionId) => {
    useResumeStore.getState().updateResumeData((data) => ({
      ...data,
      sections: data.sections.filter((s) => s.id !== sectionId)
    }));
  },

  addNestedEntry: (entry: NestedSection) => {
    useResumeStore.getState().updateResumeData((data) => {
      // Find where to insert it (e.g., at the top of nested entries that match the header)
      const firstNestedIdx = data.sections.findIndex((s) => s.type === "nested" && s.sectionHeader === entry.sectionHeader);
      const insertIdx = firstNestedIdx !== -1 ? firstNestedIdx : data.sections.length;

      const newSections = [...data.sections];
      newSections.splice(insertIdx, 0, entry);

      return {
        ...data,
        sections: newSections,
      };
    });
  },

  deleteNestedEntry: (sectionId: string) => {
    useResumeStore.getState().updateResumeData((data) => ({
      ...data,
      sections: data.sections.filter((s) => s.id !== sectionId)
    }));
  },

  deleteNestedGroup: (sectionHeader: string) => {
    useResumeStore.getState().updateResumeData((data) => ({
      ...data,
      sections: data.sections.filter(
        (s) => !(s.type === "nested" && s.sectionHeader === sectionHeader)
      ),
    }));
  },

  renameNestedGroup: (oldHeader: string, newHeader: string) => {
    useResumeStore.getState().updateResumeData((data) => ({
      ...data,
      sections: data.sections.map((s) =>
        s.type === "nested" && s.sectionHeader === oldHeader
          ? { ...s, sectionHeader: newHeader }
          : s
      ),
    }));
  },

  deleteVariant: (sectionId: string, variantId: string, isIntro = false) => {
    useResumeStore.getState().updateResumeData((data) => ({
      ...data,
      sections: data.sections.map((section) => {
        if (section.id !== sectionId) return section;

        if (isIntro && section.type === "nested" && section.intro) {
          const variants = section.intro.variants.filter((v) => v.id !== variantId);
          return {
            ...section,
            intro: {
              ...section.intro,
              variants,
              activeVariantId: section.intro.activeVariantId === variantId && variants.length > 0 
                ? variants[0].id : section.intro.activeVariantId === variantId ? "" : section.intro.activeVariantId,
            },
          } as NestedSection;
        }

        if (!isIntro && section.type === "variant") {
          const variants = section.variants.filter((v) => v.id !== variantId);
          return {
            ...section,
            variants,
            activeVariantId: section.activeVariantId === variantId && variants.length > 0 
              ? variants[0].id : section.activeVariantId === variantId ? "" : section.activeVariantId,
          };
        }

        return section;
      }),
    }));
  },
}));
