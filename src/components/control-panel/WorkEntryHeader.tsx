import { useState } from "react";
import type { ReactElement } from "react";
import { useEditStore } from "@/store/useEditStore";
import { Input } from "@/components/ui/input";
import { IconButton } from "@/components/ui/IconButton";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DragHandle } from "@/components/ui/DragHandle";
import { ChevronRight, Check, Edit2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

/** Nested work entry header. */
export const WorkEntryHeader = ({
  company,
  role,
  isCollapsed,
  onToggle,
  dragHandleProps,
  hideChevron,
  size = "compact",
  onInfoChange,
  onDelete,
}: {
  company: string;
  role: string;
  isCollapsed: boolean;
  onToggle: () => void;
  dragHandleProps?: Record<string, unknown>;
  hideChevron?: boolean;
  size?: "compact" | "normal";
  onInfoChange?: (company: string, role: string) => void;
  onDelete?: () => void;
}): ReactElement => {
  const { isEditMode } = useEditStore();
  const [confirmDialog, confirmDelete] = useConfirmDialog();
  const [isEditing, setIsEditing] = useState(false);
  const [tempCompany, setTempCompany] = useState(company);
  const [tempRole, setTempRole] = useState(role);

  const handleSave = () => {
    if (onInfoChange && tempCompany.trim() !== "" && tempRole.trim() !== "") {
      onInfoChange(tempCompany.trim(), tempRole.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className="flex items-stretch rounded-lg border border-border/30 bg-muted/20 transition-all hover:bg-muted/40 hover:border-border/50">
      {dragHandleProps && (
        <DragHandle size="sm" rounded="lg" {...dragHandleProps} />
      )}
      <button
        onClick={() => !isEditing && onToggle()}
        className={`flex items-center gap-1.5 flex-1 min-w-0 text-left py-2 pr-3 ${
          dragHandleProps ? "pl-1" : "pl-2.5"
        } ${isEditing ? "cursor-default" : ""}`}
        aria-expanded={!isCollapsed}
      >
        {!hideChevron && (
          <motion.span
            animate={{ rotate: isCollapsed ? 0 : 90 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`text-muted-foreground/40 shrink-0 ${isEditing ? "opacity-0" : "opacity-100"}`}
          >
            <ChevronRight size={12} />
          </motion.span>
        )}

        {isEditing ? (
          <div className="flex-1 flex flex-col gap-1 -ml-1">
            <Input
              value={tempCompany}
              onChange={(e) => setTempCompany(e.target.value)}
              className="h-6 text-xs bg-background border-accent px-1"
              placeholder="Company"
            />
            <Input
              value={tempRole}
              onChange={(e) => setTempRole(e.target.value)}
              className="h-6 text-xs bg-background border-accent px-1"
              placeholder="Role"
            />
          </div>
        ) : (
          <span
            className={size === "compact"
              ? "text-xs font-medium text-foreground/70 truncate flex-1"
              : "text-sm font-medium text-foreground/70 flex-1"
            }
          >
            {company} — {role}
          </span>
        )}
      </button>

      {isEditing ? (
        <div className="flex items-center pr-2">
          <IconButton onClick={handleSave} label="Save" variant="primary" isActive>
            <Check size={12} />
          </IconButton>
        </div>
      ) : isEditMode && !dragHandleProps && (
        <div className="flex items-center pr-2 gap-1 border-l pl-1 border-border/40">
          {onInfoChange && (
            <IconButton onClick={() => setIsEditing(true)} label="Edit Role" variant="primary">
              <Edit2 size={12} />
            </IconButton>
          )}
          {onDelete && (
            <IconButton onClick={() => confirmDelete("Are you sure you want to delete this role?", onDelete)} label="Delete Entry" variant="destructive">
              <Trash2 size={12} />
            </IconButton>
          )}
        </div>
      )}
      {confirmDialog}
    </div>
  );
};
