"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Topbar({ title }: { title: string }) {
  const { data } = useSession();
  const email = data?.user?.email ?? "admin";

  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/60">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-zinc-100">{title}</div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-xs text-zinc-400">{email}</div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}

