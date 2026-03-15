import type { VariantSection, NestedSection, Section } from "@/types/resume";

export type SectionGroup =
  | { kind: "variant"; section: VariantSection; id: string }
  | { kind: "nestedGroup"; sections: NestedSection[]; header: string; id: string };

export function buildSectionGroups(sections: Section[]): SectionGroup[] {
  const groups: SectionGroup[] = [];
  let currentGroup: NestedSection[] | null = null;
  let currentHeader: string | undefined = undefined;

  for (const section of sections) {
    if (section.id === "summary") continue;
    if (section.type === "nested") {
      const header = section.sectionHeader || "Work Experience";
      // If we are already building a group and the header matches, append to it
      if (currentGroup && currentHeader === header) {
        currentGroup.push(section);
      } else {
        // If we were building a different group, flush it first
        if (currentGroup) {
          groups.push({ kind: "nestedGroup", sections: currentGroup, header: currentHeader!, id: `nested-group-${currentHeader}` });
        }
        // Start a new group
        currentGroup = [section];
        currentHeader = header;
      }
    } else {
      // If we encounter a variant section, flush any pending nested group
      if (currentGroup) {
        groups.push({ kind: "nestedGroup", sections: currentGroup, header: currentHeader!, id: `nested-group-${currentHeader}` });
        currentGroup = null;
        currentHeader = undefined;
      }
      groups.push({ kind: "variant", section, id: section.id });
    }
  }
  // Flush any remaining nested group at the end
  if (currentGroup) {
    groups.push({ kind: "nestedGroup", sections: currentGroup, header: currentHeader!, id: `nested-group-${currentHeader}` });
  }
  return groups;
}

export function getAllCollapsibleIds(groups: SectionGroup[]): string[] {
  return [
    "summary",
    ...groups.flatMap((g) =>
      g.kind === "nestedGroup"
        ? [g.id, ...g.sections.map((s) => s.id)]
        : [g.id]
    ),
  ];
}
