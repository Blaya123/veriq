import { PostHog } from "posthog-node";

const POSTHOG_KEY = process.env.POSTHOG_SERVER_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY || "";
const POSTHOG_HOST = process.env.POSTHOG_HOST || "https://us.i.posthog.com";

let client: PostHog | null = null;

function getClient(): PostHog | null {
  if (!POSTHOG_KEY) return null;
  if (!client) {
    client = new PostHog(POSTHOG_KEY, {
      host: POSTHOG_HOST,
    });
  }
  return client;
}

export function trackEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>
) {
  const ph = getClient();
  if (!ph) return;
  ph.capture({
    distinctId,
    event,
    properties: {
      ...properties,
      $host: process.env.FRONTEND_URL || "",
      environment: process.env.NODE_ENV || "production",
    },
  });
}

export function identifyUser(
  distinctId: string,
  properties?: Record<string, unknown>
) {
  const ph = getClient();
  if (!ph) return;
  ph.identify({
    distinctId,
    properties: {
      ...properties,
      environment: process.env.NODE_ENV || "production",
    },
  });
}

export async function flushAnalytics() {
  if (client) {
    try {
      (client as any).shutdown();
    } catch {}
    client = null;
  }
}
