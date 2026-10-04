"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sheet } from "@/components/admin/ui/Sheet";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { toast } from "@/components/admin/ui/toast";
import {
  createVideoAction,
  updateVideoAction,
  deleteVideoAction,
  reorderVideosAction,
  lookupYoutubeAction,
} from "@/server/videos/admin-actions";
import { SortableList } from "./SortableList";
import { VideoCategories } from "./VideoCategories";
import type { VideoAdminRow } from "@/server/videos/admin";
import type { VideoCategoryItem } from "@/lib/validation/content";
import type { VideoKind } from "@/lib/domain/enums";
import { cn } from "@/lib/utils/cn";

export type VideoFormProps = {
  video?: VideoAdminRow | null;
  defaultKind: VideoKind;
  categories: VideoCategoryItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function VideoForm({
  video,
  defaultKind,
  categories,
  open,
  onOpenChange,
  onSuccess,
}: VideoFormProps): React.JSX.Element {
  const isEdit = !!video;

  const [kind, setKind] = useState<VideoKind>(video?.kind ?? defaultKind);
  const [youtubeId, setYoutubeId] = useState(video?.youtubeId ?? "");
  const [category, setCategory] = useState(
    video?.category ?? categories[0]?.key ?? "pravachan",
  );
  const [titleEn, setTitleEn] = useState(video?.titleEn ?? "");
  const [titleHi, setTitleHi] = useState(video?.titleHi ?? "");
  const [descEn, setDescEn] = useState(video?.descEn ?? "");
  const [descHi, setDescHi] = useState(video?.descHi ?? "");
  const [duration, setDuration] = useState(video?.duration ?? "10:00");
  const [publishedOn, setPublishedOn] = useState(video?.publishedOn ?? "");
  const [featured, setFeatured] = useState(video?.featured ?? false);
  const [visible, setVisible] = useState(video?.visible ?? true);

  // Quick lookup state
  const [urlInput, setUrlInput] = useState("");
  const [lookingUp, setLookingUp] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (video) {
      setKind(video.kind);
      setYoutubeId(video.youtubeId ?? "");
      setCategory(video.category);
      setTitleEn(video.titleEn);
      setTitleHi(video.titleHi);
      setDescEn(video.descEn ?? "");
      setDescHi(video.descHi ?? "");
      setDuration(video.duration);
      setPublishedOn(video.publishedOn ?? "");
      setFeatured(video.featured);
      setVisible(video.visible);
    } else {
      setKind(defaultKind);
      setYoutubeId("");
      setCategory(categories[0]?.key ?? "pravachan");
      setTitleEn("");
      setTitleHi("");
      setDescEn("");
      setDescHi("");
      setDuration("10:00");
      setPublishedOn(new Date().toISOString().slice(0, 10));
      setFeatured(false);
      setVisible(true);
      setUrlInput("");
    }
  }, [video, defaultKind, categories, open]);

  const handleLookup = async (): Promise<void> => {
    if (!urlInput.trim()) {
      toast.err("Enter a YouTube URL or video ID first");
      return;
    }

    setLookingUp(true);
    try {
      const res = await lookupYoutubeAction(urlInput.trim());
      if (res.ok) {
        setYoutubeId(res.data.youtubeId);
        if (res.data.title && !titleEn) {
          setTitleEn(res.data.title);
        }
        if (res.data.title && !titleHi) {
          setTitleHi(res.data.title);
        }
        toast.ok("Fetched YouTube video info");
      } else {
        toast.err(res.message ?? "Could not find video details");
      }
    } catch {
      toast.err("Lookup failed");
    } finally {
      setLookingUp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!titleEn.trim() || !titleHi.trim()) {
      toast.err("Both English and Hindi titles are required");
      return;
    }

    setPending(true);
    try {
      const payload = {
        kind,
        youtubeId: youtubeId.trim() || null,
        category,
        titleEn: titleEn.trim(),
        titleHi: titleHi.trim(),
        descEn: descEn.trim() || null,
        descHi: descHi.trim() || null,
        duration: duration.trim(),
        publishedOn: publishedOn.trim() || null,
        featured,
        visible,
      };

      const res = isEdit
        ? await updateVideoAction(video.id, payload)
        : await createVideoAction(payload);

      if (res.ok) {
        toast.ok(isEdit ? "Video updated" : "Video created");
        onOpenChange(false);
        onSuccess();
      } else {
        toast.err(res.message ?? "Failed to save video");
      }
    } catch {
      toast.err("An error occurred");
    } finally {
      setPending(false);
    }
  };

  const previewThumbnail = youtubeId.trim()
    ? `https://i.ytimg.com/vi/${youtubeId.trim()}/mqdefault.jpg`
    : null;

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Video" : `Add New ${kind === "short" ? "Short" : "Video"}`}
      description="Add or edit video information and YouTube embed details"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Fast YouTube Import */}
        <div className="rounded-btn border border-g3/40 bg-g1/20 p-3">
          <label className="mb-1 block font-sans text-[11.5px] font-semibold text-g7 uppercase">
            Auto-fill from YouTube
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste YouTube watch link, shorts, or video ID"
              className="h-8 flex-1 rounded-field border border-s2 bg-cream px-2.5 font-sans text-[13px] text-ink outline-none focus:border-em7"
            />
            <button
              type="button"
              disabled={lookingUp}
              onClick={handleLookup}
              className="flex h-8 items-center gap-1.5 rounded-field bg-em9 px-3 font-sans text-[12px] font-semibold text-em1 hover:bg-em7 disabled:opacity-50 cursor-pointer"
            >
              {lookingUp ? (
                <span className="size-3 animate-spin rounded-full border border-current border-t-transparent" />
              ) : (
                <span className="size-3.5">
                  <AdminIcon name="search" />
                </span>
              )}
              <span>Lookup</span>
            </button>
          </div>
        </div>

        {/* Thumbnail preview */}
        {previewThumbnail && (
          <div className="flex items-center gap-3 rounded-btn border border-s2 bg-cream p-2">
            <img
              src={previewThumbnail}
              alt="Video thumbnail"
              className="h-16 w-24 rounded-field object-cover bg-s1"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            <div className="min-w-0 flex-1">
              <span className="font-mono text-[11px] font-semibold text-ink6">
                YouTube ID: {youtubeId}
              </span>
              <p className="truncate font-sans text-[13px] font-medium text-ink">
                {titleEn || "Title from YouTube"}
              </p>
            </div>
          </div>
        )}

        {/* Form Fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
              Type / Kind
            </label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as VideoKind)}
              className="h-9 w-full rounded-field border border-s2 bg-cream px-2 font-sans text-[13px] text-ink outline-none focus:border-em7 cursor-pointer"
            >
              <option value="video">Long Video</option>
              <option value="short">Short</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-9 w-full rounded-field border border-s2 bg-cream px-2 font-sans text-[13px] text-ink outline-none focus:border-em7 cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label.en}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
            YouTube Video ID (11 chars)
          </label>
          <input
            type="text"
            value={youtubeId}
            onChange={(e) => setYoutubeId(e.target.value)}
            placeholder="e.g. dQw4w9WgXcQ"
            className="h-9 w-full rounded-field border border-s2 bg-cream px-3 font-mono text-[13px] text-ink outline-none focus:border-em7"
          />
        </div>

        <div>
          <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
            English Title *
          </label>
          <input
            type="text"
            required
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            placeholder="Discourse title in English"
            className="h-9 w-full rounded-field border border-s2 bg-cream px-3 font-sans text-[13px] text-ink outline-none focus:border-em7"
          />
        </div>

        <div>
          <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
            Hindi Title *
          </label>
          <input
            type="text"
            required
            value={titleHi}
            onChange={(e) => setTitleHi(e.target.value)}
            placeholder="प्रवचन शीर्षक (हिंदी)"
            className="h-9 w-full rounded-field border border-s2 bg-cream px-3 font-deva text-[13px] text-ink outline-none focus:border-em7"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
              Duration (mm:ss) *
            </label>
            <input
              type="text"
              required
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 14:20"
              className="h-9 w-full rounded-field border border-s2 bg-cream px-3 font-sans text-[13px] text-ink outline-none focus:border-em7"
            />
          </div>

          <div>
            <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
              Published Date
            </label>
            <input
              type="date"
              value={publishedOn}
              onChange={(e) => setPublishedOn(e.target.value)}
              className="h-9 w-full rounded-field border border-s2 bg-cream px-3 font-sans text-[13px] text-ink outline-none focus:border-em7"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
            English Description
          </label>
          <textarea
            rows={2}
            value={descEn}
            onChange={(e) => setDescEn(e.target.value)}
            placeholder="Brief summary..."
            className="w-full rounded-field border border-s2 bg-cream p-2.5 font-sans text-[13px] text-ink outline-none focus:border-em7"
          />
        </div>

        <div>
          <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
            Hindi Description
          </label>
          <textarea
            rows={2}
            value={descHi}
            onChange={(e) => setDescHi(e.target.value)}
            placeholder="संक्षिप्त विवरण..."
            className="w-full rounded-field border border-s2 bg-cream p-2.5 font-deva text-[13px] text-ink outline-none focus:border-em7"
          />
        </div>

        <div className="flex items-center gap-6 border-t border-s2 pt-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="size-4 rounded-field accent-em7"
            />
            <span className="font-sans text-[13px] font-medium text-ink">
              Featured Video
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={visible}
              onChange={(e) => setVisible(e.target.checked)}
              className="size-4 rounded-field accent-em7"
            />
            <span className="font-sans text-[13px] font-medium text-ink">
              Visible on Storefront
            </span>
          </label>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 border-t border-s2 pt-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 rounded-btn border border-s2 px-4 font-sans text-[13px] font-medium text-ink hover:bg-s1 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="flex h-9 items-center gap-2 rounded-btn bg-em9 px-5 font-sans text-[13px] font-semibold text-em1 shadow-sm hover:bg-em7 disabled:opacity-50 cursor-pointer"
          >
            {pending && (
              <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            <span>{isEdit ? "Update Video" : "Create Video"}</span>
          </button>
        </div>
      </form>
    </Sheet>
  );
}

export function VideosManager({
  initialVideos,
  categories,
}: {
  initialVideos: VideoAdminRow[];
  categories: VideoCategoryItem[];
}): React.JSX.Element {
  const router = useRouter();
  const [tab, setTab] = useState<VideoKind>("video");
  const [formOpen, setFormOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoAdminRow | null>(null);

  const activeVideos = initialVideos.filter((v) => v.kind === tab);
  const videoCount = initialVideos.filter((v) => v.kind === "video").length;
  const shortCount = initialVideos.filter((v) => v.kind === "short").length;

  const handleEdit = (video: VideoAdminRow): void => {
    setSelectedVideo(video);
    setFormOpen(true);
  };

  const handleCreate = (): void => {
    setSelectedVideo(null);
    setFormOpen(true);
  };

  const handleDelete = async (id: number): Promise<boolean> => {
    try {
      const res = await deleteVideoAction(id);
      if (res.ok) {
        toast.ok("Video deleted");
        router.refresh();
        return true;
      }
      toast.err(res.message ?? "Failed to delete video");
      return false;
    } catch {
      toast.err("Failed to delete video");
      return false;
    }
  };

  const handleReorder = async (ids: (string | number)[]): Promise<{ ok: boolean }> => {
    const numIds = ids.map((id) => Number(id));
    const res = await reorderVideosAction(tab, numIds);
    if (res.ok) {
      toast.ok("Order updated");
      router.refresh();
      return { ok: true };
    }
    return { ok: false };
  };

  const catMap = new Map(categories.map((c) => [c.key, c.label.en]));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Videos & Discourses"
        description="Manage YouTube videos, Shorts, order on page, and video categories."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCategoriesOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-btn border border-s2 bg-cream px-3.5 font-sans text-[13px] font-semibold text-ink shadow-sm hover:bg-s1 cursor-pointer"
            >
              <span className="size-4 text-ink6">
                <AdminIcon name="tag" />
              </span>
              <span>Categories</span>
            </button>
            <button
              type="button"
              onClick={handleCreate}
              className="flex h-9 items-center gap-1.5 rounded-btn bg-em9 px-4 font-sans text-[13px] font-semibold text-em1 shadow-sm hover:bg-em7 cursor-pointer"
            >
              <span className="size-4">
                <AdminIcon name="plus" />
              </span>
              <span>Add {tab === "short" ? "Short" : "Video"}</span>
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-s2">
        <button
          type="button"
          onClick={() => setTab("video")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-5 py-3 font-sans text-[14px] font-semibold transition-colors cursor-pointer",
            tab === "video"
              ? "border-em7 text-em7"
              : "border-transparent text-ink6 hover:text-ink",
          )}
        >
          <span>Discourses / Long Videos</span>
          <span className="rounded-pill bg-s1 px-2 py-0.5 text-[11px] font-bold text-ink6">
            {videoCount}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setTab("short")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-5 py-3 font-sans text-[14px] font-semibold transition-colors cursor-pointer",
            tab === "short"
              ? "border-em7 text-em7"
              : "border-transparent text-ink6 hover:text-ink",
          )}
        >
          <span>YouTube Shorts</span>
          <span className="rounded-pill bg-s1 px-2 py-0.5 text-[11px] font-bold text-ink6">
            {shortCount}
          </span>
        </button>
      </div>

      {/* Reorderable List */}
      {activeVideos.length === 0 ? (
        <div className="rounded-btn border border-dashed border-s2 bg-cream p-12 text-center">
          <p className="font-sans text-[14px] text-ink6">
            No {tab === "short" ? "Shorts" : "videos"} added yet.
          </p>
          <button
            type="button"
            onClick={handleCreate}
            className="mt-3 inline-flex items-center gap-1.5 font-sans text-[13px] font-semibold text-em7 hover:underline cursor-pointer"
          >
            <span className="size-3.5">
              <AdminIcon name="plus" />
            </span>
            <span>Add the first one</span>
          </button>
        </div>
      ) : (
        <SortableList
          items={activeVideos}
          onReorder={handleReorder}
          renderItem={(item) => {
            const yt = item.youtubeId;
            const thumb = yt
              ? `https://i.ytimg.com/vi/${yt}/mqdefault.jpg`
              : null;

            return (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between py-1">
                <div className="flex min-w-0 items-center gap-3">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={item.titleEn}
                      className="h-12 w-20 flex-none rounded-field object-cover bg-s1"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-12 w-20 flex-none items-center justify-center rounded-field bg-s1 text-ink6">
                      <AdminIcon name="video" className="size-5" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-sans text-[14px] font-semibold text-ink">
                        {item.titleEn}
                      </p>
                      {item.featured && (
                        <StatusBadge tone="warn">Featured</StatusBadge>
                      )}
                      {!item.visible && (
                        <StatusBadge tone="muted">Hidden</StatusBadge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[12px] text-ink6">
                      <span className="font-deva text-[12.5px] truncate max-w-[200px]">
                        {item.titleHi}
                      </span>
                      <span>•</span>
                      <span className="rounded bg-s1 px-1.5 py-0.5 text-[11px] font-medium text-ink6">
                        {catMap.get(item.category) ?? item.category}
                      </span>
                      <span>•</span>
                      <span>{item.duration}</span>
                      {item.youtubeId && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-[11px]">
                            {item.youtubeId}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-none items-center gap-1.5 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="flex size-8 items-center justify-center rounded-field text-ink6 hover:bg-s1 hover:text-ink cursor-pointer"
                    title="Edit video"
                    aria-label="Edit video"
                  >
                    <span className="size-4">
                      <AdminIcon name="edit" />
                    </span>
                  </button>

                  <ConfirmDialog
                    trigger={
                      <button
                        type="button"
                        className="flex size-8 items-center justify-center rounded-field text-sin hover:bg-rose/40 cursor-pointer"
                        title="Delete video"
                        aria-label="Delete video"
                      >
                        <span className="size-4">
                          <AdminIcon name="trash" />
                        </span>
                      </button>
                    }
                    title="Delete Video"
                    body={`Are you sure you want to delete "${item.titleEn}"? This action cannot be undone.`}
                    confirmLabel="Delete"
                    tone="danger"
                    onConfirm={() => handleDelete(item.id)}
                  />
                </div>
              </div>
            );
          }}
        />
      )}

      {/* Video Form Sheet */}
      <VideoForm
        video={selectedVideo}
        defaultKind={tab}
        categories={categories}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={() => router.refresh()}
      />

      {/* Categories Sheet */}
      <VideoCategories
        initialCategories={categories}
        open={categoriesOpen}
        onOpenChange={setCategoriesOpen}
      />
    </div>
  );
}
