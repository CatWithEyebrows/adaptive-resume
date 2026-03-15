import { useState, useCallback, useRef } from "react";
import type { ReactElement } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Button } from "./button";

/**
 * Hook that replaces raw `confirm()` calls with a styled dialog.
 *
 * Usage:
 *   const [confirmDialog, confirmDelete] = useConfirmDialog();
 *   // ...
 *   <IconButton onClick={() => confirmDelete("Delete this?", onDelete)} />
 *   {confirmDialog}
 */
export function useConfirmDialog(): [
  ReactElement,
  (message: string, onConfirm: () => void) => void,
] {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const onConfirmRef = useRef<(() => void) | null>(null);

  const trigger = useCallback((msg: string, onConfirm: () => void) => {
    setMessage(msg);
    onConfirmRef.current = onConfirm;
    setOpen(true);
  }, []);

  const handleConfirm = () => {
    setOpen(false);
    onConfirmRef.current?.();
  };

  const dialog = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[400px] bg-neutral-950 text-neutral-100 border-neutral-800 shadow-2xl [&>button]:text-neutral-400 [&>button:hover]:text-neutral-100">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-neutral-100">Confirm</DialogTitle>
          <DialogDescription className="text-neutral-400">{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors bg-accent/20 text-accent hover:bg-accent/30"
          >
            Cancel
          </button>
          <Button variant="destructive" onClick={handleConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return [dialog, trigger];
}
