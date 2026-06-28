"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { getPostHogConfig } from "@/lib/analytics";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const { apiKey, host } = getPostHogConfig();
    if (!apiKey) return;

    if (!(window as any).__posthog_initialized) {
      posthog.init(apiKey, {
        api_host: host,
        person_profiles: "identified_only",
        capture_pageview: false,
        loaded: () => {
          (window as any).__posthog_initialized = true;
        },
      });
    }
  }, []);

  useEffect(() => {
    if (!(window as any).__posthog_initialized) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return <>{children}</>;
}
