"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PanelRightOpen, PanelRightClose } from "lucide-react";
import { ConversationList } from "@/components/inbox/conversation-list";
import { ChatWindow } from "@/components/inbox/chat-window";
import { AiAssistant } from "@/components/inbox/ai-assistant";
import { EmptyState } from "@/components/inbox/empty-state";
import type { Conversation } from "@/types";

export default function InboxPage() {
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    setMobileView("chat");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-2 lg:hidden dark:border-neutral-700">
        <button
          onClick={() => setMobileView("list")}
          className="text-sm font-medium text-primary-600 dark:text-primary-400"
        >
          {mobileView === "chat" && "← Back"}
        </button>
        <h1 className="text-sm font-semibold text-neutral-900 dark:text-white">
          {mobileView === "list" ? "Inbox" : selectedConversation?.contact.name || "Chat"}
        </h1>
        <div className="w-12" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {mobileView === "list" ? (
            <motion.div
              key="list"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="w-full flex-shrink-0 border-r border-neutral-200 lg:w-80 xl:w-96 dark:border-neutral-700"
            >
              <ConversationList
                selectedId={selectedConversation?.id || null}
                onSelect={handleSelectConversation}
              />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              className="flex flex-1 flex-col overflow-hidden"
            >
              {selectedConversation ? (
                <ChatWindow
                  conversation={selectedConversation}
                  onAiToggle={() => setAiOpen(!aiOpen)}
                />
              ) : (
                <EmptyState />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="hidden lg:flex lg:w-80 xl:w-96 flex-shrink-0 border-r border-neutral-200 dark:border-neutral-700">
          {!selectedConversation ? (
            <EmptyState />
          ) : (
            <ChatWindow
              conversation={selectedConversation}
              onAiToggle={() => setAiOpen(!aiOpen)}
            />
          )}
        </div>

        <div className="hidden lg:flex flex-shrink-0">
          <AiAssistant isOpen={aiOpen} onToggle={() => setAiOpen(!aiOpen)} />
        </div>
      </div>

      <button
        onClick={() => setAiOpen(!aiOpen)}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg transition-colors hover:bg-primary-700 lg:hidden"
      >
        {aiOpen ? (
          <PanelRightClose className="h-5 w-5" />
        ) : (
          <PanelRightOpen className="h-5 w-5" />
        )}
      </button>

      <AnimatePresence>
        {aiOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 right-0 z-40 w-80 border-l border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900 lg:hidden"
          >
            <AiAssistant isOpen={true} onToggle={() => setAiOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
