"use client";

import { Download, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Invoice {
  id: string;
  number: string;
  amount: number;
  status: string;
  date: string;
  description?: string;
}

interface InvoiceListProps {
  invoices: Invoice[];
}

const statusVariant: Record<string, "success" | "warning" | "error" | "secondary" | "outline"> = {
  PAID: "success",
  SENT: "warning",
  DRAFT: "secondary",
  OVERDUE: "error",
  CANCELLED: "outline",
};

export function InvoiceList({ invoices }: InvoiceListProps) {
  if (invoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="mb-3 h-10 w-10 text-neutral-300 dark:text-neutral-600" />
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              No invoices yet
            </p>
            <p className="text-xs text-neutral-500">
              Your invoices will appear here once generated.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between px-6 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                  <FileText className="h-4 w-4 text-neutral-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">{invoice.number}</p>
                  <p className="text-xs text-neutral-500">
                    {invoice.description || `${invoice.date}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {invoice.amount === 0
                      ? "Free"
                      : `$${invoice.amount.toFixed(2)}`}
                  </p>
                  <Badge
                    variant={statusVariant[invoice.status] || "secondary"}
                    size="sm"
                  >
                    {invoice.status}
                  </Badge>
                </div>
                {invoice.status === "PAID" && (
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
