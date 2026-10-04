"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { toast } from "@/components/admin/ui/toast";
import { cn } from "@/lib/utils/cn";

export type SortableItem = {
  id: string | number;
  [key: string]: unknown;
};

export type SortableListProps<T extends SortableItem> = {
  items: T[];
  onReorder: (ids: (string | number)[]) => Promise<{ ok: boolean } | void | unknown>;
  renderItem: (item: T, index: number, isDragging: boolean) => ReactNode;
  className?: string;
  disabled?: boolean;
};

type RowProps<T extends SortableItem> = {
  item: T;
  index: number;
  total: number;
  disabled?: boolean;
  onMove: (index: number, direction: -1 | 1) => void;
  renderItem: (item: T, index: number, isDragging: boolean) => ReactNode;
};

function SortableItemRow<T extends SortableItem>({
  item,
  index,
  total,
  disabled,
  onMove,
  renderItem,
}: RowProps<T>): React.JSX.Element {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 30 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex items-center gap-2 rounded-btn border border-s2 bg-cream p-2 transition-shadow",
        isDragging && "opacity-60 shadow-lg ring-2 ring-em7",
      )}
    >
      <div className="flex flex-none items-center gap-0.5">
        <button
          type="button"
          {...attributes}
          {...listeners}
          disabled={disabled}
          title="Drag to reorder"
          aria-label="Drag to reorder"
          className="flex size-8 cursor-grab items-center justify-center rounded-field text-ink6 hover:bg-s1 hover:text-ink active:cursor-grabbing disabled:opacity-30"
        >
          <span className="size-4">
            <AdminIcon name="drag" />
          </span>
        </button>
        <div className="flex flex-col">
          <button
            type="button"
            disabled={index === 0 || disabled}
            onClick={() => onMove(index, -1)}
            title="Move up"
            aria-label="Move item up"
            className="flex size-4 items-center justify-center text-ink6 hover:text-ink disabled:opacity-20 cursor-pointer"
          >
            <span className="size-3">
              <AdminIcon name="chevU" />
            </span>
          </button>
          <button
            type="button"
            disabled={index === total - 1 || disabled}
            onClick={() => onMove(index, 1)}
            title="Move down"
            aria-label="Move item down"
            className="flex size-4 items-center justify-center text-ink6 hover:text-ink disabled:opacity-20 cursor-pointer"
          >
            <span className="size-3">
              <AdminIcon name="chevD" />
            </span>
          </button>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        {renderItem(item, index, isDragging)}
      </div>
    </div>
  );
}

export function SortableList<T extends SortableItem>({
  items,
  onReorder,
  renderItem,
  className,
  disabled = false,
}: SortableListProps<T>): React.JSX.Element {
  const [order, setOrder] = useState<T[]>(items);

  useEffect(() => {
    setOrder(items);
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
  );

  const applyReorder = useCallback(
    async (nextOrder: T[], prevOrder: T[]) => {
      setOrder(nextOrder);
      try {
        const res = (await onReorder(nextOrder.map((x) => x.id))) as
          | { ok?: boolean }
          | undefined;
        if (res && typeof res.ok === "boolean" && !res.ok) {
          throw new Error("Failed to reorder");
        }
      } catch (err) {
        setOrder(prevOrder);
        toast.err("Failed to update order. Reverted.");
      }
    },
    [onReorder],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = order.findIndex((x) => x.id === active.id);
      const newIndex = order.findIndex((x) => x.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return;

      const next = arrayMove(order, oldIndex, newIndex);
      void applyReorder(next, order);
    },
    [order, applyReorder],
  );

  const handleMove = useCallback(
    (index: number, direction: -1 | 1) => {
      const target = index + direction;
      if (target < 0 || target >= order.length) return;

      const next = arrayMove(order, index, target);
      void applyReorder(next, order);
    },
    [order, applyReorder],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={order.map((x) => x.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={cn("space-y-2", className)}>
          {order.map((item, index) => (
            <SortableItemRow
              key={item.id}
              item={item}
              index={index}
              total={order.length}
              disabled={disabled}
              onMove={handleMove}
              renderItem={renderItem}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
