import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md";

function cls(...xs: Array<string | undefined | false>) {
  return xs.filter(Boolean).join(" ");
}

const base =
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-300/20 disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-white text-zinc-950 hover:bg-zinc-100",
  secondary:
    "bg-zinc-900 text-zinc-50 ring-1 ring-inset ring-zinc-800 hover:bg-zinc-800",
  danger: "bg-red-600 text-white hover:bg-red-500",
  ghost: "bg-transparent text-zinc-100 hover:bg-zinc-900",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cls(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "secondary",
  size = "md",
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}) {
  return (
    <Link
      className={cls(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </Link>
  );
}

