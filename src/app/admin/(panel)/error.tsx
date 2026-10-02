"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AdminPanelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // client observation
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center py-12 text-center">
      <div className="w-full max-w-md rounded-field border border-s1 bg-white p-8 shadow-sm">
        <div className="mb-3 text-2xl font-serif text-g5">॥ ॐ ॥</div>
        <div className="mb-2 text-xs font-semibold tracking-wider text-g7 uppercase">
          Admin Section
        </div>
        <h1 className="mb-2 text-xl font-semibold text-em9">
          Something went wrong
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-ink6">
          An unexpected error occurred while loading this admin section.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-10 items-center justify-center rounded-btn bg-em7 px-5 text-sm font-semibold text-iv transition-colors hover:bg-em5"
          >
            Try again
          </button>
          <Link
            href="/admin"
            className="inline-flex h-10 items-center justify-center rounded-btn border border-s1 bg-white px-5 text-sm font-semibold text-em7 transition-colors hover:bg-em1"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
