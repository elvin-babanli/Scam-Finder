import type { ReactNode } from "react";

function cls(...xs: Array<string | undefined | false>) {
  return xs.filter(Boolean).join(" ");
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cls(
        "rounded-xl bg-zinc-950 ring-1 ring-inset ring-zinc-800",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children }: { children: ReactNode }) {
  return <div className="px-5 py-4 border-b border-zinc-800">{children}</div>;
}

export function CardBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cls("px-5 py-4", className)}>{children}</div>;
}

