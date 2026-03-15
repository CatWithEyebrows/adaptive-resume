import type { ReactElement, CSSProperties } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const SortableWrapper = ({
  id,
  placeholderClassName = "rounded-xl border-2 border-dashed border-accent/40 bg-accent/5 opacity-40 min-h-[44px]",
  children,
}: {
  id: string;
  placeholderClassName?: string;
  children: (dragHandleProps: Record<string, unknown>) => React.ReactNode;
}): ReactElement => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: transition ?? undefined,
    zIndex: isDragging ? 10 : undefined,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={placeholderClassName}
      />
    );
  }

  return (
    <div ref={setNodeRef} style={style}>
      {children({ ...attributes, ...listeners })}
    </div>
  );
};
