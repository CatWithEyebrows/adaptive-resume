import { describe, it, expect, beforeEach } from 'vitest';
import { useResumeStore } from './useResumeStore';
import type { ResumeData, WorkSection } from '../types/resume';

const mockData: ResumeData = {
  name: "John Doe",
  contact: { email: "j@doe.com", links: [{ url: "johndoe", alias: "GitHub" }] },
  sections: [
    {
      type: "variant",
      id: "summary",
      label: "Summary",
      variants: [
        { id: "s1", label: "L1", tags: [], content: "C1" },
        { id: "s2", label: "L2", tags: [], content: "C2" }
      ],
      activeVariantId: "s1"
    },
    {
      type: "variant",
      id: "skills",
      label: "Skills",
      sectionHeader: "SKILLS",
      variants: [{ id: "sk1", label: "L1", tags: [], content: "C1" }],
      activeVariantId: "sk1"
    },
    {
      type: "work",
      id: "acme",
      company: "ACME Corp",
      role: "Engineer",
      dates: "2020 – Present",
      intro: {
        label: "Intro",
        variants: [
          { id: "intro1", label: "Default", tags: [], content: "Intro C1" },
          { id: "intro2", label: "Alt", tags: [], content: "Intro C2" }
        ],
        activeVariantId: "intro1"
      },
      bullets: [
        { id: "qb1", label: "L1", tags: [], content: "C1" },
        { id: "qb2", label: "L2", tags: [], content: "C2" },
        { id: "qb3", label: "L3", tags: [], content: "C3" }
      ],
      activeBulletIds: ["qb1"]
    }
  ]
};

/** Helper to find a work section from the store state by ID. */
const getWorkSection = (sectionId: string): WorkSection | undefined => {
  const state = useResumeStore.getState();
  const section = state.data?.sections.find((s) => s.id === sectionId);
  return section?.type === "work" ? section : undefined;
};

describe('useResumeStore', () => {
  beforeEach(() => {
    useResumeStore.setState({
      data: JSON.parse(JSON.stringify(mockData)),
      isLoading: false,
      error: null,
      highlightedTags: []
    });
  });

  it('should initialize with provided state', () => {
    const state = useResumeStore.getState();
    expect(state.data?.name).toBe("John Doe");
    const summary = state.data?.sections.find((s) => s.id === "summary");
    expect(summary?.type === "variant" && summary.activeVariantId).toBe("s1");
  });

  it('setActiveVariant should update a variant section activeVariantId', () => {
    const { setActiveVariant } = useResumeStore.getState();

    setActiveVariant('summary', 's2');

    const state = useResumeStore.getState();
    const summary = state.data?.sections.find((s) => s.id === "summary");
    expect(summary?.type === "variant" && summary.activeVariantId).toBe('s2');
  });

  it('setActiveVariant with isIntro should update the work section intro', () => {
    const { setActiveVariant } = useResumeStore.getState();

    setActiveVariant('acme', 'intro2', true);

    const acme = getWorkSection('acme');
    expect(acme?.intro?.activeVariantId).toBe('intro2');
  });

  it('toggleBullet should check a bullet if it is not checked', () => {
    const { toggleBullet } = useResumeStore.getState();

    toggleBullet('acme', 'qb2');

    const acme = getWorkSection('acme');
    expect(acme?.activeBulletIds).toContain('qb2');
    expect(acme?.activeBulletIds).toContain('qb1');
  });

  it('toggleBullet should uncheck a bullet if it is currently checked', () => {
    const { toggleBullet } = useResumeStore.getState();

    toggleBullet('acme', 'qb1');

    const acme = getWorkSection('acme');
    expect(acme?.activeBulletIds).not.toContain('qb1');
  });

  it('reorderAllBullets should reorder bullets in a work section', () => {
    const { reorderAllBullets } = useResumeStore.getState();

    reorderAllBullets('acme', ['qb3', 'qb1', 'qb2']);

    const acme = getWorkSection('acme');
    expect(acme?.bullets.map((b) => b.id)).toEqual(['qb3', 'qb1', 'qb2']);
  });

  it('toggleTag should add tag if not present, and remove if present', () => {
    const { toggleTag } = useResumeStore.getState();

    toggleTag('react');
    expect(useResumeStore.getState().highlightedTags).toContain('react');

    toggleTag('react');
    expect(useResumeStore.getState().highlightedTags).not.toContain('react');
  });
});
