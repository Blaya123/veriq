"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Sparkles,
  Send,
  X,
  ChevronRight,
  FileText,
  Calendar,
  UserPlus,
  BarChart3,
  Lightbulb,
  Target,
  Zap,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { AiSuggestion, LeadQualification, NextAction } from "@/types";

const suggestions: AiSuggestion[] = [
  {
    id: "s1",
    content:
      "Thank you for your interest in our premium plan! I'd be happy to walk you through all the features. Would you like to schedule a quick 15-minute call this week?",
    tone: "professional",
    confidence: 0.96,
  },
  {
    id: "s2",
    content:
      "Hey Sarah! Great to hear you're interested! The premium plan comes with unlimited team members, advanced analytics, and priority support. Want me to set up a demo for you? 🎉",
    tone: "friendly",
    confidence: 0.92,
  },
  {
    id: "s3",
    content:
      "Premium plan details: Unlimited members, AI analytics, priority support, 50GB storage. $79/mo. Happy to demo. When works?",
    tone: "concise",
    confidence: 0.88,
  },
];

const leadQualification: LeadQualification = {
  score: 85,
  intent: "high",
  budget: "$500-1000/month",
  timeline: "This month",
  requirements: ["Team management", "API access", "Custom reports"],
};

const nextActions: NextAction[] = [
  { id: "a1", label: "Send invoice", icon: "FileText", action: "send_invoice" },
  { id: "a2", label: "Book meeting", icon: "Calendar", action: "book_meeting" },
  { id: "a3", label: "Transfer to agent", icon: "UserPlus", action: "transfer" },
];

const actionIcons: Record<string, React.ElementType> = {
  FileText,
  Calendar,
  UserPlus,
};

const toneStyles: Record<string, { label: string; icon: React.ElementType }> = {
  professional: { label: "Professional", icon: Lightbulb },
  friendly: { label: "Friendly", icon: Zap },
  concise: { label: "Concise", icon: Target },
};

interface AiAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function AiAssistant({ isOpen, onToggle }: AiAssistantProps) {
  return (
    <>
      <button
        onClick={onToggle}
        className={cn(
          "flex items-center gap-2 border-l border-neutral-200 bg-white px-3 py-2 text-sm font-medium transition-colors dark:border-neutral-700 dark:bg-neutral-900",
          isOpen
            ? "text-primary-600 dark:text-primary-400"
            : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
        )}
      >
        <Bot className="h-4 w-4" />
        <span className="hidden lg:inline">AI Assistant</span>
        <ChevronRight
          className={cn(
            "ml-auto h-4 w-4 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 360, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="overflow-hidden border-l border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
          >
            <div className="flex h-full w-90 flex-col">
              <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                    AI Assistant
                  </span>
                </div>
                <button
                  onClick={onToggle}
                  className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto p-4">
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    <MessageSquare className="h-3 w-3" />
                    Reply Suggestions
                  </div>
                  <div className="space-y-2">
                    {suggestions.map((s) => {
                      const ToneIcon = toneStyles[s.tone].icon;
                      return (
                        <motion.div
                          key={s.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="group rounded-lg border border-neutral-200 p-3 transition-colors hover:border-primary-200 hover:bg-primary-50/50 dark:border-neutral-700 dark:hover:border-primary-800 dark:hover:bg-primary-900/10"
                        >
                          <div className="mb-1.5 flex items-center gap-1.5">
                            <ToneIcon className="h-3 w-3 text-primary-500" />
                            <span className="text-[11px] font-medium text-primary-600 dark:text-primary-400">
                              {toneStyles[s.tone].label}
                            </span>
                            <Badge variant="secondary" size="sm" className="ml-auto">
                              {Math.round(s.confidence * 100)}%
                            </Badge>
                          </div>
                          <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                            {s.content}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 h-7 gap-1 px-2 text-xs opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <Send className="h-3 w-3" />
                            Send
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    <Target className="h-3 w-3" />
                    Lead Qualification
                  </div>
                  <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs text-neutral-500">Score</span>
                      <div className="flex items-center gap-1">
                        <div className="h-1.5 w-16 rounded-full bg-neutral-200 dark:bg-neutral-700">
                          <div
                            className="h-full rounded-full bg-success-500"
                            style={{ width: `${leadQualification.score}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-success-600">
                          {leadQualification.score}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500">Intent</span>
                      <Badge
                        variant={
                          leadQualification.intent === "high"
                            ? "success"
                            : leadQualification.intent === "medium"
                              ? "warning"
                              : "error"
                        }
                        size="sm"
                      >
                        {leadQualification.intent}
                      </Badge>
                    </div>
                    {leadQualification.budget && (
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="text-xs text-neutral-500">Budget</span>
                        <span className="text-xs font-medium text-neutral-900 dark:text-white">
                          {leadQualification.budget}
                        </span>
                      </div>
                    )}
                    {leadQualification.timeline && (
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="text-xs text-neutral-500">Timeline</span>
                        <span className="text-xs font-medium text-neutral-900 dark:text-white">
                          {leadQualification.timeline}
                        </span>
                      </div>
                    )}
                    <Separator className="my-2" />
                    <div>
                      <span className="text-[11px] font-medium text-neutral-500">
                        Requirements
                      </span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {leadQualification.requirements?.map((req) => (
                          <Badge key={req} variant="secondary" size="sm">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    <Zap className="h-3 w-3" />
                    Suggested Next Actions
                  </div>
                  <div className="space-y-1.5">
                    {nextActions.map((action) => {
                      const ActionIcon = actionIcons[action.icon] || FileText;
                      return (
                        <button
                          key={action.id}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        >
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                            <ActionIcon className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-400" />
                          </div>
                          <span className="flex-1">{action.label}</span>
                          <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    <BarChart3 className="h-3 w-3" />
                    Customer Context
                  </div>
                  <div className="space-y-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500">Name</span>
                      <span className="text-xs font-medium text-neutral-900 dark:text-white">
                        Sarah Chen
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500">Email</span>
                      <span className="text-xs font-medium text-neutral-900 dark:text-white">
                        sarah@techflow.io
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500">Phone</span>
                      <span className="text-xs font-medium text-neutral-900 dark:text-white">
                        +1 (555) 123-4567
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500">Company</span>
                      <span className="text-xs font-medium text-neutral-900 dark:text-white">
                        TechFlow Inc.
                      </span>
                    </div>
                    <Separator className="my-1" />
                    <div>
                      <span className="text-[11px] font-medium text-neutral-500">
                        Previous Conversations
                      </span>
                      <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400">
                        Asked about pricing on Mar 15. Attended webinar on Mar 10.
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-neutral-500">
                        Notes
                      </span>
                      <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400">
                        Decision maker, prefers email communication. Interested in enterprise features.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
