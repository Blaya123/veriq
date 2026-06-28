"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { PipelineColumn } from "./pipeline-column";
import type { Deal, Pipeline, PipelineStage } from "@/types";

interface PipelineViewProps {
  pipeline: Pipeline;
  deals: Deal[];
  onDealsChange: () => void;
  onDealClick: (deal: Deal) => void;
}

export function PipelineView({
  pipeline,
  deals,
  onDealsChange,
  onDealClick,
}: PipelineViewProps) {
  const [moving, setMoving] = useState(false);

  const handleDrop = useCallback(
    async (e: React.DragEvent, stageId: string) => {
      e.preventDefault();
      const dealId = e.dataTransfer.getData("dealId");
      if (!dealId || moving) return;

      setMoving(true);
      try {
        await api.patch(`/deals/${dealId}/move`, { stageId });
        onDealsChange();
      } catch (err) {
        console.error("Failed to move deal", err);
      } finally {
        setMoving(false);
      }
    },
    [moving, onDealsChange]
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent, deal: Deal) => {
      e.dataTransfer.setData("dealId", deal.id);
    },
    []
  );

  const sortedStages = (pipeline.stages || []).sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {sortedStages.map((stage) => (
        <PipelineColumn
          key={stage.id}
          stage={stage}
          deals={deals.filter((d) => d.stageId === stage.id)}
          onDrop={handleDrop}
          onDealClick={onDealClick}
        />
      ))}
    </div>
  );
}
