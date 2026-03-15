import { useState, useEffect } from "react";
import type { ReactElement } from "react";
import { EditDialog } from "./EditDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AddSectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (label: string, type: "variant" | "nested") => void;
}

export function AddSectionDialog({
  isOpen,
  onClose,
  onSave,
}: AddSectionDialogProps): ReactElement {
  const [label, setLabel] = useState("");
  const [sectionType, setSectionType] = useState<"variant" | "nested">("variant");

  useEffect(() => {
    if (isOpen) {
      setLabel("");
      setSectionType("variant");
    }
  }, [isOpen]);

  const handleSave = () => {
    if (label.trim() === "") return;
    onSave(label.trim(), sectionType);
    onClose();
  };

  return (
    <EditDialog
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSave}
      title="Add New Section"
      saveLabel="Create Section"
      saveDisabled={label.trim() === ""}
    >
      <div className="grid gap-2">
        <Label htmlFor="section-label" className="text-sm font-medium text-neutral-300">
          Section Title
        </Label>
        <Input
          id="section-label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Certifications, Projects, Awards"
          className="bg-neutral-900 border-neutral-700 text-neutral-100 focus-visible:ring-accent placeholder:text-neutral-500"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
          }}
        />
      </div>

      <div className="grid gap-3">
        <Label className="text-sm font-medium text-neutral-300 flex items-center gap-1.5">
          Section Type
        </Label>
        <RadioGroup value={sectionType} onValueChange={(v) => setSectionType(v as "variant" | "nested")} className="flex flex-col gap-2">
          <Label
            htmlFor="type-variant"
            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${sectionType === 'variant' ? 'bg-accent/10 border-accent/50 text-accent/90' : 'bg-neutral-900 border-neutral-700 hover:bg-neutral-800 text-neutral-300'}`}
          >
            <RadioGroupItem value="variant" id="type-variant" className="mt-0.5 border-accent text-accent fill-accent" />
            <div className="flex flex-col gap-1">
              <div className={`font-medium inline-flex items-center gap-1.5 ${sectionType === 'variant' ? 'text-accent' : 'text-neutral-200'}`}>
                Standard Section
              </div>
              <div className="text-xs text-neutral-400/90 leading-relaxed font-normal">
                Simple blocks of text or lists (e.g., Skills, Education, Summary).
              </div>
            </div>
          </Label>
          <Label
            htmlFor="type-nested"
            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${sectionType === 'nested' ? 'bg-accent/10 border-accent/50 text-accent/90' : 'bg-neutral-900 border-neutral-700 hover:bg-neutral-800 text-neutral-300'}`}
          >
            <RadioGroupItem value="nested" id="type-nested" className="mt-0.5 border-accent text-accent fill-accent" />
            <div className="flex flex-col gap-1">
              <div className={`font-medium inline-flex items-center gap-1.5 ${sectionType === 'nested' ? 'text-accent' : 'text-neutral-200'}`}>
                Nested Section
              </div>
              <div className="text-xs text-neutral-400/90 leading-relaxed font-normal">
                Complex sections with roles/items and bullet points (e.g. Work Experience, Education).
              </div>
            </div>
          </Label>
        </RadioGroup>
      </div>
    </EditDialog>
  );
}
