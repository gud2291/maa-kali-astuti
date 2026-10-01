"use client";

import { useEffect } from "react";
import { useHistory } from "@/stores/history";

export function TrackView({ productId }: { productId: string }) {
  useEffect(() => {
    if (productId) {
      useHistory.getState().view(productId);
    }
  }, [productId]);

  return null;
}
