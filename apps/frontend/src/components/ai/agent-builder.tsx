"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface AgentFormData {
  name: string;
  description: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  isActive: boolean;
}

interface AgentBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AgentFormData) => void;
  initialData?: Partial<AgentFormData>;
  mode?: "create" | "edit";
}

const defaultFormData: AgentFormData = {
  name: "",
  description: "",
  systemPrompt: "You are a helpful AI assistant.",
  model: "gpt-4",
  temperature: 0.7,
  isActive: true,
};

export function AgentBuilder({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode = "create",
}: AgentBuilderProps) {
  const [form, setForm] = useState<AgentFormData>(defaultFormData);
  const [testInput, setTestInput] = useState("");
  const [testOutput, setTestOutput] = useState("");
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({ ...defaultFormData, ...initialData });
    } else {
      setForm(defaultFormData);
    }
    setTestInput("");
    setTestOutput("");
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const handleTest = async () => {
    if (!testInput.trim()) return;
    setIsTesting(true);
    setTestOutput("");

    try {
      const apiKey = process.env.NEXT_PUBLIC_AI_API_KEY;
      const provider = process.env.NEXT_PUBLIC_AI_PROVIDER || "openai";

      if (provider === "openai") {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: form.model,
            messages: [
              { role: "system", content: form.systemPrompt },
              { role: "user", content: testInput },
            ],
            temperature: form.temperature,
            max_tokens: 500,
          }),
        });
        const data = await res.json();
        setTestOutput(
          data.choices?.[0]?.message?.content || "No response"
        );
      } else {
        setTestOutput(
          `[${form.model}] Simulated response to: ${testInput}`
        );
      }
    } catch (err) {
      setTestOutput(`Error: ${(err as Error).message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create AI Agent" : "Edit AI Agent"}
          </DialogTitle>
          <DialogDescription>
            Configure a custom AI agent with its own system prompt and model
            settings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Agent Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                placeholder="Sales AI, Support Bot..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <select
                id="model"
                value={form.model}
                onChange={(e) =>
                  setForm({ ...form, model: e.target.value })
                }
                className="flex h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50"
              >
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="claude-3-opus">Claude 3 Opus</option>
                <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                <option value="gemini-pro">Gemini Pro</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="What does this agent do?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="systemPrompt">System Prompt</Label>
            <textarea
              id="systemPrompt"
              value={form.systemPrompt}
              onChange={(e) =>
                setForm({ ...form, systemPrompt: e.target.value })
              }
              rows={5}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50"
              placeholder="You are a..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="temperature">
              Temperature: {form.temperature.toFixed(1)}
            </Label>
            <input
              id="temperature"
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={form.temperature}
              onChange={(e) =>
                setForm({ ...form, temperature: parseFloat(e.target.value) })
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-neutral-500">
              <span>Precise (0)</span>
              <span>Creative (2)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) =>
                setForm({ ...form, isActive: e.target.checked })
              }
              className="h-4 w-4 rounded border-neutral-300"
            />
            <Label htmlFor="isActive" className="text-sm font-normal">
              Active
            </Label>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Test Agent</Label>
            <div className="flex gap-2">
              <Input
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Enter a test message..."
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleTest}
                loading={isTesting}
              >
                Test
              </Button>
            </div>
            {testOutput && (
              <div className="rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                {testOutput}
              </div>
            )}
          </div>

          <Separator />

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!form.name.trim()}>
              {mode === "create" ? "Create Agent" : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
