const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || "";
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

export function getPostHogConfig() {
  return {
    apiKey: POSTHOG_KEY,
    host: POSTHOG_HOST,
  };
}

export function isAnalyticsEnabled() {
  return !!POSTHOG_KEY;
}
