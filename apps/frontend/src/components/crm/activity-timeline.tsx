"use client";

import { Phone, Mail, Calendar, FileText, CheckSquare, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Activity } from "@/types";

const activityIcons = {
  NOTE: FileText,
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Calendar,
  TASK: CheckSquare,
};

const activityColors = {
  NOTE: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
  CALL: "bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400",
  EMAIL: "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400",
  MEETING: "bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400",
  TASK: "bg-error-100 text-error-600 dark:bg-error-900/30 dark:text-error-400",
};

interface ActivityTimelineProps {
  activities: Activity[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-neutral-400">
        <Clock className="mb-2 h-8 w-8" />
        <p className="text-sm">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-4">
      {activities.map((activity, i) => {
        const Icon = activityIcons[activity.type];
        return (
          <div key={activity.id} className="relative flex gap-3 pl-6">
            {i < activities.length - 1 && (
              <div className="absolute left-2.5 top-8 bottom-0 w-px bg-neutral-200 dark:bg-neutral-700" />
            )}
            <div
              className={cn(
                "absolute left-0 flex h-5 w-5 items-center justify-center rounded-full",
                activityColors[activity.type]
              )}
            >
              <Icon className="h-3 w-3" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar
                    fallback={activity.createdBy.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                    size="sm"
                  />
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                    {activity.createdBy.name}
                  </span>
                  <Badge variant="outline" size="sm">
                    {activity.type}
                  </Badge>
                </div>
                <span className="text-xs text-neutral-400">
                  {formatTimeAgo(activity.createdAt)}
                </span>
              </div>
              <h4 className="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-50">
                {activity.subject}
              </h4>
              {activity.description && (
                <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                  {activity.description}
                </p>
              )}
              {activity.deal && (
                <p className="mt-1 text-xs text-neutral-400">
                  Deal: {activity.deal.name}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatTimeAgo(dateStr: string) {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
