"use client";

import { useState } from "react";
import { AdminIcon } from "@/components/admin/AdminIcon";
import type { PalmPhotoSigned } from "@/server/bookings/admin";

export type PalmPhotosProps = {
  photos: PalmPhotoSigned[];
};

export function PalmPhotos({ photos }: PalmPhotosProps): React.JSX.Element {
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  if (!photos || photos.length === 0) {
    return (
      <div className="rounded-btn border border-s2 bg-cream p-4 text-center">
        <p className="font-sans text-[13px] text-ink6">
          No palm photos attached to this consultation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo, idx) => (
          <div
            key={photo.mediaId}
            className="group relative aspect-4/5 overflow-hidden rounded-btn border border-s2 bg-s1/20"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt={`Palm photo ${idx + 1}`}
              className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
            />

            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => setActivePhoto(photo.url)}
                className="inline-flex h-8 items-center gap-1.5 rounded-btn bg-cream px-3 font-sans text-[12px] font-semibold text-ink shadow-md hover:bg-s1 cursor-pointer"
              >
                <span className="size-3.5">
                  <AdminIcon name="zoom" />
                </span>
                <span>Enlarge</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Full Size Modal */}
      {activePhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setActivePhoto(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-btn bg-cream shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActivePhoto(null)}
              aria-label="Close photo preview"
              className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-black/60 text-cream hover:bg-black cursor-pointer"
            >
              <span className="size-4">
                <AdminIcon name="close" />
              </span>
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activePhoto}
              alt="Palm photo enlarged view"
              className="max-h-[85vh] max-w-[85vw] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
