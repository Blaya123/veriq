"use client";

import { useState } from "react";
import { DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { DealCard } from "./deal-card";
import type { Deal, PipelineStage } from "@/types";

const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "\u20AC",
  GBP: "\u00A3",
  NGN: "\u20A6",
};

function formatCurrency(value: number, currency = "USD") {
  const symbol = currencySymbols[currency] || currency;
  return `${symbol}${value.toLocaleString()}`;
}

interface PipelineColumnProps {
  stage: PipelineStage;
  deals: Deal[];
  onDrop: (e: React.DragEvent, stageId: string) => void;
  onDealClick: (deal: Deal) => void;
}

export function PipelineColumn({
  stage,
  deals,
  onDrop,
  onDealClick,
}: PipelineColumnProps) {
  const [dragOver, setDragOver] = useState(false);

  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        setDragOver(false);
        onDrop(e, stage.id);
      }}
      className={cn(
        "flex w-72 flex-shrink-0 flex-col rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900/50",
        dragOver && "border-primary-400 bg-primary-50/50 dark:border-primary-600 dark:bg-primary-900/20"
      )}
    >
      <div className="flex items-center justify-between border-b border-neutral-200 px-3 py-3 dark:border-neutral-700">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: stage.color || "#6b7280" }}
          />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
            {stage.name}
          </h3>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-200 px-1.5 text-xs font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">
            {deals.length}
          </span>
        </div>
      </div>

      {totalValue > 0 && (
        <div className="flex items-center gap-1 border-b border-neutral-200 px-3 py-1.5 text-xs text-neutral-500 dark:border-neutral-700">
          <DollarSign className="h-3 w-3" />
          {formatCurrency(totalValue)}
        </div>
      )}

      <div className="flex flex-col gap-2 overflow-y-auto p-3">
        {deals.map((deal) => (
          <DealCard
            key={deal.id}
            deal={deal}
            onClick={onDealClick}
          />
        ))}
        {deals.length === 0 && (
          <p className="py-8 text-center text-xs text-neutral-400">
            No deals in this stage
          </p>
        )}
      </div>
    </div>
  );
}
