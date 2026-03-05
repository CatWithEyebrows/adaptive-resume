import { useState, useRef } from "react";
import type { ReactElement, CSSProperties } from "react";
import type { Bullet } from "@/types/resume";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

/**
 * Props for the BulletSelector component.
 * @param slot - The bullet slot data containing bullets and active IDs.
 * @param onToggle - Callback when a bullet is toggled on/off.
 * @param onReorder - Optional callback when bullets are reordered via drag-and-drop.
 */
interface BulletSelectorProps {
  slot: { bullets: Bullet[]; activeBulletIds: string[] };
  onToggle: (bulletId: string) => void;
  onReorder?: (bulletIds: string[]) => void;
}

/**
 * Props for the inner sortable bullet item.
 */
interface SortableBulletItemProps {
  bullet: Bullet;
  isChecked: boolean;
  onToggle: (bulletId: string) => void;
}

/**
 * Props for the static bullet card used inside the DragOverlay.
 */
interface BulletCardProps {
  bullet: Bullet;
  isChecked: boolean;
  dragWidth?: number;
}

/**
 * A static card rendering used inside the DragOverlay ghost.
 * Width is constrained to match the original dragged item.
 *
 * @param bullet - The bullet data.
 * @param isChecked - Whether the bullet is currently active/checked.
 * @param dragWidth - The measured width of the original item to prevent resizing.
 * @returns A styled card representing the dragged bullet.
 */
const OverlayCard = ({ bullet, isChecked, dragWidth }: BulletCardProps): ReactElement => (
  <div
    className={`flex items-start rounded-xl border shadow-2xl ring-2 ring-accent/30 border-accent/60 text-sm backdrop-blur-xl ${
      isChecked ? "bg-accent/20 bg-blend-overlay" : "bg-background/80"
    }`}
    style={{ width: dragWidth ? `${dragWidth}px` : "auto" }}
  >
    {/* Drag handle visual */}
    <div className="flex items-center self-stretch px-3 shrink-0 text-accent">
      <GripVertical size={16} />
    </div>
    {/* Checkbox + label */}
    <div className="flex items-start space-x-3 p-3 pl-1 flex-1 min-w-0">
      <Checkbox
        checked={isChecked}
        className="mt-1 shrink-0 pointer-events-none border-accent data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground"
        tabIndex={-1}
      />
      <div className="flex flex-col gap-1.5 leading-tight font-normal flex-1">
        <div className="font-semibold text-foreground">{bullet.label}</div>
        <div
          className="text-muted-foreground text-xs leading-relaxed line-clamp-3"
          title={bullet.content}
        >
          {bullet.content}
        </div>
      </div>
    </div>
  </div>
);

/**
 * A sortable bullet item that integrates with @dnd-kit.
 * Uses plain div (no framer-motion layout) to avoid conflicts with dnd-kit transforms.
 * When actively dragged, renders as a dashed placeholder.
 *
 * @param bullet - The bullet data.
 * @param isChecked - Whether the bullet is currently active/checked.
 * @param onToggle - Toggle callback.
 * @returns A sortable, draggable bullet row.
 */
const SortableBulletItem = ({
  bullet,
  isChecked,
  onToggle,
}: SortableBulletItemProps): ReactElement => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: bullet.id });

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: transition ?? "transform 250ms ease",
    zIndex: isDragging ? 10 : undefined,
  };

  // When this item is the one being dragged, show a dashed placeholder
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-start space-x-3 p-3 rounded-xl border-2 border-dashed border-accent/40 bg-accent/5 opacity-40 min-h-[60px]"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start rounded-xl border transition-all backdrop-blur-md ${
        isChecked
          ? "bg-accent/10 border-accent/30 shadow-sm"
          : "bg-background/40 border-border/50 hover:bg-background/60 hover:border-muted-foreground/30"
      }`}
    >
      {/* Full-height drag handle strip */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center self-stretch px-3 cursor-grab active:cursor-grabbing 
                   text-muted-foreground hover:text-accent hover:bg-accent/10 
                   border-l-2 border-transparent hover:border-accent
                   rounded-l-xl transition-all duration-150 shrink-0 focus:outline-none"
        aria-label="Drag to reorder"
      >
        <GripVertical size={16} />
      </div>

      {/* Checkbox + Label area */}
      <div className="flex items-start space-x-3 p-3 pl-1 flex-1 min-w-0">
        <Checkbox
          id={bullet.id}
          checked={isChecked}
          onCheckedChange={() => onToggle(bullet.id)}
          className="mt-1 shrink-0 border-accent data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground"
        />
        <Label
          htmlFor={bullet.id}
          className="flex flex-col gap-1.5 cursor-pointer leading-tight font-normal flex-1"
        >
          <div className="font-semibold text-foreground">{bullet.label}</div>
          <div
            className="text-muted-foreground text-xs leading-relaxed line-clamp-3"
            title={bullet.content}
          >
            {bullet.content}
          </div>
        </Label>
      </div>
    </div>
  );
};

/**
 * BulletSelector renders a list of togglable, drag-and-drop–reorderable bullet items.
 * Uses @dnd-kit for sortable behavior. A DragOverlay renders a width-locked floating
 * ghost clone of the actively dragged item.
 *
 * @param slot - The bullet slot containing all bullets and the active bullet IDs.
 * @param onToggle - Callback fired when a bullet checkbox is toggled.
 * @param onReorder - Optional callback fired with the new ordered IDs after a drop.
 * @returns The sortable bullet list with drag overlay.
 */
export const BulletSelector = ({
  slot,
  onToggle,
  onReorder,
}: BulletSelectorProps): ReactElement => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragWidth, setDragWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent): void => {
    const id = String(event.active.id);
    setActiveId(id);

    // Measure the width of the active DOM node to lock overlay size
    const activeNode = event.active.rect.current.initial;
    if (activeNode) {
      setDragWidth(activeNode.width);
    }
  };

  const handleDragEnd = (event: DragEndEvent): void => {
    setActiveId(null);
    setDragWidth(0);
    const { active, over } = event;
    if (over && active.id !== over.id && onReorder) {
      const oldIndex = slot.bullets.findIndex((b: Bullet) => b.id === active.id);
      const newIndex = slot.bullets.findIndex((b: Bullet) => b.id === over.id);
      const newBullets = arrayMove(slot.bullets, oldIndex, newIndex);
      onReorder(newBullets.map((b: Bullet) => b.id));
    }
  };

  const activeBullet = activeId
    ? slot.bullets.find((b: Bullet) => b.id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={slot.bullets.map((b: Bullet) => b.id)}
        strategy={verticalListSortingStrategy}
      >
        <div ref={containerRef} className="flex flex-col gap-3">
          {slot.bullets.map((bullet) => {
            const isChecked = slot.activeBulletIds.includes(bullet.id);
            return (
              <SortableBulletItem
                key={bullet.id}
                bullet={bullet}
                isChecked={isChecked}
                onToggle={onToggle}
              />
            );
          })}
        </div>
      </SortableContext>

      {/* Floating ghost overlay — width-locked to the original item */}
      <DragOverlay
        dropAnimation={{
          duration: 200,
          easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
        }}
      >
        {activeBullet ? (
          <OverlayCard
            bullet={activeBullet}
            isChecked={slot.activeBulletIds.includes(activeBullet.id)}
            dragWidth={dragWidth}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
