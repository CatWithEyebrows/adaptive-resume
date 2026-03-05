import type { ReactElement } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import type { VariantSection, WorkSection } from "@/types/resume";
import { SlotSelector } from "./SlotSelector";
import { BulletSelector } from "./BulletSelector";

/**
 * Renders controls for a VariantSection (e.g. summary, skills).
 * Displays the section label and a radio-group slot selector.
 *
 * @param section - The variant section data.
 * @returns Control block for a variant section.
 */
const VariantSectionControl = ({ section }: { section: VariantSection }): ReactElement => {
  const { setActiveVariant } = useResumeStore();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="font-medium mb-3">{section.label}</h3>
        <SlotSelector
          slot={{ variants: section.variants, activeVariantId: section.activeVariantId }}
          onChange={(id) => setActiveVariant(section.id, id)}
        />
      </div>
    </div>
  );
};

/**
 * Renders controls for a WorkSection (company entry).
 * Includes an optional intro variant selector and a bullet selector with DND.
 *
 * @param section - The work section data.
 * @returns Control block for a work experience section.
 */
const WorkSectionControl = ({ section }: { section: WorkSection }): ReactElement => {
  const { setActiveVariant, toggleBullet, reorderAllBullets } = useResumeStore();

  return (
    <>
      {/* Optional intro variant selector */}
      {section.intro && (
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="font-medium mb-3">{section.intro.label}</h3>
            <SlotSelector
              slot={{
                variants: section.intro.variants,
                activeVariantId: section.intro.activeVariantId,
              }}
              onChange={(id) => setActiveVariant(section.id, id, true)}
            />
          </div>
        </div>
      )}

      {/* Bullets selector with drag-and-drop */}
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="font-medium mb-3">{section.company} Bullets</h3>
          <BulletSelector
            slot={{ bullets: section.bullets, activeBulletIds: section.activeBulletIds }}
            onToggle={(id) => toggleBullet(section.id, id)}
            onReorder={(ids) => reorderAllBullets(section.id, ids)}
          />
        </div>
      </div>
    </>
  );
};

/**
 * ControlPanel dynamically renders controls for all resume sections.
 * Iterates over `data.sections` and renders the appropriate control
 * component based on the section's `type` discriminator.
 *
 * @returns The full control panel sidebar.
 */
export function ControlPanel(): ReactElement | null {
  const { data, isLoading } = useResumeStore();

  if (isLoading || !data) {
    return <div className="p-4">Loading control panel...</div>;
  }

  return (
    <div className="w-1/3 min-w-[320px] max-w-sm border-r bg-muted/30 overflow-y-auto p-4 flex flex-col gap-8" data-print-hide>
      <h2 className="font-semibold text-lg border-b pb-2">Configuration</h2>

      {data.sections.map((section) => {
        if (section.type === "variant") {
          return <VariantSectionControl key={section.id} section={section} />;
        }
        if (section.type === "work") {
          return <WorkSectionControl key={section.id} section={section} />;
        }
        return null;
      })}
    </div>
  );
}
