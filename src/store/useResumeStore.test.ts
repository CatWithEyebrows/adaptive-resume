import { describe, it, expect, beforeEach } from 'vitest';
import { useResumeStore } from './useResumeStore';
import { type ResumeData, type NestedSection } from '../types/resume';

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
      type: "nested",
      sectionHeader: "Work Experience",
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
    },
    {
      type: "nested",
      sectionHeader: "Work Experience",
      id: "globex",
      company: "Globex Inc",
      role: "Developer",
      dates: "2018 – 2020",
      bullets: [
        { id: "gb1", label: "GL1", tags: [], content: "GC1" },
      ],
      activeBulletIds: ["gb1"]
    },
    {
      type: "variant",
      id: "education",
      label: "Education",
      sectionHeader: "EDUCATION",
      variants: [{ id: "ed1", label: "L1", tags: [], content: "BS CS" }],
      activeVariantId: "ed1"
    }
  ]
};

/** Helper to find a nested section from the store state by ID. */
const getNestedSection = (sectionId: string): NestedSection | undefined => {
  const state = useResumeStore.getState();
  const section = state.data?.sections.find((s) => s.id === sectionId);
  return section?.type === "nested" ? section : undefined;
};

describe('useResumeStore', () => {
  beforeEach(() => {
    useResumeStore.setState({
      data: JSON.parse(JSON.stringify(mockData)),
      isMockData: false,
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

    const acme = getNestedSection('acme');
    expect(acme?.intro?.activeVariantId).toBe('intro2');
  });

  it('toggleBullet should check a bullet if it is not checked', () => {
    const { toggleBullet } = useResumeStore.getState();

    toggleBullet('acme', 'qb2');

    const acme = getNestedSection('acme');
    expect(acme?.activeBulletIds).toContain('qb2');
    expect(acme?.activeBulletIds).toContain('qb1');
  });

  it('toggleBullet should uncheck a bullet if it is currently checked', () => {
    const { toggleBullet } = useResumeStore.getState();

    toggleBullet('acme', 'qb1');

    const acme = getNestedSection('acme');
    expect(acme?.activeBulletIds).not.toContain('qb1');
  });

  it('reorderAllBullets should reorder bullets in a work section', () => {
    const { reorderAllBullets } = useResumeStore.getState();

    reorderAllBullets('acme', ['qb3', 'qb1', 'qb2']);

    const acme = getNestedSection('acme');
    expect(acme?.bullets.map((b) => b.id)).toEqual(['qb3', 'qb1', 'qb2']);
  });

  it('toggleTag should add tag if not present, and remove if present', () => {
    const { toggleTag } = useResumeStore.getState();

    toggleTag('react');
    expect(useResumeStore.getState().highlightedTags).toContain('react');

    toggleTag('react');
    expect(useResumeStore.getState().highlightedTags).not.toContain('react');
  });

  describe('reorderSections', () => {
    it('should reorder section groups while keeping summary pinned', () => {
      const { reorderSections } = useResumeStore.getState();

      // Original order (after summary): skills, work-group, education
      // Reorder to: education, nested-group-Work Experience, skills
      reorderSections(['education', 'nested-group-Work Experience', 'skills']);

      const sections = useResumeStore.getState().data!.sections;
      expect(sections[0].id).toBe('summary');
      expect(sections[1].id).toBe('education');
      expect(sections[2].type).toBe('nested'); // acme
      expect(sections[3].type).toBe('nested'); // globex
      expect(sections[4].id).toBe('skills');
    });

    it('should keep all work sections contiguous as a block', () => {
      const { reorderSections } = useResumeStore.getState();

      reorderSections(['nested-group-Work Experience', 'education', 'skills']);

      const sections = useResumeStore.getState().data!.sections;
      const workIndices = sections
        .map((s, i) => (s.type === 'nested' ? i : -1))
        .filter((i) => i !== -1);

      // Work sections should be contiguous
      for (let i = 1; i < workIndices.length; i++) {
        expect(workIndices[i]).toBe(workIndices[i - 1] + 1);
      }
    });
  });

  describe('reorderNestedSections', () => {
    it('should reorder nested entries within the specific header block', () => {
      const { reorderNestedSections } = useResumeStore.getState();

      reorderNestedSections("Work Experience", ['globex', 'acme']);

      const sections = useResumeStore.getState().data!.sections;
      const workSections = sections.filter((s) => s.type === 'nested');
      expect(workSections[0].id).toBe('globex');
      expect(workSections[1].id).toBe('acme');
    });

    it('should preserve non-nested sections in place', () => {
      const { reorderNestedSections } = useResumeStore.getState();

      reorderNestedSections("Work Experience", ['globex', 'acme']);

      const sections = useResumeStore.getState().data!.sections;
      expect(sections[0].id).toBe('summary');
      expect(sections[1].id).toBe('skills');
      // Nested sections are now globex, acme
      expect(sections[2].id).toBe('globex');
      expect(sections[3].id).toBe('acme');
      expect(sections[4].id).toBe('education');
    });
  });

  describe('persistence', () => {
    it('init should skip mock fetch when persisted non-mock data exists', async () => {
      // State already has data with isMockData: false from beforeEach
      const { init } = useResumeStore.getState();

      await init();

      const state = useResumeStore.getState();
      expect(state.data?.name).toBe("John Doe");
      expect(state.isMockData).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });
});
