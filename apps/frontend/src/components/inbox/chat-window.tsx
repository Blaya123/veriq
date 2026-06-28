"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Video,
  Info,
  MoreHorizontal,
  MessageCircle,
  Camera,
  Facebook,
  Send,
  Mail,
  Globe,
  CheckCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageBubble } from "@/components/inbox/message-bubble";
import { MessageInput } from "@/components/inbox/message-input";
import type { Conversation, Message } from "@/types";

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

const statusColors: Record<string, string> = {
  online: "bg-success-500",
  away: "bg-warning-500",
  offline: "bg-neutral-400",
};

const mockMessages: Message[] = [
  {
    id: "m1",
    conversationId: "1",
    content: "Hi there! I'm interested in learning more about your platform.",
    senderId: "c1",
    senderName: "Sarah Chen",
    senderAvatar: "https://i.pravatar.cc/150?u=sarah",
    inbound: true,
    status: "read",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    channel: "whatsapp",
  },
  {
    id: "m2",
    conversationId: "1",
    content: "Hi Sarah! Thanks for reaching out. I'd be happy to help. What would you like to know?",
    senderId: "agent1",
    senderName: "You",
    inbound: false,
    status: "read",
    timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    channel: "whatsapp",
  },
  {
    id: "m3",
    conversationId: "1",
    content: "I'm particularly interested in your premium plan. Can you tell me more about the features?",
    senderId: "c1",
    senderName: "Sarah Chen",
    senderAvatar: "https://i.pravatar.cc/150?u=sarah",
    inbound: true,
    status: "read",
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    channel: "whatsapp",
  },
  {
    id: "m4",
    conversationId: "1",
    content: "Here's a quick overview of our premium features:",
    senderId: "agent1",
    senderName: "You",
    inbound: false,
    status: "read",
    timestamp: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    channel: "whatsapp",
  },
  {
    id: "m5",
    conversationId: "1",
    content: "That sounds perfect! Can you also tell me about the pricing?",
    senderId: "c1",
    senderName: "Sarah Chen",
    senderAvatar: "https://i.pravatar.cc/150?u=sarah",
    inbound: true,
    status: "read",
    timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    channel: "whatsapp",
  },
  {
    id: "m6",
    conversationId: "1",
    content: "The premium plan is $79/month with a 14-day free trial. I can also set up a demo if you'd like to see it in action!",
    senderId: "agent1",
    senderName: "You",
    inbound: false,
    status: "read",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    channel: "whatsapp",
  },
  {
    id: "m7",
    conversationId: "1",
    content: "A demo would be great! How about next Tuesday?",
    senderId: "c1",
    senderName: "Sarah Chen",
    senderAvatar: "https://i.pravatar.cc/150?u=sarah",
    inbound: true,
    status: "read",
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    channel: "whatsapp",
  },
  {
    id: "m8",
    conversationId: "1",
    content: "Tuesday works perfectly! I'll send you a calendar invite with the details.",
    senderId: "agent1",
    senderName: "You",
    inbound: false,
    status: "delivered",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    channel: "whatsapp",
  },
];

interface ChatWindowProps {
  conversation: Conversation | null;
  onAiToggle: () => void;
}

export function ChatWindow({ conversation, onAiToggle }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState(mockMessages);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <div className="mb-4 rounded-2xl bg-neutral-100 p-4 dark:bg-neutral-800">
          <MessageCircle className="h-10 w-10 text-neutral-400" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
          No conversation selected
        </h3>
        <p className="mt-1 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
          Choose a conversation from the left panel to start chatting
        </p>
      </div>
    );
  }

  const ChannelIcon = channelIcons[conversation.channel];

  const handleSend = (content: string) => {
    const newMsg: Message = {
      id: `m${Date.now()}`,
      conversationId: conversation.id,
      content,
      senderId: "agent1",
      senderName: "You",
      inbound: false,
      status: "sent",
      timestamp: new Date().toISOString(),
      channel: conversation.channel,
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-neutral-200 px-4 py-2.5 dark:border-neutral-700">
        <div className="relative flex-shrink-0">
          <Avatar
            src={conversation.contact.avatar}
            fallback={conversation.contact.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
            size="sm"
          />
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-neutral-900",
              statusColors[conversation.contact.status]
            )}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
              {conversation.contact.name}
            </span>
            {ChannelIcon && (
              <ChannelIcon
                className={cn(
                  "h-3.5 w-3.5 flex-shrink-0",
                  channelColors[conversation.channel]
                )}
              />
            )}
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {conversation.contact.status === "online"
              ? "Online"
              : conversation.contact.status === "away"
                ? "Away"
                : "Offline"}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <Phone className="h-4 w-4" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <Video className="h-4 w-4" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View contact</DropdownMenuItem>
              <DropdownMenuItem>Mute conversation</DropdownMenuItem>
              <DropdownMenuItem>Block contact</DropdownMenuItem>
              <DropdownMenuItem>Delete conversation</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-3">
        {messages.map((msg, i) => {
          const showAvatar =
            msg.inbound &&
            (i === 0 ||
              messages[i - 1].senderId !== msg.senderId);
          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              showAvatar={showAvatar}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSend={handleSend} onAiReply={onAiToggle} />
    </div>
  );
}
