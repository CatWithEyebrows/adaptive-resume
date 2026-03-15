import { useState } from "react";
import type { ReactElement } from "react";
import type { NestedSection } from "@/types/resume";
import { useResumeStore } from "@/store/useResumeStore";
import { useEditStore } from "@/store/useEditStore";
import { WorkEntryHeader } from "./WorkEntryHeader";
import { WorkEntryControl } from "./WorkEntryControl";
import { NestedEntryEditDialog } from "@/components/NestedEntryEditDialog";
import { Input } from "@/components/ui/input";
import { Collapsible } from "@/components/ui/Collapsible";
import { IconButton } from "@/components/ui/IconButton";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DragGhost } from "@/components/ui/DragGhost";
import { DragHandle } from "@/components/ui/DragHandle";
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
  ChevronRight,
  Plus,
  ArrowUpDown,
  Check,
  Edit2,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";

/**
 * Container for a group of NestedSections that share the same sectionHeader
 * (e.g. all "Work Experience" entries, or all "Projects" entries).
 *
 * Responsibilities:
 *  1. **Group header** — sticky bar with collapse chevron, inline label editing
 *     (edit mode), and delete-group action. Duplicates TopLevelHeader layout
 *     because it adds entry-reorder and edit-mode toolbar buttons that don't
 *     exist on TopLevelHeader.
 *  2. **Entry reorder mode** — owns a DndContext that lets the user drag-sort
 *     the entries within this group. All entries render collapsed with drag
 *     handles when active.
 *  3. **Normal mode** — renders each entry as a full WorkEntryControl with
 *     its own bullet/slot selectors. Also shows the "Add new subsection"
 *     button in edit mode.
 *  4. **Add entry dialog** — manages NestedEntryEditDialog open/close state.
 *
 * Props are intentionally flat (no nested config objects) so the parent
 * ControlPanel can wire collapse/reorder state without indirection.
 */
