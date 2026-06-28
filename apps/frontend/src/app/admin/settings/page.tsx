"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Key } from "lucide-react";

export default function AdminSettingsPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSetupSuperAdmin = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }
    setLoading(true);
    try {
      await api.post("/admin/setup", { email });
      toast.success("Super admin granted successfully");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to setup super admin";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Admin Settings</h1>
        <p className="text-sm text-neutral-400">
          Global platform configuration
        </p>
      </div>

      <Card className="border-neutral-800 bg-neutral-900 text-neutral-100">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-error-500/10">
              <Shield className="h-5 w-5 text-error-400" />
            </div>
            <div>
              <CardTitle className="text-white">Super Admin Setup</CardTitle>
              <CardDescription className="text-neutral-400">
                Grant super admin privileges to a user. This can only be done once.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="max-w-sm border-neutral-700 bg-neutral-800 text-neutral-100 placeholder:text-neutral-500"
            />
            <Button onClick={handleSetupSuperAdmin} loading={loading}>
              <Key className="mr-1 h-4 w-4" />
              Grant Super Admin
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator className="bg-neutral-800" />

      <Card className="border-neutral-800 bg-neutral-900 text-neutral-100">
        <CardHeader>
          <CardTitle className="text-white">Platform Information</CardTitle>
          <CardDescription className="text-neutral-400">
            General information about the VERIQ platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between rounded-lg bg-neutral-950 p-3">
            <span className="text-sm text-neutral-400">Version</span>
            <span className="text-sm text-neutral-200">0.1.0</span>
          </div>
          <div className="flex justify-between rounded-lg bg-neutral-950 p-3">
            <span className="text-sm text-neutral-400">Environment</span>
            <span className="text-sm text-neutral-200">
              {process.env.NODE_ENV || "development"}
            </span>
          </div>
          <div className="flex justify-between rounded-lg bg-neutral-950 p-3">
            <span className="text-sm text-neutral-400">API Prefix</span>
            <span className="text-sm text-neutral-200">/api</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
