import { useState, useEffect } from "react";
import { EditDialog } from "./EditDialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export interface ItemData {
  id?: string;
  label: string;
  content: string;
  tags?: string[];
}

interface BaseItemEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ItemData) => void;
  title: string;
  initialData?: ItemData;
  type: "variant" | "bullet";
}

export function BaseItemEditDialog({
  isOpen,
  onClose,
  onSave,
  title,
  initialData,
  type,
}: BaseItemEditDialogProps) {
  const [label, setLabel] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setLabel(initialData.label);
        setContent(initialData.content);
        setTags(initialData.tags?.join(", ") || "");
      } else {
        setLabel("");
        setContent("");
        setTags("");
      }
    }
  }, [isOpen, initialData]);

  const handleSave = () => {
    onSave({
      id: initialData?.id,
      label: label.trim(),
      content: content.trim(),
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
    onClose();
  };

  return (
    <EditDialog
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSave}
      title={title}
      saveLabel="Save"
      saveDisabled={!label || !content}
      maxWidth="sm:max-w-[425px]"
    >
      <div className="grid gap-2">
        <Label htmlFor="item-label" className="text-sm font-medium text-neutral-300">
          {type === "variant" ? "Label" : "Short Description"}
        </Label>
        <Input
          id="item-label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={type === "variant" ? "e.g. Frontend Focus" : "e.g. Performance Improvement"}
          className="bg-neutral-900 border-neutral-700 text-neutral-100 focus-visible:ring-accent placeholder:text-neutral-500"
          autoFocus
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="item-content" className="text-sm font-medium text-neutral-300">
          Content
        </Label>
        <Textarea
          id="item-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Full text content here..."
          className="min-h-[120px] bg-neutral-900 border-neutral-700 text-neutral-100 focus-visible:ring-accent placeholder:text-neutral-500"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="item-tags" className="text-sm font-medium text-neutral-300">Tags (comma separated)</Label>
        <Input
          id="item-tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="React, TypeScript, Optimization"
          className="bg-neutral-900 border-neutral-700 text-neutral-100 focus-visible:ring-accent placeholder:text-neutral-500"
        />
      </div>
    </EditDialog>
  );
}
