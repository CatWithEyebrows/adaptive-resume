import type { ReactElement } from "react";
import { GripVertical } from "lucide-react";

/** Drag handle with grip icon, cursor-grab styling, and accent hover. */
export const DragHandle = ({
  size = "md",
  rounded = "xl",
  ...props
}: {
  size?: "sm" | "md";
  rounded?: "lg" | "xl";
} & Record<string, unknown>): ReactElement => (
  <div
    {...props}
    className={`flex items-center self-stretch cursor-grab active:cursor-grabbing
               text-muted-foreground hover:text-accent hover:bg-accent/10
               border-l-2 border-transparent hover:border-accent
               transition-all duration-150 shrink-0 focus:outline-none
               ${size === "sm" ? "px-2" : "px-2.5"}
               ${rounded === "lg" ? "rounded-l-lg" : "rounded-l-xl"}`}
    aria-label="Drag to reorder"
  >
    <GripVertical size={size === "sm" ? 14 : 16} />
  </div>
);
