"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Camera,
  Facebook,
  Send,
  Mail,
  Globe,
  Plug,
  Check,
  X,
  RefreshCw,
  ExternalLink,
  Search,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import type { Integration, IntegrationStatus } from "@/types";

const integrationDefs: {
  channel: Integration["channel"];
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}[] = [
  {
    channel: "whatsapp",
    name: "WhatsApp Business API",
    description:
      "Connect your WhatsApp Business account to send and receive messages, share media, and automate responses.",
    icon: MessageCircle,
    color: "text-[#25D366]",
    bgColor: "bg-[#25D366]/10",
  },
  {
    channel: "instagram",
    name: "Instagram Business",
    description:
      "Manage Instagram DMs and comments from your inbox. Reply to customers directly from VERIQ.",
    icon: Camera,
    color: "text-[#E4405F]",
    bgColor: "bg-[#E4405F]/10",
  },
  {
    channel: "facebook",
    name: "Facebook Page",
    description:
      "Connect your Facebook Page to manage messages, reviews, and comments in one place.",
    icon: Facebook,
    color: "text-[#1877F2]",
    bgColor: "bg-[#1877F2]/10",
  },
  {
    channel: "telegram",
    name: "Telegram Bot",
    description:
      "Create and connect a Telegram bot to handle customer inquiries and automate responses.",
    icon: Send,
    color: "text-[#0088CC]",
    bgColor: "bg-[#0088CC]/10",
  },
  {
    channel: "email",
    name: "Email (Gmail / Outlook)",
    description:
      "Connect your Gmail, Outlook, or any IMAP email account to manage emails alongside your other channels.",
    icon: Mail,
    color: "text-[#EA4335]",
    bgColor: "bg-[#EA4335]/10",
  },
  {
    channel: "website",
    name: "Website Chat Widget",
    description:
      "Add a chat widget to your website. Visitors can start conversations that appear in your unified inbox.",
    icon: Globe,
    color: "text-primary-500",
    bgColor: "bg-primary-500/10",
  },
];

const initialIntegrations: Integration[] = [
  {
    id: "i1",
    channel: "whatsapp",
    name: "WhatsApp Business API",
    description: "",
    icon: "MessageCircle",
    status: "connected",
    connectedAt: "2026-06-15T10:00:00Z",
  },
  {
    id: "i2",
    channel: "instagram",
    name: "Instagram Business",
    description: "",
    icon: "Camera",
    status: "disconnected",
  },
  {
    id: "i3",
    channel: "facebook",
    name: "Facebook Page",
    description: "",
    icon: "Facebook",
    status: "connected",
    connectedAt: "2026-06-10T14:30:00Z",
  },
  {
    id: "i4",
    channel: "telegram",
    name: "Telegram Bot",
    description: "",
    icon: "Send",
    status: "disconnected",
  },
  {
    id: "i5",
    channel: "email",
    name: "Email (Gmail / Outlook)",
    description: "",
    icon: "Mail",
    status: "pending",
  },
  {
    id: "i6",
    channel: "website",
    name: "Website Chat Widget",
    description: "",
    icon: "Globe",
    status: "disconnected",
  },
];

const statusConfig: Record<
  IntegrationStatus,
  { label: string; variant: "success" | "secondary" | "warning" | "error" }
> = {
  connected: { label: "Connected", variant: "success" },
  disconnected: { label: "Disconnected", variant: "secondary" },
  error: { label: "Error", variant: "error" },
  pending: { label: "Pending", variant: "warning" },
};

export default function IntegrationsPage() {
  const [search, setSearch] = useState("");
  const [integrations, setIntegrations] = useState(initialIntegrations);

  const filtered = integrationDefs.filter((def) =>
    def.name.toLowerCase().includes(search.toLowerCase())
  );

  const getStatus = (channel: Integration["channel"]): Integration["status"] => {
    return integrations.find((i) => i.channel === channel)?.status || "disconnected";
  };

  const handleToggle = (channel: Integration["channel"]) => {
    setIntegrations((prev) =>
      prev.map((i) => {
        if (i.channel !== channel) return i;
        const newStatus: IntegrationStatus =
          i.status === "connected" ? "disconnected" : "connected";
        toast.success(
          newStatus === "connected"
            ? `${i.name} connected successfully`
            : `${i.name} disconnected`
        );
        return {
          ...i,
          status: newStatus,
          connectedAt:
            newStatus === "connected"
              ? new Date().toISOString()
              : undefined,
        };
      })
    );
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Connect your channels to the Unified Inbox
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Search integrations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((def, i) => {
          const status = getStatus(def.channel);
          const statusInfo = statusConfig[status];
          const Icon = def.icon;

          return (
            <motion.div
              key={def.channel}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className={cn(
                  "group h-full transition-all duration-200",
                  status === "connected" &&
                    "border-success-200 dark:border-success-800"
                )}
              >
                <CardContent className="flex h-full flex-col p-5">
                  <div className="mb-4 flex items-start justify-between">
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl",
                        def.bgColor
                      )}
                    >
                      <Icon className={cn("h-6 w-6", def.color)} />
                    </div>
                    <Badge variant={statusInfo.variant} size="sm">
                      {statusInfo.label}
                    </Badge>
                  </div>

                  <h3 className="mb-1 text-base font-semibold text-neutral-900 dark:text-white">
                    {def.name}
                  </h3>
                  <p className="mb-4 flex-1 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                    {def.description}
                  </p>

                  <div className="mt-auto flex items-center gap-2">
                    {status === "connected" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggle(def.channel)}
                        className="flex-1"
                      >
                        <X className="mr-1.5 h-3.5 w-3.5" />
                        Disconnect
                      </Button>
                    ) : status === "pending" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="flex-1"
                      >
                        <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        Connecting...
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleToggle(def.channel)}
                        className="flex-1"
                      >
                        <Plug className="mr-1.5 h-3.5 w-3.5" />
                        Connect
                      </Button>
                    )}

                    {status === "connected" && (
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800">
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="mb-3 h-10 w-10 text-neutral-300 dark:text-neutral-600" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            No integrations found
          </h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Try a different search term
          </p>
        </div>
      )}
    </div>
  );
}
