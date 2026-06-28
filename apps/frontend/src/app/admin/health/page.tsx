"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { HeartPulse, Database, Clock, Cpu, Activity } from "lucide-react";

interface HealthData {
  status: string;
  database: string;
  responseTime: string;
  uptime: string;
  timestamp: string;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
}

export default function SystemHealthPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<HealthData>("/admin/health")
      .then(setHealth)
      .finally(() => setLoading(false));
  }, []);

  const formatBytes = (bytes: number) => {
    const sizes = ["B", "KB", "MB", "GB"];
    let i = 0;
    let val = bytes;
    while (val >= 1024 && i < sizes.length - 1) {
      val /= 1024;
      i++;
    }
    return `${val.toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">System Health</h1>
        <p className="text-sm text-neutral-400">
          Monitor server and database health
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl border border-neutral-800 bg-neutral-900" />
          ))}
        </div>
      ) : health ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
              <div className="flex items-center gap-3">
                <HeartPulse className="h-5 w-5 text-success-400" />
                <span className="text-sm font-medium text-neutral-400">Status</span>
              </div>
              <Badge
                variant={health.status === "healthy" ? "success" : "error"}
                size="lg"
                className="mt-3"
              >
                {health.status.toUpperCase()}
              </Badge>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-primary-400" />
                <span className="text-sm font-medium text-neutral-400">Database</span>
              </div>
              <Badge
                variant={health.database === "connected" ? "success" : "error"}
                size="lg"
                className="mt-3"
              >
                {health.database.toUpperCase()}
              </Badge>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-warning-400" />
                <span className="text-sm font-medium text-neutral-400">Response Time</span>
              </div>
              <p className="mt-3 text-2xl font-bold text-white">{health.responseTime}</p>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-info-400" />
                <span className="text-sm font-medium text-neutral-400">Uptime</span>
              </div>
              <p className="mt-3 text-2xl font-bold text-white">{health.uptime}</p>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
            <div className="flex items-center gap-3 mb-4">
              <Cpu className="h-5 w-5 text-neutral-400" />
              <h3 className="text-sm font-semibold text-white">Memory Usage</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "RSS", value: formatBytes(health.memory.rss), pct: Math.round((health.memory.rss / (8 * 1024 * 1024 * 1024)) * 100) },
                { label: "Heap Total", value: formatBytes(health.memory.heapTotal), pct: Math.round((health.memory.heapTotal / (4 * 1024 * 1024 * 1024)) * 100) },
                { label: "Heap Used", value: formatBytes(health.memory.heapUsed), pct: Math.round((health.memory.heapUsed / health.memory.heapTotal) * 100) },
                { label: "External", value: formatBytes(health.memory.external), pct: 0 },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-neutral-500">{item.label}</p>
                  <p className="text-lg font-bold text-white">{item.value}</p>
                  {item.pct > 0 && (
                    <div className="mt-1 h-1.5 w-full rounded-full bg-neutral-800">
                      <div
                        className={`h-1.5 rounded-full ${item.pct > 80 ? "bg-error-500" : item.pct > 50 ? "bg-warning-500" : "bg-success-500"}`}
                        style={{ width: `${Math.min(item.pct, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
            <p className="text-xs text-neutral-500">
              Last checked: {new Date(health.timestamp).toLocaleString()}
            </p>
          </div>
        </>
      ) : (
        <div className="flex h-48 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900">
          <p className="text-sm text-neutral-500">Failed to load system health</p>
        </div>
      )}
    </div>
  );
}
