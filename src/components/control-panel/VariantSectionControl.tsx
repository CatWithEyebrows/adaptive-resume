import type { ReactElement } from "react";
import type { VariantSection } from "@/types/resume";
import { useResumeStore } from "@/store/useResumeStore";
import { useEditStore } from "@/store/useEditStore";
import { TopLevelHeader } from "./TopLevelHeader";
import { Collapsible } from "@/components/ui/Collapsible";
import { SlotSelector } from "@/components/SlotSelector";

export const VariantSectionControl = ({
  section,
  isCollapsed,
  onToggle,
  dragHandleProps,
}: {
  section: VariantSection;
  isCollapsed: boolean;
  onToggle: () => void;
  dragHandleProps?: Record<string, unknown>;
}): ReactElement => {
  const { setActiveVariant } = useResumeStore();
  const { updateSectionMetadata, deleteSection } = useEditStore();

  return (
    <div>
      <div className="sticky -top-4 z-10 -mx-4 px-4">
        <TopLevelHeader
          label={section.label}
          isCollapsed={isCollapsed}
          onToggle={onToggle}
          dragHandleProps={dragHandleProps}
          onLabelChange={(newLabel) => updateSectionMetadata(section.id, { label: newLabel })}
          onDelete={section.id === "summary" ? undefined : () => deleteSection(section.id)}
        />
      </div>
      <Collapsible isOpen={!isCollapsed}>
        <div className="pt-3">
          <SlotSelector
            sectionId={section.id}
            slot={{ variants: section.variants, activeVariantId: section.activeVariantId }}
            onChange={(id) => setActiveVariant(section.id, id)}
          />
        </div>
      </Collapsible>
    </div>
  );
};
