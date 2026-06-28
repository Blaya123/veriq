"use client";

import { motion } from "framer-motion";
import {
  MessageSquare,
  MessageCircle,
  Camera,
  Facebook,
  Send,
  Mail,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChannelType } from "@/types";

const channels: { key: ChannelType | "all"; label: string; icon: React.ElementType }[] = [
  { key: "all", label: "All", icon: MessageSquare },
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { key: "instagram", label: "Instagram", icon: Camera },
  { key: "facebook", label: "Facebook", icon: Facebook },
  { key: "telegram", label: "Telegram", icon: Send },
  { key: "email", label: "Email", icon: Mail },
  { key: "website", label: "Website", icon: Globe },
];

interface ChannelFilterProps {
  selected: ChannelType | "all";
  onSelect: (channel: ChannelType | "all") => void;
}

export function ChannelFilter({ selected, onSelect }: ChannelFilterProps) {
  return (
    <div className="flex gap-1 overflow-x-auto px-4 pb-2 scrollbar-none">
      {channels.map((channel) => {
        const Icon = channel.icon;
        const isActive = selected === channel.key;
        return (
          <button
            key={channel.key}
            onClick={() => onSelect(channel.key)}
            className={cn(
              "relative flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
              isActive
                ? "text-primary-700 dark:text-primary-300"
                : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="channel-bg"
                className="absolute inset-0 rounded-lg bg-primary-50 dark:bg-primary-900/30"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <Icon className="relative h-3.5 w-3.5" />
            <span className="relative">{channel.label}</span>
          </button>
        );
      })}
    </div>
  );
}
