"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { StatsCard } from "@/components/admin/stats-card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Building2,
  DollarSign,
  CreditCard,
  TrendingUp,
  HeartPulse,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";

interface DashboardData {
  totalUsers: number;
  activeUsers: number;
  totalWorkspaces: number;
  totalRevenue: number;
  mrr: number;
  arr: number;
  activeSubscriptions: number;
  growth: number;
  planDistribution: Record<string, number>;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    createdAt: string;
    isActive: boolean;
  }>;
  revenueChart: Array<{ date: string; amount: number }>;
  systemHealth: { status: string; database: string; timestamp: string };
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<DashboardData>("/admin/dashboard")
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
              <Skeleton className="h-10 w-10 rounded-lg bg-neutral-800" />
              <Skeleton className="mt-3 h-8 w-24 bg-neutral-800" />
              <Skeleton className="mt-1 h-4 w-16 bg-neutral-800" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-error-400" />
          <h2 className="mt-4 text-lg font-semibold text-white">Failed to load dashboard</h2>
          <p className="mt-2 text-sm text-neutral-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const healthStatus = data.systemHealth.status === "healthy" ? "success" : "error";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Admin Dashboard</h1>
          <p className="text-sm text-neutral-400">
            System overview and key metrics at a glance
          </p>
        </div>
        <Badge variant={healthStatus as "success" | "error"} size="sm">
          <HeartPulse className="mr-1 h-3 w-3" />
          {data.systemHealth.status}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Users"
          value={data.totalUsers.toLocaleString()}
          change={`${data.growth}%`}
          trend={data.growth >= 0 ? "up" : "down"}
          icon={<Users className="h-5 w-5 text-neutral-400" />}
        />
        <StatsCard
          label="Total Workspaces"
          value={data.totalWorkspaces.toLocaleString()}
          icon={<Building2 className="h-5 w-5 text-neutral-400" />}
        />
        <StatsCard
          label="MRR"
          value={`$${data.mrr.toLocaleString()}`}
          icon={<CreditCard className="h-5 w-5 text-neutral-400" />}
        />
        <StatsCard
          label="ARR"
          value={`$${data.arr.toLocaleString()}`}
          icon={<DollarSign className="h-5 w-5 text-neutral-400" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900">
          <div className="border-b border-neutral-800 p-4">
            <h3 className="text-sm font-semibold text-white">Revenue (Last 30 Days)</h3>
          </div>
          <div className="p-4">
            {data.revenueChart.length > 0 ? (
              <div className="flex items-end gap-1 h-32">
                {data.revenueChart.map((point, i) => {
                  const max = Math.max(...data.revenueChart.map((p) => p.amount));
                  const height = max > 0 ? (point.amount / max) * 100 : 0;
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-error-500/50 transition-all hover:bg-error-500"
                      style={{ height: `${Math.max(height, 4)}%` }}
                      title={`${point.date}: $${point.amount}`}
                    />
                  );
                })}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-neutral-500">
                No revenue data for the last 30 days
              </p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900">
          <div className="border-b border-neutral-800 p-4">
            <h3 className="text-sm font-semibold text-white">Plan Distribution</h3>
          </div>
          <div className="p-4 space-y-3">
            {Object.entries(data.planDistribution).length > 0 ? (
              Object.entries(data.planDistribution).map(([plan, count]) => {
                const total = Object.values(data.planDistribution).reduce((a, b) => a + b, 0);
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={plan}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-300">{plan}</span>
                      <span className="text-neutral-400">{count} ({pct}%)</span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-neutral-800">
                      <div
                        className="h-2 rounded-full bg-error-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="py-4 text-center text-sm text-neutral-500">No workspaces yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900">
          <div className="border-b border-neutral-800 p-4">
            <h3 className="text-sm font-semibold text-white">Recent Users</h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {data.recentUsers.map((user, i) => (
                <div key={user.id}>
                  <div className="flex items-center gap-3">
                    <Avatar
                      fallback={user.name.slice(0, 2).toUpperCase()}
                      size="sm"
                      className="bg-neutral-800"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-neutral-200 truncate">
                          {user.name}
                        </p>
                        <Badge
                          variant={user.isActive ? "success" : "error"}
                          size="sm"
                        >
                          {user.isActive ? "Active" : "Suspended"}
                        </Badge>
                      </div>
                      <p className="text-xs text-neutral-500">{user.email}</p>
                    </div>
                    <span className="text-xs text-neutral-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-neutral-500" />
                  </div>
                  {i < data.recentUsers.length - 1 && (
                    <Separator className="mt-3 bg-neutral-800" />
                  )}
                </div>
              ))}
              {data.recentUsers.length === 0 && (
                <p className="py-4 text-center text-sm text-neutral-500">No users yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900">
          <div className="border-b border-neutral-800 p-4">
            <h3 className="text-sm font-semibold text-white">System Alerts</h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg border border-success-500/20 bg-success-500/5 p-3">
                <TrendingUp className="mt-0.5 h-4 w-4 text-success-400" />
                <div>
                  <p className="text-sm font-medium text-success-300">All Systems Operational</p>
                  <p className="text-xs text-neutral-500">
                    Database: {data.systemHealth.database} | Last checked: {new Date(data.systemHealth.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                <Users className="mt-0.5 h-4 w-4 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-200">User Growth</p>
                  <p className="text-xs text-neutral-500">
                    {data.activeUsers} active users out of {data.totalUsers} total ({Math.round((data.activeUsers / data.totalUsers) * 100)}% active rate)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                <CreditCard className="mt-0.5 h-4 w-4 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-200">Subscription Revenue</p>
                  <p className="text-xs text-neutral-500">
                    {data.activeSubscriptions} paid invoices | MRR: ${data.mrr.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
