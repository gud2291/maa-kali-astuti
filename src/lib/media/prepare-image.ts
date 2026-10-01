function drawToCanvas(
  bitmap: ImageBitmap,
  targetW: number,
  targetH: number,
): OffscreenCanvas | HTMLCanvasElement {
  if (typeof OffscreenCanvas !== "undefined") {
    const canvas = new OffscreenCanvas(targetW, targetH);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("UPLOAD_INVALID");
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    return canvas;
  }
  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("UPLOAD_INVALID");
  ctx.drawImage(bitmap, 0, 0, targetW, targetH);
  return canvas;
}

async function canvasToBlob(
  canvas: OffscreenCanvas | HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  if ("convertToBlob" in canvas && typeof canvas.convertToBlob === "function") {
    return await canvas.convertToBlob({ type, quality });
  }
  return new Promise<Blob>((resolve, reject) => {
    (canvas as HTMLCanvasElement).toBlob(
      (blob) => {
        if (!blob) reject(new Error("UPLOAD_INVALID"));
        else resolve(blob);
      },
      type,
      quality,
    );
  });
}

export async function prepareImage(
  file: File,
  preset: "public" | "review" | "palm",
): Promise<{
  files: { w: number; h: number; blob: Blob; type: string }[];
  width: number;
  height: number;
  blur: string | null;
}> {
  if (!file.type.startsWith("image/") || file.size > 15 * 1024 * 1024) {
    throw new Error("UPLOAD_INVALID");
  }

  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const origW = bitmap.width;
  const origH = bitmap.height;

  try {
    if (preset === "palm") {
      let palmW = origW;
      let palmH = origH;
      const maxSide = Math.max(origW, origH);
      if (maxSide > 2000) {
        const scale = 2000 / maxSide;
        palmW = Math.round(origW * scale);
        palmH = Math.round(origH * scale);
      }

      const canvas = drawToCanvas(bitmap, palmW, palmH);
      const blob = await canvasToBlob(canvas, "image/jpeg", 0.85);

      return {
        files: [{ w: palmW, h: palmH, blob, type: "image/jpeg" }],
        width: origW,
        height: origH,
        blur: null,
      };
    }

    const targetWidths = preset === "public" ? [480, 960, 1600] : [480, 960];
    const uniqueWidths = Array.from(
      new Set(targetWidths.map((w) => Math.min(w, origW))),
    ).sort((a, b) => a - b);

    const files: { w: number; h: number; blob: Blob; type: string }[] = [];

    for (const w of uniqueWidths) {
      const h = Math.round((w / origW) * origH);
      const canvas = drawToCanvas(bitmap, w, h);
      let blob = await canvasToBlob(canvas, "image/webp", 0.82);
      let finalType = blob.type;

      if (finalType !== "image/webp") {
        blob = await canvasToBlob(canvas, "image/jpeg", 0.85);
        finalType = blob.type === "image/webp" ? "image/webp" : "image/jpeg";
      }

      files.push({ w, h, blob, type: finalType });
    }

    let blur: string | null = null;
    const blurW = 16;
    const blurH = Math.max(1, Math.round((blurW / origW) * origH));
    const blurCanvas = drawToCanvas(bitmap, blurW, blurH);
    let dataUrl: string | null = null;

    if ("toDataURL" in blurCanvas && typeof blurCanvas.toDataURL === "function") {
      dataUrl = blurCanvas.toDataURL("image/webp", 0.5);
    } else if (
      "convertToBlob" in blurCanvas &&
      typeof blurCanvas.convertToBlob === "function"
    ) {
      const blurBlob = await blurCanvas.convertToBlob({
        type: "image/webp",
        quality: 0.5,
      });
      const buffer = await blurBlob.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]!);
      }
      dataUrl = `data:${blurBlob.type};base64,${btoa(binary)}`;
    }

    if (dataUrl && dataUrl.length <= 600) {
      blur = dataUrl;
    }

    return {
      files,
      width: origW,
      height: origH,
      blur,
    };
  } finally {
    if (typeof bitmap.close === "function") {
      bitmap.close();
    }
  }
}
