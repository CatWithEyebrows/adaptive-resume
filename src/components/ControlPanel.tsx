import { useState, useRef, useMemo, useCallback } from "react";
import type { ReactElement } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import type { VariantSection } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { AddSectionDialog } from "./AddSectionDialog";
import { useEditStore } from "@/store/useEditStore";
import { buildSectionGroups, getAllCollapsibleIds } from "./control-panel/sectionGroups";
import type { SectionGroup } from "./control-panel/sectionGroups";
import { TopLevelHeader } from "./control-panel/TopLevelHeader";
import { VariantSectionControl } from "./control-panel/VariantSectionControl";
import { NestedGroupBlock } from "./control-panel/NestedGroupBlock";
import { IconButton } from "@/components/ui/IconButton";
import { DragGhost } from "@/components/ui/DragGhost";
import { SortableWrapper } from "@/components/ui/SortableWrapper";
import { useDndSensors } from "@/lib/dnd/useDndSensors";
import {
  DndContext,
  closestCenter,
  DragOverlay,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Minus,
  Plus,
  ArrowUpDown,
  Check,
} from "lucide-react";

// ─── Main ControlPanel ───────────────────────────────────────────────────────

export function ControlPanel(): ReactElement | null {
  const { data, isLoading, reorderSections } = useResumeStore();
  const { isEditMode, addSection, addNestedEntry } = useEditStore();
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [isReorderingSections, setIsReorderingSections] = useState(false);
  const [isReorderingNestedEntries, setIsReorderingNestedEntries] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  // Snapshot of collapsed state before entering reorder mode
  const preReorderRef = useRef<Set<string> | null>(null);

  const sensors = useDndSensors();

  const sectionGroups = useMemo(
    () => (data ? buildSectionGroups(data.sections) : []),
    [data]
  );

  const summarySection = data?.sections.find(
    (s): s is VariantSection => s.type === "variant" && s.id === "summary"
  );

  const toggleCollapse = useCallback((id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const collapseAll = useCallback(() => {
    if (!data) return;
    const groups = buildSectionGroups(data.sections);
    setCollapsedIds(new Set(getAllCollapsibleIds(groups)));
  }, [data]);

  const expandAll = useCallback(() => {
    setCollapsedIds(new Set());
  }, []);

  // ── Section reorder mode ──
  const toggleSectionReorder = useCallback(() => {
    setIsReorderingSections((prev) => {
      if (!prev) {
        // Entering: snapshot state, collapse everything
        preReorderRef.current = new Set(collapsedIds);
        if (data) {
          const groups = buildSectionGroups(data.sections);
          setCollapsedIds(new Set(getAllCollapsibleIds(groups)));
        }
        return true;
      } else {
        // Exiting: restore snapshot
        if (preReorderRef.current) {
          setCollapsedIds(preReorderRef.current);
          preReorderRef.current = null;
        }
        return false;
      }
    });
  }, [collapsedIds, data]);

  // ── Work entry reorder mode ──
  const toggleNestedEntryReorder = useCallback(() => {
    setIsReorderingNestedEntries((prev) => !prev);
  }, []);

  if (isLoading || !data) {
    return <div className="p-4">Loading control panel...</div>;
  }

  // ── Section-level DND handlers (only active in reorder mode) ──
  const handleSectionDragStart = (event: DragStartEvent) => {
    setActiveSectionId(String(event.active.id));
  };

  const handleSectionDragEnd = (event: DragEndEvent) => {
    setActiveSectionId(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const groupIds = sectionGroups.map((g) => g.id);
      const oldIndex = groupIds.indexOf(String(active.id));
      const newIndex = groupIds.indexOf(String(over.id));
      reorderSections(arrayMove(groupIds, oldIndex, newIndex));
    }
  };

  const activeGroup = activeSectionId
    ? sectionGroups.find((g) => g.id === activeSectionId)
    : null;

  const getGroupLabel = (group: SectionGroup): string =>
    group.kind === "variant" ? group.section.label : "Work Experience";

  return (
    <div
      className="w-1/3 min-w-[320px] max-w-sm border-r bg-muted/30 overflow-y-auto p-4 flex flex-col gap-3"
      data-print-hide
    >
      {/* ── Header with controls on hover ── */}
      <div className="group flex items-center justify-between border-b border-border/40 pb-2 mb-1">
        <h2 className="font-semibold text-base tracking-tight">Configuration</h2>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <IconButton onClick={collapseAll} label="Collapse all">
            <Minus size={13} />
          </IconButton>
          <IconButton onClick={expandAll} label="Expand all">
            <Plus size={13} />
          </IconButton>
          {!isEditMode && (
            <IconButton
              onClick={toggleSectionReorder}
              label={isReorderingSections ? "Done reordering" : "Reorder sections"}
              isActive={isReorderingSections}
            >
              {isReorderingSections ? <Check size={13} /> : <ArrowUpDown size={13} />}
            </IconButton>
          )}
        </div>
      </div>

      {isReorderingSections ? (
        /* ── Section reorder mode: everything collapsed, drag handles visible ── */
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleSectionDragStart}
          onDragEnd={handleSectionDragEnd}
        >
          <SortableContext
            items={sectionGroups.map((g) => g.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2">
              {/* Summary shown as static non-draggable header */}
              {summarySection && (
                <TopLevelHeader
                  label="Summary"
                  isCollapsed={true}
                  onToggle={() => {}}
                  hideChevron
                />
              )}
              {sectionGroups.map((group) =>
                <SortableWrapper key={group.id} id={group.id}>
                  {(dragHandleProps) => (
                    <TopLevelHeader
                      label={getGroupLabel(group)}
                      isCollapsed={true}
                      onToggle={() => {}}
                      dragHandleProps={dragHandleProps}
                      hideChevron
                    />
                  )}
                </SortableWrapper>
              )}
            </div>
          </SortableContext>
          <DragOverlay
            dropAnimation={{ duration: 200, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}
          >
            {activeGroup ? <DragGhost label={getGroupLabel(activeGroup)} /> : null}
          </DragOverlay>
        </DndContext>
      ) : (
        /* ── Normal mode: collapsible sections, no section drag ── */
        <>
          {summarySection && (
            <VariantSectionControl
              section={summarySection}
              isCollapsed={collapsedIds.has("summary")}
              onToggle={() => toggleCollapse("summary")}
            />
          )}

          <div className="flex flex-col gap-2">
            {sectionGroups.map((group) =>
              group.kind === "variant" ? (
                <VariantSectionControl
                  key={group.id}
                  section={group.section}
                  isCollapsed={collapsedIds.has(group.id)}
                  onToggle={() => toggleCollapse(group.id)}
                />
              ) : (
                <NestedGroupBlock
                  key={group.id}
                  sections={group.sections}
                  // Nested Groups dynamically handle collapse matching their auto-grouped ID
                  isGroupCollapsed={collapsedIds.has(group.id)}
                  onToggleGroup={() => toggleCollapse(group.id)}
                  collapsedIds={collapsedIds}
                  onToggleEntry={toggleCollapse}
                  isReorderingEntries={isReorderingNestedEntries}
                  onToggleReorderEntries={toggleNestedEntryReorder}
                  sectionLabel={group.sections[0]?.sectionHeader || "Work Experience"} // Fallback or extracted properly
                />
              )
            )}
          </div>

          {isEditMode && (
            <div className="mt-4 pt-4 border-t border-border/40 flex justify-center pb-8">
              <Button
                variant="outline"
                className="gap-2 w-full border-dashed"
                onClick={() => setIsAddSectionOpen(true)}
              >
                <Plus size={16} /> Add New Section
              </Button>
            </div>
          )}
        </>
      )}

      <AddSectionDialog
        isOpen={isAddSectionOpen}
        onClose={() => setIsAddSectionOpen(false)}
        onSave={(label, type) => {
          if (type === "nested") {
            addNestedEntry({
              type: "nested",
              id: `nested_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              sectionHeader: label,
              company: "New Entry",
              role: "New Role",
              dates: "Present",
              bullets: [],
              activeBulletIds: []
            });
          } else {
            addSection({
              type: "variant",
              id: `section_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              label,
              sectionHeader: label,
              variants: [],
              activeVariantId: ""
            });
          }
        }}
      />
    </div>
  );
}
