import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Building2, Mail, Calendar, Shield, MessageSquare, CheckSquare, DollarSign, Bot } from "lucide-react";

interface WorkspaceMembership {
  workspace: {
    id: string;
    name: string;
    slug: string;
    plan: string;
  };
}

interface UserDetailData {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  isSuperAdmin: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  workspaceMemberships: WorkspaceMembership[];
  _count: {
    conversations: number;
    assignedTasks: number;
    assignedDeals: number;
    aiChats: number;
  };
}

interface UserDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserDetailData | null;
  loading?: boolean;
}

export function UserDetail({ open, onOpenChange, user, loading }: UserDetailProps) {
  if (!user && !loading) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-neutral-800 bg-neutral-900 text-neutral-100">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription className="text-neutral-400">
            Detailed view of user account and activity
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 w-full animate-pulse rounded bg-neutral-800" />
            ))}
          </div>
        ) : user ? (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Avatar
                fallback={user.name.slice(0, 2).toUpperCase()}
                size="xl"
                className="bg-neutral-800"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                    <p className="flex items-center gap-1 text-sm text-neutral-400">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {user.isSuperAdmin && (
                      <Badge variant="error" size="sm">
                        Super Admin
                      </Badge>
                    )}
                    <Badge
                      variant={user.isActive ? "success" : "error"}
                      size="sm"
                    >
                      {user.isActive ? "Active" : "Suspended"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-neutral-800" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">Role</p>
                <p className="mt-1 text-sm text-neutral-200">{user.role}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">Member Since</p>
                <p className="mt-1 flex items-center gap-1 text-sm text-neutral-200">
                  <Calendar className="h-3 w-3" />
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <Separator className="bg-neutral-800" />

            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
                Workspaces ({user.workspaceMemberships.length})
              </p>
              <div className="space-y-2">
                {user.workspaceMemberships.map((wm) => (
                  <div
                    key={wm.workspace.id}
                    className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-950 p-3"
                  >
                    <Building2 className="h-4 w-4 text-neutral-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-200">
                        {wm.workspace.name}
                      </p>
                      <p className="text-xs text-neutral-500">{wm.workspace.plan}</p>
                    </div>
                  </div>
                ))}
                {user.workspaceMemberships.length === 0 && (
                  <p className="text-sm text-neutral-500">No workspaces</p>
                )}
              </div>
            </div>

            <Separator className="bg-neutral-800" />

            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
                Activity Overview
              </p>
              <div className="grid grid-cols-4 gap-3">
                <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-center">
                  <MessageSquare className="mx-auto h-4 w-4 text-neutral-400" />
                  <p className="mt-1 text-lg font-bold text-white">{user._count.conversations}</p>
                  <p className="text-xs text-neutral-500">Conversations</p>
                </div>
                <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-center">
                  <CheckSquare className="mx-auto h-4 w-4 text-neutral-400" />
                  <p className="mt-1 text-lg font-bold text-white">{user._count.assignedTasks}</p>
                  <p className="text-xs text-neutral-500">Tasks</p>
                </div>
                <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-center">
                  <DollarSign className="mx-auto h-4 w-4 text-neutral-400" />
                  <p className="mt-1 text-lg font-bold text-white">{user._count.assignedDeals}</p>
                  <p className="text-xs text-neutral-500">Deals</p>
                </div>
                <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-center">
                  <Bot className="mx-auto h-4 w-4 text-neutral-400" />
                  <p className="mt-1 text-lg font-bold text-white">{user._count.aiChats}</p>
                  <p className="text-xs text-neutral-500">AI Chats</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
