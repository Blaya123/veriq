"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Deal, Pipeline } from "@/types";

const dealSchema = z.object({
  name: z.string().min(1, "Name is required"),
  value: z.coerce.number().min(0),
  currency: z.string().default("USD"),
  pipelineId: z.string().min(1),
  stageId: z.string().min(1),
  contactId: z.string().optional(),
  assignedToId: z.string().optional(),
  expectedCloseDate: z.string().optional(),
  probability: z.coerce.number().min(0).max(100).default(0),
  notes: z.string().optional(),
});

type DealFormData = z.infer<typeof dealSchema>;

interface DealFormProps {
  deal?: Deal;
  pipelines: Pipeline[];
  onSubmit: () => void;
  onCancel: () => void;
}

export function DealForm({ deal, pipelines, onSubmit, onCancel }: DealFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const defaultPipeline = pipelines.find((p) => p.isDefault) || pipelines[0];
  const defaultStage = defaultPipeline?.stages?.[0];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      name: deal?.name || "",
      value: deal?.value || 0,
      currency: deal?.currency || "USD",
      pipelineId: deal?.pipelineId || defaultPipeline?.id || "",
      stageId: deal?.stageId || defaultStage?.id || "",
      contactId: deal?.contactId || "",
      assignedToId: deal?.assignedToId || "",
      expectedCloseDate: deal?.expectedCloseDate
        ? new Date(deal.expectedCloseDate).toISOString().split("T")[0]
        : "",
      probability: deal?.probability || 0,
      notes: deal?.notes || "",
    },
  });

  const selectedPipelineId = watch("pipelineId");
  const selectedPipeline = pipelines.find((p) => p.id === selectedPipelineId);

  useEffect(() => {
    if (!deal && selectedPipeline?.stages?.length) {
      setValue("stageId", selectedPipeline.stages[0].id);
    }
  }, [selectedPipelineId, deal, selectedPipeline, setValue]);

  const doSubmit = async (data: DealFormData) => {
    setSubmitting(true);
    try {
      if (deal) {
        await api.patch(`/deals/${deal.id}`, data);
      } else {
        await api.post("/deals", data);
      }
      onSubmit();
    } catch (err) {
      console.error("Failed to save deal", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(doSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Deal Name</Label>
        <Input id="name" {...register("name")} error={!!errors.name} placeholder="Enter deal name" />
        {errors.name && <p className="text-xs text-error-500">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="value">Value</Label>
          <Input id="value" type="number" {...register("value")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <select
            id="currency"
            {...register("currency")}
            className="flex h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (&euro;)</option>
            <option value="GBP">GBP (&pound;)</option>
            <option value="NGN">NGN (&#8358;)</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pipelineId">Pipeline</Label>
        <select
          id="pipelineId"
          {...register("pipelineId")}
          className="flex h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50"
        >
          {pipelines.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="stageId">Stage</Label>
        <select
          id="stageId"
          {...register("stageId")}
          className="flex h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50"
        >
          {(selectedPipeline?.stages || []).map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="probability">Probability (%)</Label>
          <Input id="probability" type="number" min={0} max={100} {...register("probability")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expectedCloseDate">Expected Close</Label>
          <Input id="expectedCloseDate" type="date" {...register("expectedCloseDate")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          {...register("notes")}
          rows={3}
          className="flex w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {deal ? "Update" : "Create"} Deal
        </Button>
      </div>
    </form>
  );
}
