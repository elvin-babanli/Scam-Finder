"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNav } from "@/components/admin/nav";

export function Sidebar() {
  const currentPath = usePathname() ?? "/dashboard";
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 border-r border-zinc-800 bg-zinc-950">
      <div className="px-5 py-5 border-b border-zinc-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-white text-zinc-950 grid place-items-center font-semibold">
            SF
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-zinc-50">Scam Finder</div>
            <div className="text-xs text-zinc-400">Admin Dashboard</div>
          </div>
        </Link>
      </div>
      <nav className="p-3 flex-1">
        <ul className="space-y-1">
          {adminNav.map((item) => {
            const active =
              currentPath === item.href || currentPath.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={[
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-zinc-900 text-zinc-50 ring-1 ring-inset ring-zinc-800"
                      : "text-zinc-300 hover:bg-zinc-900/60 hover:text-zinc-50",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-zinc-800">
        <div className="text-xs text-zinc-500">
          Consent-based diagnostics only.
        </div>
      </div>
    </aside>
  );
}

