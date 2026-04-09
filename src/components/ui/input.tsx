import type { ComponentProps } from "react";

function cls(...xs: Array<string | undefined | false>) {
  return xs.filter(Boolean).join(" ");
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cls(
        "h-10 w-full rounded-md bg-zinc-950 px-3 text-sm text-zinc-100 ring-1 ring-inset ring-zinc-800 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-300/20",
        className,
      )}
      {...props}
    />
  );
}

