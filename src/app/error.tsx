"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl ring-1 ring-zinc-800 bg-zinc-900/40 p-6 text-center">
        <div className="text-sm font-semibold text-zinc-200">TapLoop</div>
        <div className="mt-2 text-xs text-zinc-500">Something went wrong. You can try again.</div>
        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            className="h-11 rounded-xl bg-white text-sm font-semibold text-zinc-950 hover:bg-zinc-100"
            onClick={() => reset()}
          >
            Retry
          </button>
          <a
            href="/"
            className="h-11 flex items-center justify-center rounded-xl text-sm font-medium text-zinc-400 ring-1 ring-zinc-700 hover:bg-zinc-800/50"
          >
            Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
