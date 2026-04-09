import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Users,
  Shield,
  Settings,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const adminNav: AdminNavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/cases", label: "Cases", icon: FolderKanban },
  { href: "/evidence", label: "Evidence", icon: FileText },
  { href: "/profiles", label: "Profiles", icon: Users },
  { href: "/reports", label: "Reports", icon: Shield },
  { href: "/settings", label: "Settings", icon: Settings },
];

