"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/components/ai/chat-message";
import { ChatInput } from "@/components/ai/chat-input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  MessageSquare,
  Trash2,
  Search,
  PanelRightOpen,
  PanelRightClose,
  Bot,
} from "lucide-react";

interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  _count: { messages: number };
}

interface Message {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  createdAt: string;
}

export default function AiChatPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showContext, setShowContext] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (activeChatId) {
      loadMessages(activeChatId);
    }
  }, [activeChatId]);

  const loadChats = async () => {
    try {
      const data = await api.get<Chat[]>("/ai-chat");
      setChats(data);
    } catch {
      // handle error
    } finally {
      setIsLoadingChats(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    setIsLoadingMessages(true);
    try {
      const data = await api.get<Message[]>(`/ai-chat/${chatId}/messages`);
      setMessages(data);
    } catch {
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const createChat = async () => {
    try {
      const chat = await api.post<Chat>("/ai-chat", { title: "New Chat" });
      setChats((prev) => [chat, ...prev]);
      setActiveChatId(chat.id);
      setMessages([]);
    } catch {
      // handle error
    }
  };

  const deleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    try {
      await api.delete(`/ai-chat/${chatId}`);
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      if (activeChatId === chatId) {
        setActiveChatId(null);
        setMessages([]);
      }
    } catch {
      // handle error
    }
  };

  const sendMessage = async (content: string, model: string) => {
    if (!activeChatId) {
      const chat = await api.post<Chat>("/ai-chat", { title: content.slice(0, 100) });
      setChats((prev) => [chat, ...prev]);
      setActiveChatId(chat.id);
      setMessages([]);
      await streamMessage(chat.id, content, model);
      return;
    }

    await streamMessage(activeChatId, content, model);
  };

  const streamMessage = async (chatId: string, content: string, model: string) => {
    setIsStreaming(true);

    const userMsg: Message = {
      id: "temp-" + Date.now(),
      role: "USER",
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    const assistantId = "assistant-" + Date.now();
    const assistantMsg: Message = {
      id: assistantId,
      role: "ASSISTANT",
      content: "",
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/ai-chat/${chatId}/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, model }),
      });

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const json = JSON.parse(line.slice(6));
              if (json.content) {
                fullContent += json.content;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: fullContent } : m
                  )
                );
              }
              if (json.done) {
                await loadChats();
              }
            } catch {
              // skip parse errors
            }
          }
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Sorry, an error occurred while generating a response." }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-6">
      <div className="flex w-full">
        <aside
          className={cn(
            "flex w-72 flex-col border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
          )}
        >
          <div className="p-3 border-b border-neutral-200 dark:border-neutral-800">
            <Button
              onClick={createChat}
              className="w-full"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              New Chat
            </Button>

            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 w-full rounded-lg border border-neutral-200 bg-neutral-50 pl-8 pr-3 text-xs placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {isLoadingChats ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))
            ) : filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-neutral-400">
                <MessageSquare className="h-8 w-8 mb-2" />
                <p className="text-xs">No chats yet</p>
              </div>
            ) : (
              filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={cn(
                    "group flex items-center justify-between rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors",
                    activeChatId === chat.id
                      ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300"
                      : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate text-xs">{chat.title}</span>
                  </div>
                  <button
                    onClick={(e) => deleteChat(e, chat.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-all"
                    aria-label="Delete chat"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          {activeChatId ? (
            <>
              <div className="flex-1 overflow-y-auto px-4">
                <div className="mx-auto max-w-3xl">
                  {isLoadingMessages ? (
                    <div className="space-y-4 py-8">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex gap-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : messages.length === 0 && !isStreaming ? (
                    <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
                      <Bot className="h-12 w-12 mb-3" />
                      <h3 className="text-lg font-semibold text-neutral-600 dark:text-neutral-300">
                        Start a conversation
                      </h3>
                      <p className="text-sm mt-1">
                        Ask me anything about your business
                      </p>
                    </div>
                  ) : (
                    <div className="py-4">
                      {messages.map((msg) => (
                        <ChatMessage
                          key={msg.id}
                          role={
                            msg.role === "USER"
                              ? "user"
                              : msg.role === "ASSISTANT"
                              ? "assistant"
                              : "system"
                          }
                          content={msg.content}
                          timestamp={new Date(
                            msg.createdAt
                          ).toLocaleTimeString()}
                        />
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
              </div>

              <ChatInput
                onSend={sendMessage}
                isLoading={isStreaming}
                placeholder="Ask VERIQ AI..."
              />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center max-w-md">
                <Bot className="h-16 w-16 mx-auto mb-4 text-primary-500" />
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  VERIQ AI Chat
                </h2>
                <p className="mt-2 text-sm text-neutral-500">
                  Ask questions, get insights, generate content, and more.
                  Powered by GPT-4, Claude, and Gemini.
                </p>
                <Button onClick={createChat} className="mt-6">
                  <Plus className="h-4 w-4 mr-1.5" />
                  Start a New Chat
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
