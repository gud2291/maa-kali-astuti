"use client";

import { useState, useRef, useCallback } from "react";
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
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { prepareImage } from "@/lib/media/prepare-image";
import { createUploadAction, confirmUploadAction } from "@/server/media/actions";
import { toast } from "@/components/admin/ui/toast";
import { errorText } from "@/components/admin/errors";
import { cn } from "@/lib/utils/cn";
import type { MediaRef } from "@/lib/domain/media";
import type { UploadPurpose } from "@/lib/validation/media";

export type ImageManagerProps = {
  value: MediaRef[];
  onChange: (next: MediaRef[]) => void;
  max?: number;
  purpose?: UploadPurpose;
  disabled?: boolean;
};

type UploadingItem = {
  id: string;
  name: string;
  progress: number;
  status: "pending" | "uploading" | "confirming" | "error";
  error?: string;
};

function uploadXhr(
  url: string,
  blob: Blob,
  contentType: string,
  onProgress: (loaded: number) => void,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(e.loaded);
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.ontimeout = () => reject(new Error("Timeout"));
    xhr.send(blob);
  });
}

function SortableItem({
  item,
  index,
  isMain,
  canMoveLeft,
  canMoveRight,
  onMoveLeft,
  onMoveRight,
  onRemove,
  disabled,
}: {
  item: MediaRef;
  index: number;
  isMain: boolean;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onRemove: () => void;
  disabled?: boolean;
}): React.JSX.Element {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 30 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex aspect-square flex-col overflow-hidden rounded-btn border border-s2 bg-cream shadow-xs transition-shadow hover:shadow-md",
        isDragging && "ring-2 ring-em7 shadow-lg",
      )}
    >
      {/* Draggable preview area */}
      <div
        {...attributes}
        {...listeners}
        className="relative flex-1 cursor-grab active:cursor-grabbing overflow-hidden bg-s1"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.src}
          alt={item.alt?.en ?? `Image ${index + 1}`}
          className="size-full object-cover select-none pointer-events-none"
        />

        {isMain && (
          <span className="absolute top-2 left-2 rounded-pill bg-em7 px-2 py-0.5 font-sans text-[11px] font-semibold text-iv shadow-xs">
            Main
          </span>
        )}
      </div>

      {/* Action controls footer */}
      {!disabled && (
        <div className="flex h-9 items-center justify-between border-t border-s2 bg-cream px-1.5 py-1">
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              disabled={!canMoveLeft}
              onClick={onMoveLeft}
              title="Move left"
              aria-label="Move photo left"
              className="flex size-7 items-center justify-center rounded-field text-ink6 transition-colors hover:bg-s1 hover:text-ink disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <span className="size-3.5">
                <AdminIcon name="chevL" />
              </span>
            </button>
            <button
              type="button"
              disabled={!canMoveRight}
              onClick={onMoveRight}
              title="Move right"
              aria-label="Move photo right"
              className="flex size-7 items-center justify-center rounded-field text-ink6 transition-colors hover:bg-s1 hover:text-ink disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <span className="size-3.5">
                <AdminIcon name="chevR" />
              </span>
            </button>
          </div>

          <ConfirmDialog
            title="Remove photo?"
            body="Are you sure you want to remove this photo? Any changes will be applied when saving the product."
            confirmLabel="Remove"
            tone="danger"
            onConfirm={async () => {
              onRemove();
              return true;
            }}
            trigger={
              <button
                type="button"
                title="Remove photo"
                aria-label="Remove photo"
                className="flex size-7 items-center justify-center rounded-field text-sin transition-colors hover:bg-rose/40 cursor-pointer"
              >
                <span className="size-3.5">
                  <AdminIcon name="trash" />
                </span>
              </button>
            }
          />
        </div>
      )}
    </div>
  );
}

