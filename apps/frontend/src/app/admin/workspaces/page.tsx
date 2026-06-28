"use client";

import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/lib/api";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast";
import { MoreHorizontal, Building2, Users, Mail, Calendar, AlertTriangle, Trash2 } from "lucide-react";

interface WorkspaceData {
  id: string;
  name: string;
  slug: string;
  plan: string;
  logoUrl?: string;
  createdAt: string;
  owner: { id: string; name: string; email: string } | null;
  membersCount: number;
  contactsCount: number;
  conversationsCount: number;
  invoicesCount: number;
}

interface PaginatedResponse {
  data: WorkspaceData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminWorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<WorkspaceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<Record<string, unknown> | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchWorkspaces = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("page", page.toString());
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);

      const res = await api.get<PaginatedResponse>(`/admin/workspaces?${params}`);
      setWorkspaces(res.data);
      setTotalPages(res.totalPages);
      setTotal(res.total);
    } catch {
      toast.error("Failed to load workspaces");
    } finally {
      setLoading(false);
    }
  }, [search, page, sortBy, sortOrder]);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const handleViewDetail = async (ws: WorkspaceData) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const detail = await api.get(`/admin/workspaces/${ws.id}`);
      setDetailData(detail as Record<string, unknown>);
    } catch {
      toast.error("Failed to load workspace details");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleChangePlan = async (id: string, plan: string) => {
    try {
      await api.patch(`/admin/workspaces/${id}`, { plan });
      toast.success(`Plan changed to ${plan}`);
      fetchWorkspaces();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to change plan";
      toast.error(message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/admin/workspaces/${id}`);
      toast.success("Workspace deleted");
      fetchWorkspaces();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to delete workspace";
      toast.error(message);
    }
  };

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("desc");
    }
  };

  const columns: Column<WorkspaceData>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (ws) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-800">
            <Building2 className="h-4 w-4 text-neutral-400" />
          </div>
          <div>
            <p className="font-medium text-neutral-200">{ws.name}</p>
            <p className="text-xs text-neutral-500">{ws.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "owner",
      label: "Owner",
      render: (ws) =>
        ws.owner ? (
          <div className="flex items-center gap-2">
            <Avatar fallback={ws.owner.name.slice(0, 2).toUpperCase()} size="sm" className="bg-neutral-800" />
            <span className="text-sm text-neutral-300">{ws.owner.name}</span>
          </div>
        ) : (
          <span className="text-sm text-neutral-500">No owner</span>
        ),
    },
    {
      key: "plan",
      label: "Plan",
      sortable: true,
      render: (ws) => (
        <Badge
          variant={
            ws.plan === "ENTERPRISE" ? "default" :
            ws.plan === "BUSINESS" ? "warning" :
            ws.plan === "PRO" ? "secondary" : "outline"
          }
          size="sm"
        >
          {ws.plan}
        </Badge>
      ),
    },
    {
      key: "membersCount",
      label: "Members",
      sortable: true,
      className: "text-center",
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (ws) => (
        <span className="text-neutral-400">
          {new Date(ws.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (ws) => (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center justify-center">
            <MoreHorizontal className="h-4 w-4 text-neutral-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 border-neutral-800 bg-neutral-900">
            <DropdownMenuItem onClick={() => handleViewDetail(ws)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-neutral-800" />
            <DropdownMenuItem onClick={() => handleChangePlan(ws.id, "FREE")}>
              Set to Free
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleChangePlan(ws.id, "PRO")}>
              Set to Pro
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleChangePlan(ws.id, "BUSINESS")}>
              Set to Business
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleChangePlan(ws.id, "ENTERPRISE")}>
              Set to Enterprise
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-neutral-800" />
            <DropdownMenuItem
              onClick={() => handleDelete(ws.id, ws.name)}
              className="text-error-400"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete Workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Workspaces</h1>
        <p className="text-sm text-neutral-400">
          Manage all workspaces across the platform
        </p>
      </div>

      <DataTable
        columns={columns}
        data={workspaces}
        keyExtractor={(ws) => ws.id}
        searchable
        searchPlaceholder="Search by name or slug..."
        searchQuery={search}
        onSearch={(q) => { setSearch(q); setPage(1); }}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        loading={loading}
        emptyMessage={search ? "No workspaces match your search" : "No workspaces found"}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        total={total}
      />

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl border-neutral-800 bg-neutral-900 text-neutral-100">
          <DialogHeader>
            <DialogTitle>Workspace Details</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Detailed view of workspace and its resources
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-4 w-full animate-pulse rounded bg-neutral-800" />
              ))}
            </div>
          ) : detailData ? (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-neutral-800">
                  <Building2 className="h-7 w-7 text-neutral-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">
                    {detailData.name as string}
                  </h3>
                  <p className="text-sm text-neutral-400">{detailData.slug as string}</p>
                </div>
                <Badge variant="outline" size="sm">
                  {(detailData.plan as string) || "FREE"}
                </Badge>
              </div>

              <Separator className="bg-neutral-800" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">Created</p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-neutral-200">
                    <Calendar className="h-3 w-3" />
                    {new Date(detailData.createdAt as string).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">Members</p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-neutral-200">
                    <Users className="h-3 w-3" />
                    {(detailData.members as Array<unknown>)?.length ?? 0} members
                  </p>
                </div>
              </div>

              <Separator className="bg-neutral-800" />

              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Team Members
                </p>
                <div className="space-y-2">
                  {((detailData.members as Array<{ user: { id: string; name: string; email: string; avatarUrl?: string; role: string } }>) ?? []).map((m) => (
                    <div key={m.user.id} className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                      <Avatar fallback={m.user.name.slice(0, 2).toUpperCase()} size="sm" className="bg-neutral-800" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-200">{m.user.name}</p>
                        <p className="text-xs text-neutral-500">{m.user.email}</p>
                      </div>
                      <Badge variant="secondary" size="sm">{m.user.role}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-neutral-800" />

              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Contacts", value: (detailData._count as Record<string, number>)?.contacts ?? 0 },
                  { label: "Conversations", value: (detailData._count as Record<string, number>)?.conversations ?? 0 },
                  { label: "Deals", value: (detailData._count as Record<string, number>)?.deals ?? 0 },
                  { label: "Tasks", value: (detailData._count as Record<string, number>)?.tasks ?? 0 },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-center">
                    <p className="text-lg font-bold text-white">{item.value}</p>
                    <p className="text-xs text-neutral-500">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
