"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, Bot, Image as ImageIcon, FileUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageInputProps {
  onSend: (content: string) => void;
  onAiReply: () => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, onAiReply, disabled }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [showAttachments, setShowAttachments] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleSend = () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setContent("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-neutral-200 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-900">
      <AnimatePresence>
        {showAttachments && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            className="mb-2 flex gap-2"
          >
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              Image
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              <FileUp className="h-3.5 w-3.5" />
              File
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <input ref={fileInputRef} type="file" className="hidden" multiple />

      <div className="flex items-end gap-2">
        <button
          onClick={() => setShowAttachments(!showAttachments)}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800"
        >
          <Paperclip className="h-4 w-4" />
        </button>

        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            disabled={disabled}
            className="max-h-32 w-full resize-none rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50"
          />
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleSend}
          disabled={!content.trim() || disabled}
          className="h-9 w-9 flex-shrink-0 rounded-lg p-0"
        >
          <Send className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onAiReply}
          disabled={disabled}
          className="h-9 w-9 flex-shrink-0 rounded-lg p-0"
        >
          <Bot className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
