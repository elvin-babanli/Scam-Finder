import type { ReactNode } from "react";
import { Sidebar } from "@/components/admin/Sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 min-h-[calc(100vh-0px)]">
      <Sidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

