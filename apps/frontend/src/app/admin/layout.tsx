"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Activity,
  Flag,
  Settings,
  Shield,
  ChevronDown,
  Menu,
  Search,
  Bell,
  HeartPulse,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const sidebarItems = [
  {
    label: "Admin",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Workspaces", href: "/admin/workspaces", icon: Building2 },
    ],
  },
  {
    label: "Monitoring",
    items: [
      { label: "System Health", href: "/admin/health", icon: HeartPulse },
      { label: "Audit Logs", href: "/admin/audit", icon: Activity },
    ],
  },
  {
    label: "Configuration",
    items: [
      { label: "Feature Flags", href: "/admin/feature-flags", icon: Flag },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-950">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-neutral-800 bg-neutral-900 transition-transform",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:relative lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-neutral-800 px-4">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-error-600">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              VERIQ
            </span>
          </Link>
          <Badge
            variant="error"
            size="sm"
            className="ml-auto border border-error-500/30"
          >
            Admin
          </Badge>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-6">
          {sidebarItems.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-error-500/10 text-error-400"
                          : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
                      )}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-neutral-800 p-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-200"
          >
            <LayoutDashboard className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b border-neutral-800 bg-neutral-900 px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5 text-neutral-400" />
          </button>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search admin..."
              className="h-9 w-full rounded-lg border border-neutral-700 bg-neutral-800 pl-9 pr-3 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-error-500"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button className="relative rounded-lg p-2 text-neutral-400 hover:bg-neutral-800">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-error-500" />
            </button>
            <Avatar fallback="SA" size="md" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-neutral-950 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
