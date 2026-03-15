import { useState, useRef, useCallback, useEffect } from "react";
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
import { GripVertical, Edit2, Plus, Trash2 } from "lucide-react";
import { useEditStore } from "@/store/useEditStore";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import { BaseItemEditDialog } from "./BaseItemEditDialog";
import { Button } from "@/components/ui/button";

interface BulletSelectorProps {
  sectionId: string;
  slot: { bullets: Bullet[]; activeBulletIds: string[] };
  onToggle: (bulletId: string) => void;
  onReorder?: (bulletIds: string[]) => void;
  reorderMode?: boolean;
}

interface BulletCardProps {
  bullet: Bullet;
  isChecked: boolean;
  dragWidth?: number;
}

const OverlayCard = ({ bullet, isChecked, dragWidth }: BulletCardProps): ReactElement => (
  <div
    className={`flex items-start rounded-xl border shadow-2xl ring-2 ring-accent/30 border-accent/60 backdrop-blur-xl ${
      isChecked ? "bg-accent/20 bg-blend-overlay" : "bg-background/80"
    }`}
    style={{ width: dragWidth ? `${dragWidth}px` : "auto" }}
  >
    <div className="flex items-center self-stretch px-3 shrink-0 text-accent">
      <GripVertical size={16} />
    </div>
    <div className="flex items-start space-x-3 p-3 pl-1 flex-1 min-w-0">
      <Checkbox
        checked={isChecked}
        className="mt-1 shrink-0 pointer-events-none border-accent data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground"
        tabIndex={-1}
      />
      <div className="flex flex-col gap-1.5 text-sm leading-tight font-normal flex-1">
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

/** Static bullet item — checkbox + label, no drag. */
const StaticBulletItem = ({
  bullet,
  isChecked,
  onToggle,
  onEdit,
  onDelete,
}: {
  bullet: Bullet;
  isChecked: boolean;
  onToggle: (bulletId: string) => void;
  onEdit?: (bullet: Bullet) => void;
  onDelete?: (bulletId: string) => void;
}): ReactElement => {
  const { isEditMode } = useEditStore();
  const [confirmDialog, confirmDelete] = useConfirmDialog();

  return (
    <>
    <div
      className={`flex items-start rounded-xl border transition-all backdrop-blur-md ${
        isChecked
          ? "bg-accent/10 border-accent/30 shadow-sm"
          : "bg-background/40 border-border/50 hover:bg-background/60 hover:border-muted-foreground/30"
      }`}
    >
    <div className="flex items-start space-x-3 p-3 flex-1 min-w-0">
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

      {isEditMode && (
        <div className="flex flex-col gap-1 mt-1 mr-2">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground/60 hover:text-primary hover:bg-primary/10 shrink-0 self-start transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onEdit(bullet);
              }}
            >
              <Edit2 size={14} />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0 self-start transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                confirmDelete("Are you sure you want to delete this bullet?", () =>
                  onDelete(bullet.id)
                );
              }}
            >
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      )}
    </div>
  </div>
  {confirmDialog}
  </>
  );
};

