"use client";

import { useState } from "react";
import { Settings, CreditCard, Users, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const tabs = [
  { id: "general", label: "General", icon: Settings },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "members", label: "Members", icon: Users },
  { id: "notifications", label: "Notifications", icon: Bell },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Manage your workspace settings and preferences.
        </p>
      </div>

      <div className="flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-50"
                  : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "general" && <GeneralSettings />}
      {activeTab === "billing" && <BillingSettings />}
      {activeTab === "members" && <MemberSettings />}
      {activeTab === "notifications" && <NotificationSettings />}
    </div>
  );
}

function GeneralSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Workspace Name</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input defaultValue="Acme Corp" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <Input defaultValue="acme-corp" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Logo URL</label>
            <Input placeholder="https://example.com/logo.png" />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline">Cancel</Button>
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BillingSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Plan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
          <div>
            <p className="font-medium">Free Plan</p>
            <p className="text-sm text-neutral-500">Basic features for small teams</p>
          </div>
          <Button onClick={() => (window.location.href = "/settings/billing")}>
            Upgrade
          </Button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">Seats used</span>
            <span className="font-medium">1 / 1</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
            <div className="h-full w-full rounded-full bg-primary-500" />
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-500">Next billing date</span>
          <span className="text-sm font-medium">N/A (Free plan)</span>
        </div>
      </CardContent>
    </Card>
  );
}

function MemberSettings() {
  const members = [
    { name: "John Doe", email: "john@acme.com", role: "Owner" },
    { name: "Jane Smith", email: "jane@acme.com", role: "Admin" },
    { name: "Bob Wilson", email: "bob@acme.com", role: "Member" },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Team Members</CardTitle>
        <Button size="sm">Invite Member</Button>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
          {members.map((member) => (
            <div
              key={member.email}
              className="flex items-center justify-between py-3"
            >
              <div>
                <p className="text-sm font-medium">{member.name}</p>
                <p className="text-xs text-neutral-500">{member.email}</p>
              </div>
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                {member.role}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {[
          { label: "New messages", description: "When you receive a new message" },
          { label: "Mentions", description: "When someone mentions you" },
          { label: "Task assignments", description: "When a task is assigned to you" },
          { label: "Weekly summary", description: "Weekly activity summary" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-lg border border-neutral-200 p-4 dark:border-neutral-700"
          >
            <div>
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-neutral-500">{item.description}</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" className="peer sr-only" defaultChecked />
              <div className="h-6 w-11 rounded-full bg-neutral-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-focus:outline-none dark:bg-neutral-600" />
            </label>
          </div>
        ))}
        <div className="flex justify-end">
          <Button>Save Preferences</Button>
        </div>
      </CardContent>
    </Card>
  );
}
