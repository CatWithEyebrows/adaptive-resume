import { useState, useEffect } from "react";
import type { ReactElement } from "react";
import { EditDialog } from "./EditDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NestedEntryEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (company: string, role: string, dates: string) => void;
  sectionLabel?: string;
}

export function NestedEntryEditDialog({
  isOpen,
  onClose,
  onSave,
  sectionLabel = "Work Experience",
}: NestedEntryEditDialogProps): ReactElement {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [dates, setDates] = useState("");

  useEffect(() => {
    if (isOpen) {
      setCompany("");
      setRole("");
      setDates("");
    }
  }, [isOpen]);

  const handleSave = () => {
    if (company.trim() === "" || role.trim() === "") return;
    onSave(company.trim(), role.trim(), dates.trim() || "Present");
    onClose();
  };

  return (
    <EditDialog
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSave}
      title={`Add ${sectionLabel}`}
      saveLabel="Create Entry"
      saveDisabled={company.trim() === "" || role.trim() === ""}
    >
      <div className="grid gap-2">
        <Label htmlFor="company" className="text-sm font-medium text-neutral-300">Company Name</Label>
        <Input
          id="company"
          value={company}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompany(e.target.value)}
          placeholder="e.g. Acme Corp"
          className="bg-neutral-900 border-neutral-700 text-neutral-100 focus-visible:ring-accent placeholder:text-neutral-500"
          autoFocus
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="role" className="text-sm font-medium text-neutral-300">Role / Title</Label>
        <Input
          id="role"
          value={role}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRole(e.target.value)}
          placeholder="e.g. Senior Software Engineer"
          className="bg-neutral-900 border-neutral-700 text-neutral-100 focus-visible:ring-accent placeholder:text-neutral-500"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="dates" className="text-sm font-medium text-neutral-300">Dates (Optional)</Label>
        <Input
          id="dates"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDates(e.target.value)}
          placeholder="e.g. Jan 2020 - Present"
          className="bg-neutral-900 border-neutral-700 text-neutral-100 focus-visible:ring-accent placeholder:text-neutral-500"
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") handleSave();
          }}
        />
      </div>
    </EditDialog>
  );
}
