import type { ReactElement, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
interface EditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  title: string;
  saveLabel?: string;
  saveDisabled?: boolean;
  maxWidth?: string;
  children: ReactNode;
}

export function EditDialog({
  isOpen,
  onClose,
  onSave,
  title,
  saveLabel = "Save",
  saveDisabled = false,
  maxWidth = "sm:max-w-md",
  children,
}: EditDialogProps): ReactElement {
  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent
        className={`${maxWidth} bg-neutral-950 text-neutral-100 border-neutral-800 shadow-2xl [&>button]:text-neutral-400 [&>button:hover]:text-neutral-100`}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight text-neutral-100">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-5 py-4">{children}</div>

        <DialogFooter className="sm:justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors bg-accent/20 text-accent hover:bg-accent/40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saveDisabled}
            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors bg-primary/90 text-primary-foreground shadow hover:bg-primary disabled:bg-primary/30 disabled:text-neutral-300 disabled:pointer-events-none"
          >
            {saveLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
