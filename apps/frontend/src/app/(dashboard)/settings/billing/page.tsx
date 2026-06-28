"use client";

import { useState } from "react";
import { Check, ChevronRight, CreditCard, ArrowLeft, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlanCard } from "@/components/billing/plan-card";
import { PlanComparison } from "@/components/billing/plan-comparison";
import { InvoiceList } from "@/components/billing/invoice-list";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    code: "FREE",
    price: "$0",
    description: "Get started with basic features",
    features: ["1 user", "1 workspace", "50 AI credits/mo", "Basic inbox & CRM", "Email integration"],
    limits: { users: 1, workspaces: 1, aiCredits: 50, storage: "0.5 GB" },
    popular: false,
  },
  {
    name: "Pro",
    code: "PRO",
    price: "$29",
    description: "For growing teams",
    features: [
      "5 users",
      "1 workspace",
      "1,000 AI credits/mo",
      "10 GB storage",
      "AI reply & chat",
      "Advanced analytics",
      "API access",
      "Priority support",
    ],
    limits: { users: 5, workspaces: 1, aiCredits: 1000, storage: "10 GB" },
    popular: true,
  },
  {
    name: "Business",
    code: "BUSINESS",
    price: "$99",
    description: "For scaling businesses",
    features: [
      "50 users",
      "3 workspaces",
      "10,000 AI credits/mo",
      "100 GB storage",
      "Advanced AI agents",
      "Custom workflows",
      "Knowledge base",
      "Audit logs",
      "Team collaboration",
    ],
    limits: { users: 50, workspaces: 3, aiCredits: 10000, storage: "100 GB" },
    popular: false,
  },
  {
    name: "Enterprise",
    code: "ENTERPRISE",
    price: "Custom",
    description: "For large organizations",
    features: [
      "Unlimited users",
      "Unlimited workspaces",
      "Unlimited AI credits",
      "Unlimited storage",
      "Custom AI agents",
      "Dedicated infrastructure",
      "SSO & advanced security",
      "24/7 dedicated support",
    ],
    limits: { users: 9999, workspaces: 99, aiCredits: 999999, storage: "Unlimited" },
    popular: false,
  },
];

const currentPlanCode = "FREE";

export default function BillingPage() {
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const currentPlan = plans.find((p) => p.code === currentPlanCode)!;

  const invoices = [
    { id: "1", number: "INV-2026-000001", amount: 0, status: "PAID", date: "2026-06-01", description: "Free Plan - June 2026" },
    { id: "2", number: "INV-2026-000002", amount: 0, status: "DRAFT", date: "2026-07-01", description: "Free Plan - July 2026" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/settings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Manage your subscription, payment methods, and invoices.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>
              You are currently on the {currentPlan.name} plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-800/50">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold">{currentPlan.name}</h3>
                    <Badge variant="secondary" size="sm">Active</Badge>
                  </div>
                  <p className="mt-1 text-sm text-neutral-500">
                    {currentPlan.description}
                  </p>
                  <p className="mt-2 text-3xl font-bold">
                    {currentPlan.price}
                    {currentPlan.price !== "Custom" && (
                      <span className="text-base font-normal text-neutral-500">/mo</span>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  {currentPlanCode !== "FREE" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCancelDialog(true)}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button size="sm" onClick={() => document.getElementById("plan-comparison")?.scrollIntoView({ behavior: "smooth" })}>
                    Change Plan
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Usage</h4>
              <UsageBar
                label="Seats Used"
                used={1}
                limit={currentPlan.limits.users}
              />
              <UsageBar
                label="AI Credits"
                used={12}
                limit={currentPlan.limits.aiCredits}
              />
              <UsageBar
                label="Storage"
                used={0.3}
                limit={
                  typeof currentPlan.limits.storage === "string"
                    ? parseInt(currentPlan.limits.storage) || 9999
                    : currentPlan.limits.storage
                }
                unit="GB"
              />
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Payment Methods</h4>
                <Button variant="outline" size="sm">
                  <CreditCard className="mr-2 h-3 w-3" />
                  Add Method
                </Button>
              </div>
              <p className="mt-2 text-sm text-neutral-500">
                No payment methods added yet.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-neutral-500">Plan</p>
                <p className="text-lg font-semibold">{currentPlan.name}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-neutral-500">Status</p>
                <Badge variant="success" size="sm">Active</Badge>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-neutral-500">Next Invoice</p>
                <p className="text-lg font-semibold">N/A</p>
              </div>
            </CardContent>
          </Card>

          <InvoiceList invoices={invoices} />
        </div>
      </div>

      <div id="plan-comparison">
        <PlanComparison plans={plans} currentPlanCode={currentPlanCode} />
      </div>

      <CancelDialog open={showCancelDialog} onOpenChange={setShowCancelDialog} />
    </div>
  );
}

function UsageBar({
  label,
  used,
  limit,
  unit,
}: {
  label: string;
  used: number;
  limit: number;
  unit?: string;
}) {
  const percentage = Math.min((used / limit) * 100, 100);
  const isWarning = percentage >= 80;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-600 dark:text-neutral-400">{label}</span>
        <span className="font-medium">
          {used}
          {unit ? ` ${unit}` : ""} / {limit === 9999 ? "Unlimited" : limit}
          {limit !== 9999 && unit ? ` ${unit}` : ""}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            isWarning
              ? "bg-warning-500"
              : "bg-primary-500"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function CancelDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning-500" />
            Cancel Subscription
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel your subscription? Your workspace
            will be downgraded to the Free plan at the end of the current billing
            period. Some features will become unavailable.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-3">
          <p className="text-sm text-neutral-500">
            This action cannot be undone. You will lose access to:
          </p>
          <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
            <li className="flex items-start gap-2">
              <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0" />
              AI-powered features and automation
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0" />
              Advanced analytics and reporting
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0" />
              Priority support and API access
            </li>
          </ul>
          <p className="mt-4 text-xs text-neutral-400">
            Your data will be preserved for 30 days after cancellation.
          </p>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep Plan
          </Button>
          <Button variant="danger" onClick={() => onOpenChange(false)}>
            Confirm Cancellation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
