"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Plan {
  name: string;
  code: string;
  price: string;
  features: string[];
  popular?: boolean;
  limits: Record<string, number | string>;
}

interface PlanComparisonProps {
  plans: Plan[];
  currentPlanCode?: string;
}

const featureRows = [
  { label: "Users", key: "users" },
  { label: "Workspaces", key: "workspaces" },
  { label: "AI Credits", key: "aiCredits" },
  { label: "Storage", key: "storage" },
  { label: "Basic Inbox & CRM", key: "basic_crm", type: "boolean" },
  { label: "AI Reply & Chat", key: "ai_reply", type: "boolean" },
  { label: "Advanced Analytics", key: "advanced_analytics", type: "boolean" },
  { label: "API Access", key: "api_access", type: "boolean" },
  { label: "Advanced AI Agents", key: "advanced_ai_agents", type: "boolean" },
  { label: "Custom Workflows", key: "custom_workflows", type: "boolean" },
  { label: "Audit Logs", key: "audit_logs", type: "boolean" },
  { label: "SSO & Advanced Security", key: "sso", type: "boolean" },
  { label: "Dedicated Support", key: "dedicated_support", type: "boolean" },
];

function hasFeature(plan: Plan, key: string): boolean {
  const featureMap: Record<string, string[]> = {
    FREE: ["basic_crm"],
    PRO: ["basic_crm", "ai_reply", "advanced_analytics", "api_access"],
    BUSINESS: [
      "basic_crm",
      "ai_reply",
      "advanced_analytics",
      "api_access",
      "advanced_ai_agents",
      "custom_workflows",
      "audit_logs",
    ],
    ENTERPRISE: [
      "basic_crm",
      "ai_reply",
      "advanced_analytics",
      "api_access",
      "advanced_ai_agents",
      "custom_workflows",
      "audit_logs",
      "sso",
      "dedicated_support",
    ],
  };
  return featureMap[plan.code]?.includes(key) ?? false;
}

export function PlanComparison({ plans, currentPlanCode }: PlanComparisonProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Compare Plans</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Find the right plan for your team.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/50">
              <th className="px-4 py-3 text-left font-medium text-neutral-500">
                Feature
              </th>
              {plans.map((plan) => (
                <th
                  key={plan.code}
                  className={cn(
                    "px-4 py-3 text-center font-medium",
                    plan.code === currentPlanCode && "text-primary-600"
                  )}
                >
                  <div className="flex flex-col items-center gap-1">
                    {plan.name}
                    {plan.code === currentPlanCode && (
                      <Badge variant="default" size="sm">
                        Current
                      </Badge>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {featureRows.map((row, i) => (
              <tr
                key={row.key}
                className={cn(
                  "border-b border-neutral-200 dark:border-neutral-700",
                  i % 2 === 0 && "bg-white dark:bg-neutral-900",
                  i % 2 !== 0 && "bg-neutral-50 dark:bg-neutral-950"
                )}
              >
                <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">
                  {row.label}
                </td>
                {plans.map((plan) => {
                  const isAvailable =
                    row.type === "boolean"
                      ? hasFeature(plan, row.key)
                      : true;
                  const limitValue =
                    row.type !== "boolean"
                      ? plan.limits[row.key]
                      : null;

                  return (
                    <td
                      key={plan.code}
                      className="px-4 py-3 text-center"
                    >
                      {row.type === "boolean" ? (
                        isAvailable ? (
                          <Check className="mx-auto h-4 w-4 text-success-500" />
                        ) : (
                          <X className="mx-auto h-4 w-4 text-neutral-300 dark:text-neutral-600" />
                        )
                      ) : (
                        <span className="font-medium">
                          {limitValue === 9999 || limitValue === "Unlimited"
                            ? "Unlimited"
                            : limitValue}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
