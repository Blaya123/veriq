"use client";

import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/lib/api";
import { DataTable, type Column } from "@/components/admin/data-table";
import { UserDetail } from "@/components/admin/user-detail";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast";
import { MoreHorizontal, Shield, ShieldOff, UserCheck, UserX, AlertTriangle } from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  isSuperAdmin: boolean;
  avatarUrl?: string;
  createdAt: string;
  workspacesCount: number;
}

interface UserDetailData {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  isSuperAdmin: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  workspaceMemberships: Array<{
    workspace: { id: string; name: string; slug: string; plan: string };
  }>;
  _count: {
    conversations: number;
    assignedTasks: number;
    assignedDeals: number;
    aiChats: number;
  };
}

interface PaginatedResponse {
  data: UserData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetail, setUserDetail] = useState<UserDetailData | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("page", page.toString());
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);

      const res = await api.get<PaginatedResponse>(`/admin/users?${params}`);
      setUsers(res.data);
      setTotalPages(res.totalPages);
      setTotal(res.total);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [search, page, sortBy, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleViewDetail = async (user: UserData) => {
    setSelectedUserId(user.id);
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const detail = await api.get<UserDetailData>(`/admin/users/${user.id}`);
      setUserDetail(detail);
    } catch {
      toast.error("Failed to load user details");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSuspend = async (userId: string, currentlyActive: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}`, { isActive: !currentlyActive });
      toast.success(`User ${currentlyActive ? "suspended" : "activated"} successfully`);
      fetchUsers();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to update user";
      toast.error(message);
    }
  };

  const handleChangeRole = async (userId: string, role: string) => {
    try {
      await api.patch(`/admin/users/${userId}`, { role });
      toast.success(`Role changed to ${role}`);
      fetchUsers();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to change role";
      toast.error(message);
    }
  };

  const handleToggleSuperAdmin = async (userId: string, currentlySuperAdmin: boolean) => {
    try {
      if (currentlySuperAdmin) {
        await api.delete(`/admin/users/${userId}/super-admin`);
        toast.success("Super admin revoked");
      } else {
        await api.post(`/admin/users/${userId}/super-admin`);
        toast.success("Super admin granted");
      }
      fetchUsers();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to update super admin status";
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

  const columns: Column<UserData>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-3">
          <Avatar
            fallback={user.name.slice(0, 2).toUpperCase()}
            size="sm"
            className="bg-neutral-800"
          />
          <div>
            <p className="font-medium text-neutral-200">{user.name}</p>
            <p className="text-xs text-neutral-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      className: "hidden md:table-cell",
      render: (user) => <span className="text-neutral-400">{user.email}</span>,
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (user) => (
        <Badge variant="secondary" size="sm">
          {user.role}
        </Badge>
      ),
    },
    {
      key: "workspacesCount",
      label: "Workspaces",
      sortable: true,
      className: "text-center",
    },
    {
      key: "isActive",
      label: "Status",
      sortable: true,
      render: (user) => (
        <Badge variant={user.isActive ? "success" : "error"} size="sm">
          {user.isActive ? "Active" : "Suspended"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (user) => (
        <span className="text-neutral-400">
          {new Date(user.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (user) => (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center justify-center">
            <MoreHorizontal className="h-4 w-4 text-neutral-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 border-neutral-800 bg-neutral-900">
            <DropdownMenuItem onClick={() => handleViewDetail(user)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-neutral-800" />
            <DropdownMenuItem
              onClick={() => handleSuspend(user.id, user.isActive)}
              className={user.isActive ? "text-warning-400" : "text-success-400"}
            >
              {user.isActive ? (
                <><UserX className="mr-2 h-4 w-4" /> Suspend User</>
              ) : (
                <><UserCheck className="mr-2 h-4 w-4" /> Activate User</>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-neutral-800" />
            <DropdownMenuItem onClick={() => handleChangeRole(user.id, "ADMIN")}>
              Make Admin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleChangeRole(user.id, "MEMBER")}>
              Make Member
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleChangeRole(user.id, "VIEWER")}>
              Make Viewer
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-neutral-800" />
            <DropdownMenuItem
              onClick={() => handleToggleSuperAdmin(user.id, user.isSuperAdmin)}
              className={user.isSuperAdmin ? "text-error-400" : "text-primary-400"}
            >
              {user.isSuperAdmin ? (
                <><ShieldOff className="mr-2 h-4 w-4" /> Revoke Super Admin</>
              ) : (
                <><Shield className="mr-2 h-4 w-4" /> Grant Super Admin</>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Users</h1>
        <p className="text-sm text-neutral-400">
          Manage all users across the platform
        </p>
      </div>

      <DataTable
        columns={columns}
        data={users}
        keyExtractor={(user) => user.id}
        searchable
        searchPlaceholder="Search by name or email..."
        searchQuery={search}
        onSearch={(q) => { setSearch(q); setPage(1); }}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        loading={loading}
        emptyMessage={search ? "No users match your search" : "No users found"}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        total={total}
      />

      <UserDetail
        open={detailOpen}
        onOpenChange={setDetailOpen}
        user={userDetail}
        loading={detailLoading}
      />
    </div>
  );
}
