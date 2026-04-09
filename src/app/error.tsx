"use client";

import { useEffect } from "react";
import { ButtonLink } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Intentionally minimal: avoid logging sensitive info client-side.
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl ring-1 ring-inset ring-zinc-800 p-6">
        <div className="text-lg font-semibold">Something went wrong</div>
        <div className="text-sm text-zinc-400 mt-2">
          Try again, or return to the dashboard.
        </div>
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <button
            className="h-10 px-4 rounded-md bg-white text-zinc-950 hover:bg-zinc-100 text-sm font-medium"
            onClick={() => reset()}
          >
            Retry
          </button>
          <ButtonLink href="/dashboard" variant="secondary">
            Dashboard
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

