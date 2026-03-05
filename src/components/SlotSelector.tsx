import { motion } from "framer-motion";
import type { Variant } from "@/types/resume";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface SlotSelectorProps {
  slot: { variants: Variant[]; activeVariantId: string };
  onChange: (variantId: string) => void;
}

export function SlotSelector({ slot, onChange }: SlotSelectorProps) {
  return (
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
          </motion.div>
        );
      })}
    </RadioGroup>
  );
}
