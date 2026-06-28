"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/toast";
import { useAuthStore } from "@/lib/stores/auth-store";
import { api } from "@/lib/api";
import type { User } from "@/types";
import { AnalyticsProvider } from "@/components/analytics-provider";

function SessionRestorer({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setChecking(false);
      return;
    }
    api.get<User>("/users/me").then((user) => {
      useAuthStore.setState({ user, isAuthenticated: true, isLoading: false });
    }).catch(() => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
    }).finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          <p className="text-sm text-neutral-400">Loading VERIQ...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SessionRestorer>
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
      </SessionRestorer>
      <Toaster />
    </QueryClientProvider>
  );
}
