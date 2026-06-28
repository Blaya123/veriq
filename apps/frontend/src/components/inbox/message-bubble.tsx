"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { CheckCheck, Clock, FileText, Download } from "lucide-react";
import type { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
  showAvatar?: boolean;
}

export function MessageBubble({ message, showAvatar = true }: MessageBubbleProps) {
  const time = new Date(message.timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const statusIcon = {
    sending: <Clock className="h-3 w-3 text-neutral-400" />,
    sent: <Clock className="h-3 w-3 text-neutral-400" />,
    delivered: <CheckCheck className="h-3 w-3 text-neutral-400" />,
    read: <CheckCheck className="h-3 w-3 text-primary-500" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "flex gap-2 px-4 py-1",
        !message.inbound && "flex-row-reverse"
      )}
    >
      {message.inbound && showAvatar ? (
        <Avatar
          fallback={message.senderName
            .split(" ")
            .map((n) => n[0])
            .join("")}
          src={message.senderAvatar}
          size="sm"
          className="mt-1 flex-shrink-0"
        />
      ) : (
        <div className="w-8 flex-shrink-0" />
      )}

      <div
        className={cn(
          "flex max-w-[75%] flex-col",
          !message.inbound && "items-end"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-2 text-sm leading-relaxed",
            message.inbound
              ? "rounded-bl-sm bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
              : "rounded-br-sm bg-primary-600 text-white"
          )}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>

          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {message.attachments.map((att) => {
                if (att.type === "image") {
                  return (
                    <div
                      key={att.id}
                      className="overflow-hidden rounded-lg"
                    >
                      <img
                        src={att.url}
                        alt={att.name}
                        className="h-auto max-w-full cursor-pointer rounded-lg transition-opacity hover:opacity-90"
                      />
                    </div>
                  );
                }
                return (
                  <a
                    key={att.id}
                    href={att.url}
                    download={att.name}
                    className={cn(
                      "flex items-center gap-2 rounded-lg p-2 text-xs",
                      message.inbound
                        ? "bg-neutral-200 dark:bg-neutral-700"
                        : "bg-primary-500"
                    )}
                  >
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate flex-1">{att.name}</span>
                    <Download className="h-3.5 w-3.5 flex-shrink-0" />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        <div
          className={cn(
            "mt-1 flex items-center gap-1 px-1",
            message.inbound ? "justify-start" : "justify-end"
          )}
        >
          <span className="text-[10px] text-neutral-400">{time}</span>
          {!message.inbound && statusIcon[message.status]}
        </div>
      </div>
    </motion.div>
  );
}
