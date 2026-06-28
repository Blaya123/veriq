"use client";

import { motion } from "framer-motion";
import { Inbox, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex h-full flex-col items-center justify-center text-center px-6"
    >
      <div className="mb-6 rounded-3xl bg-primary-50 p-6 dark:bg-primary-900/20">
        <Inbox className="h-16 w-16 text-primary-400 dark:text-primary-500" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
        Your Unified Inbox is ready
      </h2>
      <p className="mt-2 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
        Connect your channels to start receiving messages from WhatsApp,
        Instagram, Facebook, Telegram, Email, and your Website — all in one
        place.
      </p>
      <Link href="/dashboard/integrations">
        <Button className="mt-6">
          Connect a channel
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
      <div className="mt-8 grid grid-cols-3 gap-4">
        {["WhatsApp", "Instagram", "Email"].map((channel) => (
          <div
            key={channel}
            className="flex flex-col items-center gap-2 rounded-xl border border-neutral-200 px-4 py-3 dark:border-neutral-700"
          >
            <div className="h-8 w-8 rounded-lg bg-neutral-100 dark:bg-neutral-800" />
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
              {channel}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
