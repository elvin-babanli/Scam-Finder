import type { ReactNode } from "react";

/**
 * Optional admin-style top bar. Uses Tailwind’s `supports-backdrop-filter:*` variant
 * (not `supports-[backdrop-filter]:*`) so IntelliSense stays clean.
 */
export function Topbar({
  title = "TapLoop",
  children,
}: {
  title?: string;
  children?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 px-4 py-3 supports-backdrop-filter:bg-zinc-950/60 supports-backdrop-filter:backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div className="text-sm font-semibold text-zinc-100">{title}</div>
        {children ? <div className="flex items-center gap-2">{children}</div> : null}
      </div>
    </header>
  );
}
