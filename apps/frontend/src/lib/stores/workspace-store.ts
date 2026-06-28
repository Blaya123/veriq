import { create } from "zustand";
import { api } from "@/lib/api";
import type { Workspace, Integration, User } from "@/types";

interface WorkspaceState {
  currentWorkspace: Workspace | null;
  members: User[];
  integrations: Integration[];
  isLoading: boolean;
  error: string | null;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  fetchMembers: () => Promise<void>;
  fetchIntegrations: () => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  currentWorkspace: null,
  members: [],
  integrations: [],
  isLoading: false,
  error: null,

  switchWorkspace: async (workspaceId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.get<Workspace>(
        `/workspaces/${workspaceId}`
      );
      set({ currentWorkspace: data, isLoading: false });
      get().fetchMembers();
      get().fetchIntegrations();
    } catch (err) {
      set({
        error:
          err instanceof Error ? err.message : "Failed to switch workspace",
        isLoading: false,
      });
    }
  },

  fetchMembers: async () => {
    const { currentWorkspace } = get();
    if (!currentWorkspace) return;

    try {
      const data = await api.get<User[]>(
        `/workspaces/${currentWorkspace.id}/members`
      );
      set({ members: data });
    } catch {
      set({ error: "Failed to fetch members" });
    }
  },

  fetchIntegrations: async () => {
    const { currentWorkspace } = get();
    if (!currentWorkspace) return;

    try {
      const data = await api.get<Integration[]>(
        `/workspaces/${currentWorkspace.id}/integrations`
      );
      set({ integrations: data });
    } catch {
      set({ error: "Failed to fetch integrations" });
    }
  },
}));