/** Sortable bullet item — drag handle + checkbox, used in reorder mode. */
const SortableBulletItem = ({
  bullet,
  isChecked,
}: {
  bullet: Bullet;
  isChecked: boolean;
}): ReactElement => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: bullet.id });

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
        className="flex items-start space-x-3 p-3 rounded-xl border-2 border-dashed border-accent/40 bg-accent/5 opacity-40 min-h-[44px]"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-stretch rounded-xl border transition-all backdrop-blur-md ${
        isChecked
          ? "bg-accent/10 border-accent/30 shadow-sm"
          : "bg-background/40 border-border/50 hover:bg-background/60 hover:border-muted-foreground/30"
      }`}
    >
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
      <div className="flex items-start space-x-3 p-3 pl-1 flex-1 min-w-0">
        <Checkbox
          checked={isChecked}
          className="mt-1 shrink-0 pointer-events-none border-accent data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground"
          tabIndex={-1}
        />
        <div className="flex flex-col gap-1.5 text-sm leading-tight font-normal flex-1">
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
};

export const BulletSelector = ({
  sectionId,
  slot,
  onToggle,
  onReorder,
  reorderMode = false,
}: BulletSelectorProps): ReactElement => {
  const { isEditMode, addBullet, updateBullet, deleteBullet } = useEditStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragWidth, setDragWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const [editingBullet, setEditingBullet] = useState<Bullet | null>(null);
  const [isAddingMode, setIsAddingMode] = useState(false);

  const handleSaveBullet = (data: { id?: string; label: string; content: string; tags?: string[] }) => {
    if (editingBullet) {
      updateBullet(sectionId, editingBullet.id, {
        id: editingBullet.id,
        label: data.label,
        content: data.content,
        tags: data.tags || [],
      });
    } else {
      const newBullet: Bullet = {
        id: `bullet_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        label: data.label,
        content: data.content,
        tags: data.tags || [],
      };
      addBullet(sectionId, newBullet);
    }
  };

  // Auto-sort: keep refs to latest values so timers always read current state
  const bulletsRef = useRef(slot.bullets);
  const activeIdsRef = useRef(slot.activeBulletIds);
  const onReorderRef = useRef(onReorder);
  bulletsRef.current = slot.bullets;
  activeIdsRef.current = slot.activeBulletIds;
  onReorderRef.current = onReorder;

  const needsSortRef = useRef(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sortActiveFirst = useCallback(() => {
    const reorder = onReorderRef.current;
    if (!reorder) return;
    const bullets = bulletsRef.current;
    const activeIds = new Set(activeIdsRef.current);
    const active = bullets.filter((b) => activeIds.has(b.id));
    const inactive = bullets.filter((b) => !activeIds.has(b.id));
    const sorted = [...active, ...inactive];
    if (sorted.some((b, i) => b.id !== bullets[i].id)) {
      reorder(sorted.map((b) => b.id));
    }
    needsSortRef.current = false;
  }, []);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  const handleToggle = useCallback(
    (bulletId: string) => {
      onToggle(bulletId);
      needsSortRef.current = true;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        if (needsSortRef.current) sortActiveFirst();
      }, 5000);
    },
    [onToggle, sortActiveFirst]
  );

  const handleMouseLeave = useCallback(() => {
    if (needsSortRef.current) {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      sortActiveFirst();
    }
  }, [sortActiveFirst]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent): void => {
    const id = String(event.active.id);
    setActiveId(id);
    const activeNode = event.active.rect.current.initial;
    if (activeNode) setDragWidth(activeNode.width);
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

  if (reorderMode) {
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
          <div ref={containerRef} className="flex flex-col gap-2">
            {slot.bullets.map((bullet) => (
              <SortableBulletItem
                key={bullet.id}
                bullet={bullet}
                isChecked={slot.activeBulletIds.includes(bullet.id)}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay
          dropAnimation={{ duration: 200, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}
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
  }

  return (
    <>
      <div className="flex flex-col gap-3" onMouseLeave={handleMouseLeave}>
        {slot.bullets.map((bullet) => (
          <StaticBulletItem
            key={bullet.id}
            bullet={bullet}
            isChecked={slot.activeBulletIds.includes(bullet.id)}
            onToggle={handleToggle}
            onEdit={setEditingBullet}
            onDelete={() => deleteBullet(sectionId, bullet.id)}
          />
        ))}

        {isEditMode && (
          <div className="mt-1 mb-2 text-right">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs"
              onClick={() => setIsAddingMode(true)}
            >
              <Plus size={14} /> Add Bullet
            </Button>
          </div>
        )}
      </div>

      <BaseItemEditDialog
        isOpen={!!editingBullet || isAddingMode}
        onClose={() => {
          setEditingBullet(null);
          setIsAddingMode(false);
        }}
        onSave={handleSaveBullet}
        title={editingBullet ? "Edit Bullet" : "Add Bullet"}
        type="bullet"
        initialData={editingBullet ? { ...editingBullet } : undefined}
      />
    </>
  );
};
