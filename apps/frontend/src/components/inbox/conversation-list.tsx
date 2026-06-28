"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MessageCircle,
  Camera,
  Facebook,
  Send,
  Mail,
  Globe,
  CheckCheck,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChannelFilter } from "@/components/inbox/channel-filter";
import type { Conversation, ChannelType } from "@/types";

const channelIcons: Record<string, React.ElementType> = {
  whatsapp: MessageCircle,
  instagram: Camera,
  facebook: Facebook,
  telegram: Send,
  email: Mail,
  website: Globe,
};

const channelColors: Record<string, string> = {
  whatsapp: "text-[#25D366]",
  instagram: "text-[#E4405F]",
  facebook: "text-[#1877F2]",
  telegram: "text-[#0088CC]",
  email: "text-[#EA4335]",
  website: "text-primary-500",
};

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    contact: {
      id: "c1",
      name: "Sarah Chen",
      status: "online",
      channel: "whatsapp",
      avatar: "https://i.pravatar.cc/150?u=sarah",
    },
    lastMessage: {
      content: "Hi! I'm interested in your premium plan. Can you tell me more about the features?",
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      status: "read",
    },
    unreadCount: 3,
    channel: "whatsapp",
  },
  {
    id: "2",
    contact: {
      id: "c2",
      name: "Marcus Johnson",
      status: "away",
      channel: "instagram",
    },
    lastMessage: {
      content: "Love your new collection! When will the blue variant be back in stock?",
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      status: "delivered",
    },
    unreadCount: 0,
    channel: "instagram",
  },
  {
    id: "3",
    contact: {
      id: "c3",
      name: "Elena Rodriguez",
      status: "offline",
      channel: "facebook",
      email: "elena@example.com",
    },
    lastMessage: {
      content: "Thanks for the quick support! The issue has been resolved.",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      status: "read",
    },
    unreadCount: 0,
    channel: "facebook",
  },
  {
    id: "4",
    contact: {
      id: "c4",
      name: "Alex Kim",
      status: "online",
      channel: "telegram",
    },
    lastMessage: {
      content: "Can we schedule a demo for next Tuesday?",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: "sent",
    },
    unreadCount: 1,
    channel: "telegram",
  },
  {
    id: "5",
    contact: {
      id: "c5",
      name: "Priya Sharma",
      status: "online",
      channel: "email",
      email: "priya@acme.com",
    },
    lastMessage: {
      content: "Please find attached the signed contract for the Q3 partnership.",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      status: "delivered",
    },
    unreadCount: 0,
    channel: "email",
  },
  {
    id: "6",
    contact: {
      id: "c6",
      name: "James Wilson",
      status: "away",
      channel: "website",
    },
    lastMessage: {
      content: "I need help with the checkout process. Payment keeps failing.",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      status: "read",
    },
    unreadCount: 2,
    channel: "website",
  },
  {
    id: "7",
    contact: {
      id: "c7",
      name: "Lisa Thompson",
      status: "offline",
      channel: "whatsapp",
    },
    lastMessage: {
      content: "Perfect, see you tomorrow at 2pm!",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      status: "read",
    },
    unreadCount: 0,
    channel: "whatsapp",
  },
];

const statusColors: Record<string, string> = {
  online: "bg-success-500",
  away: "bg-warning-500",
  offline: "bg-neutral-400",
};

interface ConversationListProps {
  selectedId: string | null;
  onSelect: (conversation: Conversation) => void;
}

export function ConversationList({ selectedId, onSelect }: ConversationListProps) {
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<ChannelType | "all">("all");

  const filtered = mockConversations.filter((conv) => {
    const matchesSearch = conv.contact.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesChannel =
      channelFilter === "all" || conv.channel === channelFilter;
    return matchesSearch && matchesChannel;
  });

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
        <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
          Conversations
        </h2>
        <Badge variant="secondary" size="sm" className="ml-auto">
          {filtered.length}
        </Badge>
      </div>

      <div className="relative px-4 pt-3 pb-1">
        <Search className="absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-full rounded-lg border border-neutral-200 bg-neutral-50 pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50"
        />
      </div>

      <ChannelFilter selected={channelFilter} onSelect={setChannelFilter} />

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence initial={false}>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="mb-2 h-8 w-8 text-neutral-300 dark:text-neutral-600" />
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                No conversations found
              </p>
            </div>
          ) : (
            filtered.map((conv, i) => {
              const ChannelIcon = channelIcons[conv.channel];
              const isSelected = selectedId === conv.id;

              return (
                <motion.button
                  key={conv.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => onSelect(conv)}
                  className={cn(
                    "relative flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
                    isSelected
                      ? "bg-primary-50 dark:bg-primary-900/20"
                      : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  )}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar
                      src={conv.contact.avatar}
                      fallback={conv.contact.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                      size="md"
                    />
                    <span
                      className={cn(
                        "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-neutral-900",
                        statusColors[conv.contact.status]
                      )}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                        {conv.contact.name}
                      </span>
                      <span className="flex-shrink-0 text-xs text-neutral-400">
                        {formatRelativeTime(conv.lastMessage.timestamp)}
                      </span>
                    </div>

                    <div className="mt-0.5 flex items-center gap-1.5">
                      {ChannelIcon && (
                        <ChannelIcon
                          className={cn(
                            "h-3 w-3 flex-shrink-0",
                            channelColors[conv.channel]
                          )}
                        />
                      )}
                      <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">
                        {conv.lastMessage.content}
                      </p>
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                      {conv.lastMessage.status === "read" && (
                        <CheckCheck className="h-3 w-3 text-primary-500" />
                      )}
                      {conv.lastMessage.status === "delivered" && (
                        <CheckCheck className="h-3 w-3 text-neutral-400" />
                      )}
                      {conv.lastMessage.status === "sent" && (
                        <Clock className="h-3 w-3 text-neutral-400" />
                      )}
                      {conv.contact.status === "online" && (
                        <span className="text-xs text-success-600 dark:text-success-400">
                          Online
                        </span>
                      )}
                    </div>
                  </div>

                  {conv.unreadCount > 0 && (
                    <Badge
                      variant="default"
                      size="sm"
                      className="ml-auto flex-shrink-0"
                    >
                      {conv.unreadCount}
                    </Badge>
                  )}
                </motion.button>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
