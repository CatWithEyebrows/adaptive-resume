import { useState } from "react";
import { motion } from "framer-motion";
import type { Variant } from "@/types/resume";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BaseItemEditDialog } from "./BaseItemEditDialog";
import { useEditStore } from "@/store/useEditStore";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Edit2, Plus, Trash2 } from "lucide-react";

interface SlotSelectorProps {
  sectionId: string;
  isIntro?: boolean;
  slot: { variants: Variant[]; activeVariantId: string };
  onChange: (variantId: string) => void;
}

export function SlotSelector({ sectionId, isIntro, slot, onChange }: SlotSelectorProps) {
  const { isEditMode, addVariant, updateVariant, deleteVariant } = useEditStore();
  const [confirmDialog, confirmDelete] = useConfirmDialog();
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [isAddingMode, setIsAddingMode] = useState(false);

  const handleSaveVariant = (data: { id?: string; label: string; content: string; tags?: string[] }) => {
    if (editingVariant) {
      // Update
      updateVariant(sectionId, editingVariant.id, {
        id: editingVariant.id,
        label: data.label,
        content: data.content,
        tags: data.tags || [],
      }, isIntro);
    } else {
      // Add
      const newVariant: Variant = {
        id: `variant_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        label: data.label,
        content: data.content,
        tags: data.tags || [],
      };
      addVariant(sectionId, newVariant, isIntro);
    }
  };

  return (
    <>
      <RadioGroup
        value={slot.activeVariantId}
        onValueChange={onChange}
        className="flex flex-col gap-3"
      >
      {slot.variants.map((variant) => {
        const isActive = variant.id === slot.activeVariantId;
        return (
          <motion.div 
            key={variant.id} 
            className={`flex items-start space-x-3 p-3 rounded-xl border transition-all backdrop-blur-md ${
              isActive 
                ? 'bg-primary/10 border-primary/30 shadow-sm' 
                : 'bg-background/40 border-border/50 hover:bg-background/60 hover:border-muted-foreground/30'
            }`}
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.99 }}
            layout
          >
            <RadioGroupItem value={variant.id} id={variant.id} className="mt-1 shrink-0" />
            <Label
              htmlFor={variant.id}
              className="flex flex-col gap-1.5 cursor-pointer leading-tight font-normal flex-1"
            >
              <div className="font-semibold text-foreground">{variant.label}</div>
              <div className="text-muted-foreground text-xs leading-relaxed">{variant.content}</div>
            </Label>
            
            {isEditMode && (
              <div className="flex flex-col gap-1 mt-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground/60 hover:text-primary hover:bg-primary/10 shrink-0 self-start transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setEditingVariant(variant);
                  }}
                >
                  <Edit2 size={14} />
                </Button>
                {slot.variants.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0 self-start transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      confirmDelete("Are you sure you want to delete this variant?", () =>
                        deleteVariant(sectionId, variant.id, isIntro)
                      );
                    }}
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        );
      })}
      </RadioGroup>

      {isEditMode && (
        <div className="mt-2 text-right">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-xs"
            onClick={() => setIsAddingMode(true)}
          >
            <Plus size={14} /> Add Variant
          </Button>
        </div>
      )}

      {/* Reusable dialog for edit / add */}
      <BaseItemEditDialog
        isOpen={!!editingVariant || isAddingMode}
        onClose={() => {
          setEditingVariant(null);
          setIsAddingMode(false);
        }}
        onSave={handleSaveVariant}
        title={editingVariant ? "Edit Variant" : "Add Variant"}
        type="variant"
        initialData={editingVariant ? { ...editingVariant } : undefined}
      />
      {confirmDialog}
    </>
  );
}
