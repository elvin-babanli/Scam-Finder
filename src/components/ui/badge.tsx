import type { ReactNode } from "react";

function cls(...xs: Array<string | undefined | false>) {
  return xs.filter(Boolean).join(" ");
}

export function Badge({
  children,
  color = "zinc",
  className,
}: {
  children: ReactNode;
  color?: "zinc" | "red" | "amber" | "emerald" | "blue";
  className?: string;
}) {
  const palette: Record<string, string> = {
    zinc: "bg-zinc-900 text-zinc-200 ring-zinc-800",
    red: "bg-red-950/60 text-red-200 ring-red-900/60",
    amber: "bg-amber-950/60 text-amber-200 ring-amber-900/60",
    emerald: "bg-emerald-950/60 text-emerald-200 ring-emerald-900/60",
    blue: "bg-blue-950/60 text-blue-200 ring-blue-900/60",
  };

  return (
    <span
      className={cls(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        palette[color],
        className,
      )}
    >
      {children}
    </span>
  );
}

