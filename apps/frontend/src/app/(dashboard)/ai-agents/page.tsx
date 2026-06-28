"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { AgentCard } from "@/components/ai/agent-card";
import { AgentBuilder } from "@/components/ai/agent-builder";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Bot, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Execution {
  id: string;
  input: string;
  output?: string | null;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  startedAt: string;
  completedAt?: string | null;
}

interface Agent {
  id: string;
  name: string;
  description?: string | null;
  model: string;
  temperature: number;
  systemPrompt: string;
  isActive: boolean;
  createdAt: string;
  executions?: Execution[];
  _count?: { executions: number };
}

export default function AiAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [executeInput, setExecuteInput] = useState("");
  const [executeOutput, setExecuteOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const data = await api.get<Agent[]>("/ai-agents");
      setAgents(data);
    } catch {
      // handle error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (formData: {
    name: string;
    description: string;
    systemPrompt: string;
    model: string;
    temperature: number;
    isActive: boolean;
  }) => {
    try {
      const agent = await api.post<Agent>("/ai-agents", formData);
      setAgents((prev) => [agent, ...prev]);
      setBuilderOpen(false);
    } catch {
      // handle error
    }
  };

  const handleUpdate = async (formData: {
    name: string;
    description: string;
    systemPrompt: string;
    model: string;
    temperature: number;
    isActive: boolean;
  }) => {
    if (!editingAgent) return;
    try {
      const updated = await api.patch<Agent>(
        `/ai-agents/${editingAgent.id}`,
        formData
      );
      setAgents((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a))
      );
      setEditingAgent(null);
      setBuilderOpen(false);
    } catch {
      // handle error
    }
  };

  const handleExecute = async (agentId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    if (agent) {
      setSelectedAgent(agent);
      setExecuteInput("");
      setExecuteOutput("");
    }
  };

  const runExecution = async () => {
    if (!selectedAgent || !executeInput.trim()) return;
    setIsExecuting(true);
    setExecuteOutput("Running...");

    try {
      const execution = await api.post<Execution>(
        `/ai-agents/${selectedAgent.id}/execute`,
        { input: executeInput }
      );
      setExecuteOutput(execution.output || "No output");
      loadAgents();
    } catch {
      setExecuteOutput("Execution failed");
    } finally {
      setIsExecuting(false);
    }
  };

  const filteredAgents = agents.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "success" as const;
      case "FAILED":
        return "error" as const;
      case "RUNNING":
        return "warning" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Agents</h1>
          <p className="text-sm text-neutral-500">
            Create and manage AI agents for your workspace.
          </p>
        </div>
        <Button onClick={() => setBuilderOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          New Agent
        </Button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <Input
          placeholder="Search agents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
          <Bot className="h-16 w-16 mb-4" />
          <h3 className="text-lg font-semibold text-neutral-600 dark:text-neutral-300">
            No agents yet
          </h3>
          <p className="text-sm mt-1 mb-4">
            Create your first AI agent to automate tasks.
          </p>
          <Button onClick={() => setBuilderOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Create Agent
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              id={agent.id}
              name={agent.name}
              description={agent.description}
              model={agent.model}
              isActive={agent.isActive}
              executionCount={agent._count?.executions || 0}
              lastRun={
                agent.executions && agent.executions.length > 0
                  ? agent.executions[0]
                  : null
              }
              onExecute={handleExecute}
              onEdit={(id) => {
                const agent = agents.find((a) => a.id === id);
                if (agent) {
                  setEditingAgent(agent);
                  setBuilderOpen(true);
                }
              }}
            />
          ))}
        </div>
      )}

      <AgentBuilder
        open={builderOpen}
        onOpenChange={(open) => {
          setBuilderOpen(open);
          if (!open) {
            setEditingAgent(null);
          }
        }}
        onSubmit={editingAgent ? handleUpdate : handleCreate}
        initialData={
          editingAgent
            ? {
                name: editingAgent.name,
                description: editingAgent.description || "",
                systemPrompt: editingAgent.systemPrompt,
                model: editingAgent.model,
                temperature: editingAgent.temperature,
                isActive: editingAgent.isActive,
              }
            : undefined
        }
        mode={editingAgent ? "edit" : "create"}
      />

      {selectedAgent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setSelectedAgent(null)}
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative z-50 w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">
              {selectedAgent.name}
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase mb-1">
                  System Prompt
                </p>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                  {selectedAgent.systemPrompt}
                </p>
              </div>

              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-neutral-500">Model:</span>{" "}
                  {selectedAgent.model}
                </div>
                <div>
                  <span className="text-neutral-500">Temperature:</span>{" "}
                  {selectedAgent.temperature}
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium mb-2">Test Agent</p>
                <div className="flex gap-2">
                  <Input
                    value={executeInput}
                    onChange={(e) => setExecuteInput(e.target.value)}
                    placeholder="Enter input..."
                  />
                  <Button
                    variant="outline"
                    onClick={runExecution}
                    loading={isExecuting}
                  >
                    Run
                  </Button>
                </div>
                {executeOutput && (
                  <div className="mt-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 p-3 text-sm">
                    {executeOutput}
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium mb-2">Execution History</p>
                {selectedAgent.executions &&
                selectedAgent.executions.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedAgent.executions.map((exec) => (
                      <div
                        key={exec.id}
                        className="flex items-center justify-between rounded-lg bg-neutral-50 dark:bg-neutral-800 p-2.5 text-xs"
                      >
                        <span className="truncate flex-1 mr-2">
                          {exec.input}
                        </span>
                        <Badge
                          variant={statusBadgeVariant(exec.status)}
                          size="sm"
                        >
                          {exec.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400">
                    No executions yet
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                variant="outline"
                onClick={() => setSelectedAgent(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
