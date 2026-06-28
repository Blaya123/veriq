"use client";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, Play, Clock, Activity } from "lucide-react";

interface AgentCardProps {
  id: string;
  name: string;
  description?: string | null;
  model: string;
  isActive: boolean;
  executionCount?: number;
  lastRun?: { status: string; startedAt: string } | null;
  onExecute?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export function AgentCard({
  id,
  name,
  description,
  model,
  isActive,
  executionCount = 0,
  lastRun,
  onExecute,
  onEdit,
}: AgentCardProps) {
  return (
    <Card
      className="group relative overflow-hidden transition-all hover:shadow-md cursor-pointer"
      onClick={() => onEdit?.(id)}
    >
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                isActive
                  ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                  : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
              )}
            >
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">
                {name}
              </h3>
              <p className="text-xs text-neutral-500">{model}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={isActive ? "success" : "secondary"}
              size="sm"
            >
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        {description && (
          <p className="mt-3 text-sm text-neutral-600 line-clamp-2 dark:text-neutral-400">
            {description}
          </p>
        )}

        <div className="mt-4 flex items-center gap-4 text-xs text-neutral-500">
          <span className="flex items-center gap-1">
            <Activity className="h-3.5 w-3.5" />
            {executionCount} runs
          </span>
          {lastRun && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {new Date(lastRun.startedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onExecute?.(id);
          }}
          aria-label="Execute agent"
        >
          <Play className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
