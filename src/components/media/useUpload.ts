"use client";

import { useState, useCallback } from "react";
import { prepareImage } from "@/lib/media/prepare-image";
import { createUploadAction, confirmUploadAction } from "@/server/media/actions";
import type { UploadPurpose } from "@/lib/validation/media";
import type { ErrorCode } from "@/lib/domain/errors";
import type { MediaRef } from "@/lib/domain/media";

export type UploadStatus =
  | "idle"
  | "preparing"
  | "uploading"
  | "confirming"
  | "done"
  | "error";

export type UploadState = {
  status: UploadStatus;
  progress: number;
  error: ErrorCode | null;
};

export type UploadResult = {
  mediaId: number;
  media: MediaRef | null;
  claimKey: string | null;
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

export function useUpload(purpose: UploadPurpose): {
  state: UploadState;
  upload: (file: File) => Promise<UploadResult | null>;
  reset: () => void;
} {
  const [state, setState] = useState<UploadState>({
    status: "idle",
    progress: 0,
    error: null,
  });

  const reset = useCallback((): void => {
    setState({
      status: "idle",
      progress: 0,
      error: null,
    });
  }, []);

  const upload = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      setState({ status: "preparing", progress: 0, error: null });

      try {
        let preparedFiles: {
          w: number;
          blob: Blob;
          type: "image/webp" | "image/jpeg" | "application/pdf";
          size: number;
        }[];
        let width: number | undefined;
        let height: number | undefined;
        let blur: string | undefined;

        if (purpose === "report") {
          if (
            file.type !== "application/pdf" &&
            !file.name.toLowerCase().endsWith(".pdf")
          ) {
            setState({ status: "error", progress: 0, error: "UPLOAD_INVALID" });
            return null;
          }
          if (file.size > 10 * 1024 * 1024) {
            setState({ status: "error", progress: 0, error: "UPLOAD_INVALID" });
            return null;
          }

          preparedFiles = [
            {
              w: 1,
              blob: file,
              type: "application/pdf",
              size: file.size,
            },
          ];
        } else {
          const preset =
            purpose === "palm" ? "palm" : purpose === "review" ? "review" : "public";
          const prepared = await prepareImage(file, preset);

          preparedFiles = prepared.files.map((f) => ({
            w: f.w,
            blob: f.blob,
            type: f.type as "image/webp" | "image/jpeg",
            size: f.blob.size,
          }));
          width = prepared.width;
          height = prepared.height;
          blur = prepared.blur ?? undefined;
        }

        const createRes = await createUploadAction({
          purpose,
          files: preparedFiles.map((f) => ({
            w: f.w,
            type: f.type,
            size: f.size,
          })),
          width,
          height,
          blur,
        });

        if (!createRes.ok) {
          setState({ status: "error", progress: 0, error: createRes.code });
          return null;
        }

        const { mediaId, uploads, claimKey } = createRes.data;

        setState({ status: "uploading", progress: 0, error: null });

        const fileProgress = new Array(uploads.length).fill(0);
        const totalBytes = preparedFiles.reduce((sum, f) => sum + f.size, 0);

        const updateOverallProgress = (index: number, loaded: number): void => {
          fileProgress[index] = loaded;
          const currentLoaded = fileProgress.reduce((sum, l) => sum + l, 0);
          const pct =
            totalBytes > 0
              ? Math.min(99, Math.round((currentLoaded / totalBytes) * 100))
              : 100;
          setState((prev) => ({ ...prev, progress: pct }));
        };

        await Promise.all(
          uploads.map((u, i) =>
            uploadXhr(u.url, preparedFiles[i]!.blob, u.type, (loaded) =>
              updateOverallProgress(i, loaded),
            ),
          ),
        );

        setState({ status: "confirming", progress: 100, error: null });

        const confirmRes = await confirmUploadAction({ mediaId });
        if (!confirmRes.ok) {
          setState({ status: "error", progress: 0, error: confirmRes.code });
          return null;
        }

        setState({ status: "done", progress: 100, error: null });
        return {
          mediaId,
          media: confirmRes.data.ref,
          claimKey,
        };
      } catch {
        setState({ status: "error", progress: 0, error: "UPLOAD_INVALID" });
        return null;
      }
    },
    [purpose],
  );

  return { state, upload, reset };
}
