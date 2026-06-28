"use client";

import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Bot, User, Copy, Check } from "lucide-react";
import { useState } from "react";

interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
}

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = role === "user";
  const isSystem = role === "system";

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "flex w-full gap-3 py-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar
          fallback="AI"
          size="sm"
          className="bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
        />
      )}

      <div className={cn("flex max-w-[80%] flex-col gap-1", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser &&
              "bg-primary-600 text-white rounded-br-md",
            !isUser &&
              "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100 rounded-bl-md",
            isSystem &&
              "bg-warning-50 text-warning-800 border border-warning-200 dark:bg-warning-900/20 dark:text-warning-300 dark:border-warning-800"
          )}
        >
          <div className="whitespace-pre-wrap">{content}</div>
        </div>

        <div className="flex items-center gap-2 px-1">
          {timestamp && (
            <span className="text-[11px] text-neutral-400">
              {timestamp}
            </span>
          )}
          {!isUser && content.length > 0 && (
            <button
              onClick={handleCopy}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              aria-label="Copy message"
            >
              {copied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          )}
        </div>
      </div>

      {isUser && (
        <Avatar
          fallback="U"
          size="sm"
          className="bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300"
        />
      )}
    </div>
  );
}
