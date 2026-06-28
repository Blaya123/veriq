"use client";

import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const stats = [
  {
    label: "Total Revenue",
    value: "$48,250",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
  },
  {
    label: "Active Users",
    value: "2,847",
    change: "+8.2%",
    trend: "up",
    icon: Users,
  },
  {
    label: "Avg. Response Time",
    value: "2.4m",
    change: "-18.3%",
    trend: "up",
    icon: Clock,
  },
  {
    label: "Tasks Completed",
    value: "1,423",
    change: "+24.1%",
    trend: "up",
    icon: CheckCircle2,
  },
];

const recentActivity = [
  {
    user: "Sarah Chen",
    action: "closed deal",
    target: "TechFlow Enterprise",
    time: "2 min ago",
    avatar: "SC",
  },
  {
    user: "Marcus Johnson",
    action: "completed task",
    target: "Q4 Financial Review",
    time: "15 min ago",
    avatar: "MJ",
  },
  {
    user: "AI Agent",
    action: "sorted",
    target: "47 support emails",
    time: "32 min ago",
    avatar: "AI",
  },
  {
    user: "Elena Rodriguez",
    action: "scheduled meeting",
    target: "Product Roadmap Review",
    time: "1 hour ago",
    avatar: "ER",
  },
  {
    user: "AI Agent",
    action: "generated report",
    target: "Weekly Analytics Summary",
    time: "2 hours ago",
    avatar: "AI",
  },
];

const quickActions = [
  { label: "New Task", color: "bg-primary-500" },
  { label: "Send Invoice", color: "bg-success-500" },
  { label: "Schedule Meeting", color: "bg-warning-500" },
  { label: "Create Report", color: "bg-neutral-500" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Here&apos;s what&apos;s happening with your business today.
          </p>
        </div>
        <Badge variant="success" size="sm">
          All systems operational
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="rounded-lg bg-neutral-100 p-2 dark:bg-neutral-800">
                    <Icon className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                  </div>
                  <Badge
                    variant={stat.trend === "up" ? "success" : "error"}
                    size="sm"
                  >
                    {stat.trend === "up" ? (
                      <TrendingUp className="mr-0.5 h-3 w-3" />
                    ) : (
                      <TrendingDown className="mr-0.5 h-3 w-3" />
                    )}
                    {stat.change}
                  </Badge>
                </div>
                <p className="mt-3 text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-neutral-500">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions across your workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((item, i) => (
                <div key={i}>
                  <div className="flex items-start gap-3">
                    <Avatar
                      fallback={item.avatar}
                      size="sm"
                      className={item.user === "AI Agent" ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300" : undefined}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium text-neutral-900 dark:text-white">
                          {item.user}
                        </span>{" "}
                        <span className="text-neutral-500">{item.action}</span>{" "}
                        <span className="font-medium text-neutral-900 dark:text-white">
                          {item.target}
                        </span>
                      </p>
                      <p className="text-xs text-neutral-400">{item.time}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-neutral-400" />
                  </div>
                  {i < recentActivity.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks you can perform right now
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-neutral-200 p-6 text-sm font-medium text-neutral-700 transition-all hover:border-neutral-300 hover:shadow-sm dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-600"
                >
                  <div
                    className={`h-10 w-10 rounded-lg ${action.color} flex items-center justify-center`}
                  >
                    <ArrowRight className="h-5 w-5 text-white" />
                  </div>
                  {action.label}
                </button>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="rounded-lg bg-primary-50 p-4 dark:bg-primary-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary-900 dark:text-primary-300">
                    AI Suggestion
                  </p>
                  <p className="text-xs text-primary-700 dark:text-primary-400">
                    You have 3 unread priority emails from key clients
                  </p>
                </div>
                <Button variant="primary" size="sm">
                  View
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
