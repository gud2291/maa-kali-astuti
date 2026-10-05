"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/stores/cart";
import { useCatalog } from "@/stores/catalog";
import { Icon } from "@/components/icons/Icon";
import { buttonClass } from "@/components/ui/Button";
import type { WristSize } from "@/lib/domain/enums";

export function ReorderButton({
  items,
  locale = "en",
}: {
  items: {
    productId: string;
    variant: WristSize | null;
    qty: number;
    energName?: string | null;
    energGotra?: string | null;
  }[];
  locale?: string;
}): React.JSX.Element {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const catalog = useCatalog();
  const [loading, setLoading] = useState(false);

  const handleReorder = () => {
    setLoading(true);
    let addedCount = 0;

    for (const item of items) {
      const prod = catalog.byId.get(item.productId);
      if (prod && prod.stock <= 0) {
        continue;
      }

      add(item.productId, {
        variant: item.variant,
        qty: item.qty,
        energ: item.energName
          ? { name: item.energName, gotra: item.energGotra || "" }
          : null,
      });
      addedCount++;
    }

    setLoading(false);
    if (addedCount > 0) {
      router.push("/cart");
    }
  };

  return (
    <button
      type="button"
      onClick={handleReorder}
      disabled={loading}
      className={buttonClass("primary", "sm", "cursor-pointer flex items-center gap-1.5")}
    >
      <Icon name="bag" className="size-3.5" />
      <span>{locale === "hi" ? "पुनः ऑर्डर करें" : "Reorder items"}</span>
    </button>
  );
}
