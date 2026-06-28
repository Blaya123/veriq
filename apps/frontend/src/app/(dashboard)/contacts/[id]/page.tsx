"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Edit3,
  Plus,
  MessageSquare,
  Target,
  DollarSign,
} from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ActivityTimeline } from "@/components/crm/activity-timeline";
import type { Deal, Activity } from "@/types";

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

interface ContactDetail {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  source?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  _count?: { deals?: number; conversations?: number; activities?: number };
  deals: Deal[];
  activities: Activity[];
}

const activityIcons: Record<string, string> = {
  NOTE: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
  CALL: "bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400",
  EMAIL: "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400",
  MEETING: "bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400",
  TASK: "bg-error-100 text-error-600 dark:bg-error-900/30 dark:text-error-400",
};

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [contact, setContact] = useState<ContactDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<ContactDetail>(`/contacts/${params.id}`);
        setContact(data);
      } catch (err) {
        console.error("Failed to load contact", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-primary-600" />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex flex-col items-center py-20 text-neutral-400">
        <p className="text-lg">Contact not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  const totalDealValue = contact.deals?.reduce(
    (sum, d) => sum + (d.status === "WON" ? d.value : 0),
    0
  );

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to contacts
      </button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar
                  fallback={contact.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                  size="xl"
                  className="mb-4"
                />
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                  {contact.name}
                </h2>
                <p className="text-sm text-neutral-500">
                  {contact.source || "Contact"}
                </p>
                <Button variant="outline" size="sm" className="mt-4">
                  <Edit3 className="mr-1.5 h-4 w-4" />
                  Edit Contact
                </Button>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-3 text-sm text-neutral-600 hover:text-primary-600 dark:text-neutral-400"
                  >
                    <Mail className="h-4 w-4" />
                    {contact.email}
                  </a>
                )}
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-3 text-sm text-neutral-600 hover:text-primary-600 dark:text-neutral-400"
                  >
                    <Phone className="h-4 w-4" />
                    {contact.phone}
                  </a>
                )}
                <div className="flex items-center gap-3 text-sm text-neutral-500">
                  <Calendar className="h-4 w-4" />
                  Created {new Date(contact.createdAt).toLocaleDateString()}
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-around text-center">
                <div>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                    {contact._count?.deals ?? 0}
                  </p>
                  <p className="text-xs text-neutral-500">Deals</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-success-600">
                    {formatCurrency(totalDealValue)}
                  </p>
                  <p className="text-xs text-neutral-500">Won Value</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                    {contact._count?.activities ?? 0}
                  </p>
                  <p className="text-xs text-neutral-500">Activities</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Linked Deals</span>
                <Badge variant="outline" size="sm">
                  {contact.deals?.length || 0}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contact.deals && contact.deals.length > 0 ? (
                <div className="space-y-2">
                  {contact.deals.map((deal) => (
                    <div
                      key={deal.id}
                      className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 dark:border-neutral-700"
                    >
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary-600" />
                        <div>
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                            {deal.name}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {formatCurrency(deal.value, deal.currency)}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          deal.status === "WON"
                            ? "success"
                            : deal.status === "LOST"
                            ? "error"
                            : "warning"
                        }
                        size="sm"
                      >
                        {deal.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-neutral-400">
                  No deals linked
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityTimeline activities={contact.activities || []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
