"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, Mic, Square } from "lucide-react";

const models = [
  { value: "gpt-4", label: "GPT-4" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  { value: "claude-3-opus", label: "Claude 3 Opus" },
  { value: "claude-3-sonnet", label: "Claude 3 Sonnet" },
  { value: "gemini-pro", label: "Gemini Pro" },
];

interface ChatInputProps {
  onSend: (content: string, model: string) => void;
  onStop?: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  onStop,
  isLoading = false,
  placeholder = "Type a message...",
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4");
  const [showModels, setShowModels] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim(), selectedModel);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mx-auto max-w-4xl space-y-2">
        <div className="flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={1}
              className="w-full resize-none rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3 pr-12 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-50 dark:placeholder:text-neutral-500"
              disabled={isLoading}
            />

            <button
              className="absolute bottom-2.5 right-3 rounded-lg p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              aria-label="Attach file"
            >
              <Paperclip className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {isLoading && onStop ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onStop}
                aria-label="Stop generating"
              >
                <Square className="h-4 w-4 fill-current" />
              </Button>
            ) : (
              <Button
                onClick={handleSend}
                disabled={!input.trim()}
                size="sm"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="relative">
            <button
              onClick={() => setShowModels(!showModels)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors"
            >
              {models.find((m) => m.value === selectedModel)?.label || "Model"}
              <svg
                className={`h-3 w-3 transition-transform ${showModels ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showModels && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowModels(false)}
                />
                <div className="absolute bottom-full left-0 z-20 mb-1 w-44 rounded-lg border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                  {models.map((model) => (
                    <button
                      key={model.value}
                      onClick={() => {
                        setSelectedModel(model.value);
                        setShowModels(false);
                      }}
                      className={`w-full rounded-md px-3 py-1.5 text-left text-xs font-medium transition-colors ${
                        selectedModel === model.value
                          ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300"
                          : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
                      }`}
                    >
                      {model.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <span className="text-[11px] text-neutral-400">
            Press Enter to send, Shift+Enter for new line
          </span>
        </div>
      </div>
    </div>
  );
}