export function ImageManager({
  value = [],
  onChange,
  max = 12,
  purpose = "product",
  disabled = false,
}: ImageManagerProps): React.JSX.Element {
  const [uploadingQueue, setUploadingQueue] = useState<UploadingItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
  );

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = value.findIndex((m) => m.id === active.id);
      const newIndex = value.findIndex((m) => m.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        onChange(arrayMove(value, oldIndex, newIndex));
      }
    }
  };

  const moveItem = (index: number, direction: -1 | 1): void => {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    onChange(arrayMove(value, index, target));
  };

  const removeItem = (index: number): void => {
    onChange(value.filter((_, i) => i !== index));
  };

  const uploadSingleFile = useCallback(
    async (file: File, itemId: string): Promise<MediaRef | null> => {
      try {
        setUploadingQueue((prev) =>
          prev.map((it) =>
            it.id === itemId ? { ...it, status: "uploading", progress: 5 } : it,
          ),
        );

        const preset =
          purpose === "palm"
            ? "palm"
            : purpose === "review"
              ? "review"
              : "public";
        const prepared = await prepareImage(file, preset);

        const preparedFiles = prepared.files.map((f) => ({
          w: f.w,
          blob: f.blob,
          type: f.type as "image/webp" | "image/jpeg",
          size: f.blob.size,
        }));

        const createRes = await createUploadAction({
          purpose,
          files: preparedFiles.map((f) => ({
            w: f.w,
            type: f.type,
            size: f.size,
          })),
          width: prepared.width,
          height: prepared.height,
          blur: prepared.blur ?? undefined,
        });

        if (!createRes.ok) {
          throw new Error(errorText(createRes.code));
        }

        const { mediaId, uploads } = createRes.data;

        const fileProgress = new Array(uploads.length).fill(0);
        const totalBytes = preparedFiles.reduce((sum, f) => sum + f.size, 0);

        await Promise.all(
          uploads.map((u, i) =>
            uploadXhr(u.url, preparedFiles[i]!.blob, u.type, (loaded) => {
              fileProgress[i] = loaded;
              const currentLoaded = fileProgress.reduce((sum, l) => sum + l, 0);
              const pct =
                totalBytes > 0
                  ? Math.min(95, Math.round((currentLoaded / totalBytes) * 100))
                  : 95;
              setUploadingQueue((prev) =>
                prev.map((it) =>
                  it.id === itemId ? { ...it, progress: pct } : it,
                ),
              );
            }),
          ),
        );

        setUploadingQueue((prev) =>
          prev.map((it) =>
            it.id === itemId ? { ...it, status: "confirming", progress: 98 } : it,
          ),
        );

        const confirmRes = await confirmUploadAction({ mediaId });
        if (!confirmRes.ok) {
          throw new Error(errorText(confirmRes.code));
        }
        if (!confirmRes.data.ref) {
          throw new Error(errorText("UPLOAD_INVALID"));
        }

        return confirmRes.data.ref;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        setUploadingQueue((prev) =>
          prev.map((it) =>
            it.id === itemId ? { ...it, status: "error", error: msg } : it,
          ),
        );
        toast.err(`Upload failed for ${file.name}: ${msg}`);
        return null;
      }
    },
    [purpose],
  );

  const handleFilesChosen = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const availableSlots = max - value.length;
    if (availableSlots <= 0) {
      toast.info(`Maximum of ${max} photos reached`);
      return;
    }

    const filesToUpload = Array.from(fileList).slice(0, availableSlots);
    if (fileList.length > availableSlots) {
      toast.info(`Only uploading first ${availableSlots} files (limit ${max})`);
    }

    // Reset input so re-selecting same file triggers change
    e.target.value = "";

    const newQueueItems: UploadingItem[] = filesToUpload.map((f, i) => ({
      id: `up-${Date.now()}-${i}`,
      name: f.name,
      progress: 0,
      status: "pending",
    }));

    setUploadingQueue((prev) => [...prev, ...newQueueItems]);

    // Process files with max concurrency of 2
    const queue = filesToUpload.map((f, i) => ({
      file: f,
      queueId: newQueueItems[i]!.id,
    }));

    let currentMediaList = [...value];
    let cursor = 0;

    const worker = async (): Promise<void> => {
      while (cursor < queue.length) {
        const item = queue[cursor];
        cursor++;
        if (!item) break;

        const mediaRef = await uploadSingleFile(item.file, item.queueId);
        if (mediaRef) {
          currentMediaList = [...currentMediaList, mediaRef];
          onChange(currentMediaList);
          // Remove from uploading queue after success
          setUploadingQueue((prev) => prev.filter((it) => it.id !== item.queueId));
        }
      }
    };

    // Run 2 workers in parallel
    await Promise.all([worker(), worker()]);
  };

  const canAddMore = value.length < max && !disabled;

  return (
    <div className="space-y-4">
      {/* File input (accept image/* brings up camera or gallery on mobile) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={max > 1}
        disabled={disabled}
        onChange={handleFilesChosen}
        className="hidden"
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={value.map((m) => m.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {value.map((item, index) => (
              <SortableItem
                key={item.id}
                item={item}
                index={index}
                isMain={index === 0}
                canMoveLeft={index > 0}
                canMoveRight={index < value.length - 1}
                onMoveLeft={() => moveItem(index, -1)}
                onMoveRight={() => moveItem(index, 1)}
                onRemove={() => removeItem(index)}
                disabled={disabled}
              />
            ))}

            {/* Uploading progress tiles */}
            {uploadingQueue.map((item) => (
              <div
                key={item.id}
                className="relative flex aspect-square flex-col items-center justify-center rounded-btn border border-dashed border-em7/40 bg-em1/30 p-2 text-center"
              >
                <div className="mb-2 size-6 animate-spin rounded-full border-2 border-em7 border-t-transparent" />
                <span className="font-sans text-[12px] font-semibold text-em7">
                  {item.status === "confirming" ? "Finishing..." : `${item.progress}%`}
                </span>
                <span className="mt-1 line-clamp-1 max-w-full font-sans text-[11px] text-ink6">
                  {item.name}
                </span>
              </div>
            ))}

            {/* Add photos button tile */}
            {canAddMore && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group flex aspect-square flex-col items-center justify-center rounded-btn border-2 border-dashed border-s2 bg-cream/60 p-4 text-center transition-all hover:border-em7/60 hover:bg-cream cursor-pointer"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-s1 text-ink6 transition-colors group-hover:bg-em1 group-hover:text-em7">
                  <span className="size-5">
                    <AdminIcon name="plus" />
                  </span>
                </span>
                <span className="mt-2 font-sans text-[13px] font-semibold text-ink group-hover:text-em7">
                  Add photos
                </span>
                <span className="mt-0.5 font-sans text-[11px] text-ink6">
                  Camera or gallery ({value.length}/{max})
                </span>
              </button>
            )}
          </div>
        </SortableContext>
      </DndContext>

      {value.length === 0 && uploadingQueue.length === 0 && (
        <p className="font-sans text-[13px] text-ink6">
          No photos added yet. The first photo will be used as the main product thumbnail.
        </p>
      )}
    </div>
  );
}
