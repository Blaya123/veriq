"use client";

import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, ToggleLeft, ToggleRight, Trash2, Search } from "lucide-react";

interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description?: string;
  enabled: boolean;
  workspaceTargeting?: string[];
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse {
  data: FeatureFlag[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminFeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [newFlag, setNewFlag] = useState({ name: "", key: "", description: "" });

  const fetchFlags = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("page", page.toString());

      const res = await api.get<PaginatedResponse>(`/admin/feature-flags?${params}`);
      setFlags(res.data);
      setTotalPages(res.totalPages);
      setTotal(res.total);
    } catch {
      toast.error("Failed to load feature flags");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  const handleToggle = async (id: string) => {
    try {
      const updated = await api.post<FeatureFlag>(`/admin/feature-flags/${id}/toggle`);
      setFlags((prev) => prev.map((f) => (f.id === id ? { ...f, enabled: updated.enabled } : f)));
      toast.success(`Flag ${updated.enabled ? "enabled" : "disabled"}`);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to toggle flag";
      toast.error(message);
    }
  };

  const handleCreate = async () => {
    if (!newFlag.name || !newFlag.key) {
      toast.error("Name and key are required");
      return;
    }

    try {
      await api.post("/admin/feature-flags", newFlag);
      toast.success("Feature flag created");
      setCreateOpen(false);
      setNewFlag({ name: "", key: "", description: "" });
      fetchFlags();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to create flag";
      toast.error(message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/admin/feature-flags/${id}`);
      toast.success("Feature flag deleted");
      fetchFlags();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to delete flag";
      toast.error(message);
    }
  };

  const generateKey = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Feature Flags</h1>
          <p className="text-sm text-neutral-400">
            Manage feature flags for gradual rollouts and A/B testing
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm">
          <Plus className="mr-1 h-4 w-4" />
          New Flag
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
        <Input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search flags..."
          className="border-neutral-700 bg-neutral-800 pl-9 text-neutral-100 placeholder:text-neutral-500"
        />
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl border border-neutral-800 bg-neutral-900 p-4" />
          ))
        ) : flags.length === 0 ? (
          <div className="flex h-48 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900">
            <p className="text-sm text-neutral-500">
              {search ? "No flags match your search" : "No feature flags yet"}
            </p>
          </div>
        ) : (
          flags.map((flag) => (
            <div
              key={flag.id}
              className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900 p-4 transition-colors hover:border-neutral-700"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-white">{flag.name}</h3>
                  <code className="rounded bg-neutral-800 px-2 py-0.5 text-xs text-neutral-400 font-mono">
                    {flag.key}
                  </code>
                  <Badge
                    variant={flag.enabled ? "success" : "error"}
                    size="sm"
                  >
                    {flag.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                {flag.description && (
                  <p className="mt-1 text-sm text-neutral-400">{flag.description}</p>
                )}
                {flag.workspaceTargeting && flag.workspaceTargeting.length > 0 && (
                  <p className="mt-1 text-xs text-neutral-500">
                    Targeting {flag.workspaceTargeting.length} workspace(s)
                  </p>
                )}
                <p className="mt-1 text-xs text-neutral-600">
                  Created {new Date(flag.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggle(flag.id)}
                  className={flag.enabled
                    ? "border-success-500/30 text-success-400 hover:bg-success-500/10"
                    : "border-neutral-700 text-neutral-400 hover:bg-neutral-800"
                  }
                >
                  {flag.enabled ? (
                    <><ToggleRight className="mr-1 h-4 w-4" /> Disable</>
                  ) : (
                    <><ToggleLeft className="mr-1 h-4 w-4" /> Enable</>
                  )}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center justify-center p-2">
                    <MoreHorizontal className="h-4 w-4 text-neutral-400" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 border-neutral-800 bg-neutral-900">
                    <DropdownMenuItem
                      onClick={() => handleDelete(flag.id, flag.name)}
                      className="text-error-400"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-500">
            Page {page} of {totalPages} ({total} total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="border-neutral-700 text-neutral-300"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="border-neutral-700 text-neutral-300"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="border-neutral-800 bg-neutral-900 text-neutral-100">
          <DialogHeader>
            <DialogTitle>Create Feature Flag</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Add a new feature flag for gradual rollout
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-300">Name</label>
              <Input
                value={newFlag.name}
                onChange={(e) => setNewFlag({ ...newFlag, name: e.target.value, key: generateKey(e.target.value) })}
                placeholder="My Feature"
                className="border-neutral-700 bg-neutral-800 text-neutral-100 placeholder:text-neutral-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-300">Key</label>
              <Input
                value={newFlag.key}
                onChange={(e) => setNewFlag({ ...newFlag, key: e.target.value })}
                placeholder="my_feature"
                className="border-neutral-700 bg-neutral-800 text-neutral-100 placeholder:text-neutral-500 font-mono"
              />
              <p className="mt-1 text-xs text-neutral-500">
                Unique identifier used in code. Use snake_case.
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-300">Description</label>
              <Input
                value={newFlag.description}
                onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })}
                placeholder="What does this flag control?"
                className="border-neutral-700 bg-neutral-800 text-neutral-100 placeholder:text-neutral-500"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setCreateOpen(false)}
                className="border-neutral-700 text-neutral-300"
              >
                Cancel
              </Button>
              <Button onClick={handleCreate}>
                Create Flag
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
