import { useState } from "react";
import type { ReactElement } from "react";
import { useEditStore } from "@/store/useEditStore";
import { Input } from "@/components/ui/input";
import { IconButton } from "@/components/ui/IconButton";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DragHandle } from "@/components/ui/DragHandle";
import { ChevronRight, Check, Edit2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

/** Top-level section header. Shows drag handle only in reorder mode. */
export const TopLevelHeader = ({
  label,
  isCollapsed,
  onToggle,
  dragHandleProps,
  hideChevron,
  onLabelChange,
  onDelete,
}: {
  label: string;
  isCollapsed: boolean;
  onToggle: () => void;
  dragHandleProps?: Record<string, unknown>;
  hideChevron?: boolean;
  onLabelChange?: (newLabel: string) => void;
  onDelete?: () => void;
}): ReactElement => {
  const { isEditMode } = useEditStore();
  const [confirmDialog, confirmDelete] = useConfirmDialog();
  const [isEditing, setIsEditing] = useState(false);
  const [tempLabel, setTempLabel] = useState(label);

  const handleSave = () => {
    if (onLabelChange && tempLabel.trim() !== "") {
      onLabelChange(tempLabel.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className="flex items-stretch rounded-xl border border-border/60 bg-background/50 backdrop-blur-md transition-all hover:bg-background/70 hover:border-muted-foreground/30">
      {dragHandleProps && (
        <DragHandle size="md" rounded="xl" {...dragHandleProps} />
      )}
      <button
        onClick={() => !isEditing && onToggle()}
        className={`flex items-center gap-2 flex-1 min-w-0 text-left py-2.5 pr-3 ${
          dragHandleProps ? "pl-1" : "pl-3"
        } ${isEditing ? "cursor-default" : ""}`}
        aria-expanded={!isCollapsed}
      >
        {!hideChevron && (
          <motion.span
            animate={{ rotate: isCollapsed ? 0 : 90 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`text-muted-foreground/60 shrink-0 ${isEditing ? "opacity-0" : "opacity-100"}`}
          >
            <ChevronRight size={14} />
          </motion.span>
        )}

        {isEditing ? (
          <div className="flex-1 flex items-center gap-2">
            <Input
              value={tempLabel}
              onChange={(e) => setTempLabel(e.target.value)}
              className="h-7 text-sm font-semibold text-foreground/90 -ml-2 bg-background border-accent"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") setIsEditing(false);
              }}
            />
            <IconButton onClick={handleSave} label="Save" variant="primary" isActive>
              <Check size={14} />
            </IconButton>
          </div>
        ) : (
          <span className="flex-1 text-sm font-semibold text-foreground/90 truncate">{label}</span>
        )}
      </button>

      {isEditMode && !isEditing && !dragHandleProps && (
        <div className="flex items-center pr-2 gap-1">
          {onLabelChange && (
            <IconButton onClick={() => setIsEditing(true)} label="Edit Label" variant="primary">
              <Edit2 size={13} />
            </IconButton>
          )}
          {onDelete && (
            <IconButton onClick={() => confirmDelete("Are you sure you want to delete this section?", onDelete)} label="Delete Section" variant="destructive">
              <Trash2 size={13} />
            </IconButton>
          )}
        </div>
      )}
      {confirmDialog}
    </div>
  );
};
