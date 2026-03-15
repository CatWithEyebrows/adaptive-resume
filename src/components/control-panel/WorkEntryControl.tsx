import { useState } from "react";
import type { ReactElement } from "react";
import type { NestedSection } from "@/types/resume";
import { useResumeStore } from "@/store/useResumeStore";
import { useEditStore } from "@/store/useEditStore";
import { WorkEntryHeader } from "./WorkEntryHeader";
import { Collapsible } from "@/components/ui/Collapsible";
import { IconButton } from "@/components/ui/IconButton";
import { SlotSelector } from "@/components/SlotSelector";
import { BulletSelector } from "@/components/BulletSelector";
import { ArrowUpDown, Check } from "lucide-react";

export const WorkEntryControl = ({
  section,
  isCollapsed,
  onToggle,
}: {
  section: NestedSection;
  isCollapsed: boolean;
  onToggle: () => void;
}): ReactElement => {
  const { setActiveVariant, toggleBullet, reorderAllBullets } = useResumeStore();
  const { isEditMode, updateSectionMetadata, deleteNestedEntry } = useEditStore();
  const [reorderBullets, setReorderBullets] = useState(false);

  return (
    <div>
      {/* Sticky: entry header + bullets toolbar */}
      <div className="sticky top-[24px] z-[5] bg-background/50 backdrop-blur-md transition-all hover:bg-background/70 hover:border-muted-foreground/30 -mx-2 px-2 pt-1.5 pb-2 mb-2 rounded-xl border border-border/60">
        <WorkEntryHeader
          company={section.company}
          role={section.role}
          isCollapsed={isCollapsed}
          onToggle={onToggle}
          onInfoChange={(company, role) => updateSectionMetadata(section.id, { company, role })}
          onDelete={() => deleteNestedEntry(section.id)}
        />
        {!isCollapsed && (
          <div className="flex items-center justify-between mt-1.5 px-1">
            <span className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">
              Bullets
            </span>
            {!isEditMode && (
              <IconButton
                onClick={() => setReorderBullets((p) => !p)}
                label={reorderBullets ? "Done reordering bullets" : "Reorder bullets"}
                isActive={reorderBullets}
              >
                {reorderBullets ? <Check size={12} /> : <ArrowUpDown size={12} />}
              </IconButton>
            )}
          </div>
        )}
      </div>
      <Collapsible isOpen={!isCollapsed}>
        <div className="flex flex-col gap-4 pt-2 pl-1">
          {section.intro && (
            <div>
              <p className="text-xs font-medium text-muted-foreground/70 mb-2 uppercase tracking-wider">
                {section.intro.label}
              </p>
              <SlotSelector
                sectionId={section.id}
                isIntro={true}
                slot={{
                  variants: section.intro.variants,
                  activeVariantId: section.intro.activeVariantId,
                }}
                onChange={(id) => setActiveVariant(section.id, id, true)}
              />
            </div>
          )}
          <BulletSelector
            sectionId={section.id}
            slot={{ bullets: section.bullets, activeBulletIds: section.activeBulletIds }}
            onToggle={(id) => toggleBullet(section.id, id)}
            onReorder={(ids) => reorderAllBullets(section.id, ids)}
            reorderMode={reorderBullets}
          />
        </div>
      </Collapsible>
    </div>
  );
};
