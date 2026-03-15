import type { ReactElement } from "react";
import { GripVertical } from "lucide-react";

export const DragGhost = ({
  label,
  fontWeight = "semibold",
}: {
  label: string;
  fontWeight?: "semibold" | "medium";
}): ReactElement => (
  <div
    className="flex items-stretch rounded-xl border shadow-2xl ring-2 ring-accent/30
               border-accent/60 bg-background/80 backdrop-blur-xl text-sm"
  >
    <div className="flex items-center self-stretch px-3 shrink-0 text-accent">
      <GripVertical size={16} />
    </div>
    <div className="flex items-center py-2.5 pr-4 pl-1">
      <span className={`text-foreground ${fontWeight === "medium" ? "font-medium" : "font-semibold"}`}>
        {label}
      </span>
    </div>
  </div>
);
