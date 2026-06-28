"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { Download, Filter } from "lucide-react";

interface AuditLogEntry {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: { id: string; name: string; email: string; avatarUrl?: string } | null;
  workspace?: { id: string; name: string; slug: string } | null;
}

interface PaginatedResponse {
  data: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const actionColors: Record<string, "default" | "secondary" | "success" | "warning" | "error"> = {
  USER_UPDATED: "warning",
  USER_CREATED: "success",
  WORKSPACE_CREATED: "success",
  WORKSPACE_UPDATED: "warning",
  WORKSPACE_DELETED: "error",
  SUPER_ADMIN_GRANTED: "error",
  SUPER_ADMIN_REVOKED: "error",
  INITIAL_SUPER_ADMIN_SETUP: "error",
  LOGIN: "secondary",
  LOGOUT: "secondary",
};

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [filterUser, setFilterUser] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      if (filterUser) params.set("userId", filterUser);
      if (filterAction) params.set("action", filterAction);
      if (filterDateFrom) params.set("dateFrom", new Date(filterDateFrom).toISOString());
      if (filterDateTo) params.set("dateTo", new Date(filterDateTo).toISOString());

      const res = await api.get<PaginatedResponse>(`/admin/audit-logs?${params}`);
      setLogs(res.data);
      setTotalPages(res.totalPages);
      setTotal(res.total);
    } catch {
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [page, filterUser, filterAction, filterDateFrom, filterDateTo]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleExport = () => {
    const csv = [
      ["Action", "Entity", "Entity ID", "User", "Workspace", "IP Address", "Timestamp"],
      ...logs.map((log) => [
        log.action,
        log.entity,
        log.entityId ?? "",
        log.user?.name ?? "",
        log.workspace?.name ?? "",
        log.ipAddress ?? "",
        new Date(log.createdAt).toISOString(),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Audit logs exported");
  };

  const columns: Column<AuditLogEntry>[] = [
    {
      key: "action",
      label: "Action",
      render: (log) => (
        <Badge variant={actionColors[log.action] ?? "secondary"} size="sm">
          {log.action.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      key: "entity",
      label: "Entity",
      render: (log) => (
        <span className="text-sm text-neutral-300">
          {log.entity}{log.entityId ? ` #${log.entityId.slice(0, 8)}` : ""}
        </span>
      ),
    },
    {
      key: "user",
      label: "User",
      render: (log) =>
        log.user ? (
          <div className="flex items-center gap-2">
            <Avatar fallback={log.user.name.slice(0, 2).toUpperCase()} size="sm" className="bg-neutral-800" />
            <span className="text-sm text-neutral-300">{log.user.name}</span>
          </div>
        ) : (
          <span className="text-sm text-neutral-500">System</span>
        ),
    },
    {
      key: "workspace",
      label: "Workspace",
      render: (log) =>
        log.workspace ? (
          <span className="text-sm text-neutral-300">{log.workspace.name}</span>
        ) : (
          <span className="text-sm text-neutral-500">-</span>
        ),
    },
    {
      key: "metadata",
      label: "Details",
      render: (log) =>
        log.metadata?.changes ? (
          <span className="text-xs text-neutral-400">{String(log.metadata.changes)}</span>
        ) : (
          <span className="text-xs text-neutral-500">-</span>
        ),
    },
    {
      key: "createdAt",
      label: "Timestamp",
      render: (log) => (
        <div className="text-right">
          <p className="text-sm text-neutral-300">
            {new Date(log.createdAt).toLocaleDateString()}
          </p>
          <p className="text-xs text-neutral-500">
            {new Date(log.createdAt).toLocaleTimeString()}
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Audit Logs</h1>
          <p className="text-sm text-neutral-400">
            Track all important actions across the platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="border-neutral-700 text-neutral-300"
          >
            <Filter className="mr-1 h-4 w-4" />
            Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="border-neutral-700 text-neutral-300"
          >
            <Download className="mr-1 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-4 gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-400">User ID</label>
            <Input
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              placeholder="Filter by user ID..."
              className="border-neutral-700 bg-neutral-800 text-neutral-100 placeholder:text-neutral-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-400">Action</label>
            <Input
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              placeholder="e.g. USER_UPDATED"
              className="border-neutral-700 bg-neutral-800 text-neutral-100 placeholder:text-neutral-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-400">From</label>
            <Input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="border-neutral-700 bg-neutral-800 text-neutral-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-400">To</label>
            <Input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="border-neutral-700 bg-neutral-800 text-neutral-100"
            />
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={logs}
        keyExtractor={(log) => log.id}
        sortBy="createdAt"
        sortOrder="desc"
        onSort={() => {}}
        loading={loading}
        emptyMessage="No audit logs found"
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        total={total}
      />
    </div>
  );
}
