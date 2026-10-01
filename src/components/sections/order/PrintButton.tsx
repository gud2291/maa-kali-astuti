"use client";

import { Icon } from "@/components/icons/Icon";
import { buttonClass } from "@/components/ui/Button";

export function PrintButton({ label = "Print Invoice" }: { label?: string }): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined") {
          window.print();
        }
      }}
      className={buttonClass("primary", "md", "cursor-pointer flex items-center gap-2")}
    >
      <Icon name="bolt" className="size-4 rotate-90" />
      <span>{label}</span>
    </button>
  );
}
