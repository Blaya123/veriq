"use client";

import { Calendar, User, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import type { Deal } from "@/types";

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

function getProbabilityColor(probability: number) {
  if (probability >= 80) return "success";
  if (probability >= 50) return "warning";
  return "error";
}

interface DealCardProps {
  deal: Deal;
  onDragStart?: (e: React.DragEvent, deal: Deal) => void;
  onClick?: (deal: Deal) => void;
}

export function DealCard({ deal, onDragStart, onClick }: DealCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, deal)}
      onClick={() => onClick?.(deal)}
      className="cursor-pointer rounded-lg border border-neutral-200 bg-white p-3 shadow-sm transition-all hover:shadow-md active:shadow-inner dark:border-neutral-700 dark:bg-neutral-800"
    >
      <div className="mb-2 flex items-start justify-between">
        <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
          {deal.name}
        </h4>
        <Badge
          variant={getProbabilityColor(deal.probability) as any}
          size="sm"
        >
          {deal.probability}%
        </Badge>
      </div>

      <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-success-600 dark:text-success-400">
        <DollarSign className="h-3.5 w-3.5" />
        {formatCurrency(deal.value, deal.currency)}
      </div>

      {deal.contact && (
        <div className="mb-1.5 flex items-center gap-1.5 text-xs text-neutral-500">
          <User className="h-3 w-3" />
          {deal.contact.name}
        </div>
      )}

      {deal.expectedCloseDate && (
        <div className="mb-2 flex items-center gap-1.5 text-xs text-neutral-500">
          <Calendar className="h-3 w-3" />
          {new Date(deal.expectedCloseDate).toLocaleDateString()}
        </div>
      )}

      <div className="flex items-center justify-between">
        {deal.assignedTo ? (
          <Avatar
            fallback={deal.assignedTo.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
            size="sm"
          />
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
