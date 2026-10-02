"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/icons/Icon";
import { unsubscribeAction } from "@/server/messages/actions";

type Status = "idle" | "pending" | "done" | "error";

export function UnsubscribeConfirm({ token }: { token: string }): React.JSX.Element {
  const t = useTranslations("newsletter");
  const [status, setStatus] = useState<Status>("idle");
  const [isPending, startTransition] = useTransition();

  const confirm = () => {
    startTransition(async () => {
      const result = await unsubscribeAction({ token });
      if (result.ok) {
        setStatus("done");
      } else {
        setStatus("error");
      }
    });
  };

  if (status === "done") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="block size-12 text-em7">
          <Icon name="checkc" />
        </span>
        <h1 className="font-display text-[clamp(24px,3vw,32px)] leading-[1.15] font-normal text-ink">
          {t("unsub.doneTitle")}
        </h1>
        <p className="max-w-[420px] font-sans text-[15px] leading-[1.55] font-medium text-ink6">
          {t("unsub.doneSub")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <span className="block size-12 text-ink6">
        <Icon name="mail" />
      </span>
      <h1 className="font-display text-[clamp(24px,3vw,32px)] leading-[1.15] font-normal text-ink">
        {t("unsub.title")}
      </h1>
      <p className="max-w-[420px] font-sans text-[15px] leading-[1.55] font-medium text-ink6">
        {t("unsub.body")}
      </p>

      {status === "error" && (
        <div role="alert" className="flex items-center gap-2 rounded-field border border-rose bg-[rgba(235,207,201,.15)] px-4 py-2.5 font-sans text-[13.5px] leading-[1.4] font-medium text-rose">
          <Icon name="alert" className="size-4 flex-none" />
          {t("unsub.error")}
        </div>
      )}

      <button
        type="button"
        onClick={confirm}
        disabled={isPending}
        className="h-12 cursor-pointer rounded-btn border-0 bg-em7 px-8 font-sans text-[15px] leading-none font-semibold text-iv transition-colors hover:bg-em9 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? t("unsub.processing") : t("unsub.confirm")}
      </button>
    </div>
  );
}