export const NestedGroupBlock = ({
  sections,
  isGroupCollapsed,
  onToggleGroup,
  collapsedIds,
  onToggleEntry,
  isReorderingEntries,
  onToggleReorderEntries,
  dragHandleProps,
  sectionLabel,
}: {
  /** All NestedSections belonging to this group (same sectionHeader). */
  sections: NestedSection[];
  isGroupCollapsed: boolean;
  onToggleGroup: () => void;
  /** Shared collapse state from ControlPanel — used to check per-entry collapse. */
  collapsedIds: Set<string>;
  onToggleEntry: (id: string) => void;
  /** Whether the user is currently drag-reordering entries within this group. */
  isReorderingEntries: boolean;
  onToggleReorderEntries: () => void;
  /** Present only during section-level reorder — shows a drag handle on the group header. */
  dragHandleProps?: Record<string, unknown>;
  sectionLabel?: string;
}): ReactElement => {
  const { reorderNestedSections } = useResumeStore();
  const { isEditMode, addNestedEntry, deleteNestedGroup, renameNestedGroup } = useEditStore();
  const [confirmDialog, confirmDelete] = useConfirmDialog();

  // ── Entry drag-and-drop state ──
  const [activeWorkId, setActiveWorkId] = useState<string | null>(null);
  const sensors = useDndSensors();

  const handleDragStart = (event: DragStartEvent) => {
    setActiveWorkId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveWorkId(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      const reordered = arrayMove(sections, oldIndex, newIndex);
      reorderNestedSections(sections[0]?.sectionHeader, reordered.map((s) => s.id));
    }
  };

  const activeWork = activeWorkId
    ? sections.find((s) => s.id === activeWorkId)
    : null;

  // ── Inline label editing state ──
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [tempLabel, setTempLabel] = useState(sectionLabel || "Work Experience");

  const handleLabelSave = () => {
    const newLabel = tempLabel.trim();
    if (newLabel !== "" && newLabel !== sectionLabel) {
      renameNestedGroup(sectionLabel || "Work Experience", newLabel);
    }
    setIsEditingLabel(false);
  };

  // ── Add-entry dialog state ──
  const [isAddWorkOpen, setIsAddWorkOpen] = useState(false);

  return (
    <div>
      {/* ── Group header: sticky bar with label, edit/delete, reorder toggle ── */}
      <div className="sticky -top-4 z-10 -mx-4 px-4">
        <div className="flex items-stretch rounded-xl border border-border/60 bg-background/50 backdrop-blur-md transition-all hover:bg-background/70 hover:border-muted-foreground/30">
          {dragHandleProps && (
            <DragHandle size="md" rounded="xl" {...dragHandleProps} />
          )}
          <button
            onClick={() => !isEditingLabel && onToggleGroup()}
            className={`flex items-center gap-2 flex-1 min-w-0 text-left py-2.5 pr-1 ${
              dragHandleProps ? "pl-1" : "pl-3"
            } ${isEditingLabel ? "cursor-default" : ""}`}
            aria-expanded={!isGroupCollapsed}
          >
            <motion.span
              animate={{ rotate: isGroupCollapsed ? 0 : 90 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className={`text-muted-foreground/60 shrink-0 ${isEditingLabel ? "opacity-0" : "opacity-100"}`}
            >
              <ChevronRight size={14} />
            </motion.span>

            {isEditingLabel ? (
              <div className="flex-1 flex items-center gap-2">
                <Input
                  value={tempLabel}
                  onChange={(e) => setTempLabel(e.target.value)}
                  className="h-7 text-sm font-semibold text-foreground/90 -ml-2 bg-background border-accent"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLabelSave();
                    if (e.key === "Escape") setIsEditingLabel(false);
                  }}
                />
                <IconButton onClick={handleLabelSave} label="Save" variant="primary" isActive>
                  <Check size={14} />
                </IconButton>
              </div>
            ) : (
              <span className="text-sm font-semibold text-foreground/90 truncate flex-1">
                {sectionLabel || "Work Experience"}
              </span>
            )}
          </button>

          {/* Toolbar: edit/delete (edit mode) or reorder toggle (normal mode).
              Hidden when group is collapsed, during section-level reorder, or while editing label. */}
          {!isGroupCollapsed && !dragHandleProps && !isEditingLabel && (
            <div className="flex items-center pr-2 gap-1">
              {isEditMode && (
                <>
                  <IconButton onClick={() => { setTempLabel(sectionLabel || "Work Experience"); setIsEditingLabel(true); }} label="Edit Label" variant="primary">
                    <Edit2 size={13} />
                  </IconButton>
                  <IconButton onClick={() => confirmDelete(
                    `Delete "${sectionLabel || "Work Experience"}" and all its entries?`,
                    () => deleteNestedGroup(sectionLabel || "Work Experience")
                  )} label="Delete Group" variant="destructive">
                    <Trash2 size={13} />
                  </IconButton>
                </>
              )}
              {!isEditMode && (
                <IconButton
                  onClick={onToggleReorderEntries}
                  label={isReorderingEntries ? "Done reordering" : "Reorder entries"}
                  isActive={isReorderingEntries}
                >
                  {isReorderingEntries ? <Check size={13} /> : <ArrowUpDown size={13} />}
                </IconButton>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Collapsible body: reorder mode vs. normal mode ── */}
      <Collapsible isOpen={!isGroupCollapsed}>
        <div className="pt-2 pl-3 ml-1 border-l border-border/20">
          {isReorderingEntries ? (
            /* Reorder mode: all entries collapsed with drag handles */
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-1.5">
                  {sections.map((section) => (
                    <SortableWrapper key={section.id} id={section.id} placeholderClassName="rounded-lg border-2 border-dashed border-accent/40 bg-accent/5 opacity-40 min-h-[36px]">
                      {(entryDragProps) => (
                        <WorkEntryHeader
                          company={section.company}
                          role={section.role}
                          isCollapsed={true}
                          onToggle={() => {}}
                          dragHandleProps={entryDragProps}
                          hideChevron
                          size="normal"
                        />
                      )}
                    </SortableWrapper>
                  ))}
                </div>
              </SortableContext>
              <DragOverlay
                dropAnimation={{ duration: 200, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}
              >
                {activeWork ? (
                  <DragGhost label={`${activeWork.company} — ${activeWork.role}`} fontWeight="medium" />
                ) : null}
              </DragOverlay>
            </DndContext>
          ) : (
            /* Normal mode: expandable entries with bullet/slot selectors */
            <div className="flex flex-col gap-1.5 pt-1">
              {isEditMode && (
                <div className="mb-2 pl-3 pb-1 border-b border-border/20">
                  <button
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md border border-accent/20 text-accent hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                    onClick={() => setIsAddWorkOpen(true)}
                  >
                    <Plus size={12} /> Add new subsection
                  </button>
                </div>
              )}

              {sections.map((section) => (
                <WorkEntryControl
                  key={section.id}
                  section={section}
                  isCollapsed={collapsedIds.has(section.id)}
                  onToggle={() => onToggleEntry(section.id)}
                />
              ))}
            </div>
          )}
        </div>
      </Collapsible>

      {confirmDialog}

      {/* ── Add-entry dialog (edit mode only) ── */}
      <NestedEntryEditDialog
        isOpen={isAddWorkOpen}
        onClose={() => setIsAddWorkOpen(false)}
        onSave={(company, role, dates) => addNestedEntry({
          type: "nested",
          id: `nested_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          sectionHeader: sectionLabel || "Work Experience",
          company,
          role,
          dates,
          bullets: [],
          activeBulletIds: []
        })}
        sectionLabel={sectionLabel}
      />
    </div>
  );
};
