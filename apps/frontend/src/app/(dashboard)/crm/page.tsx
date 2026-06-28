"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Users,
  DollarSign,
  TrendingUp,
  Target,
  Activity as ActivityIcon,
} from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PipelineView } from "@/components/crm/pipeline-view";
import { DealForm } from "@/components/crm/deal-form";
import { ActivityTimeline } from "@/components/crm/activity-timeline";
import type { Deal, Pipeline, Activity } from "@/types";

const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "\u20AC",
  GBP: "\u00A3",
  NGN: "\u20A6",
};

function formatCurrency(value: number, currency = "USD") {
  const symbol = currencySymbols[currency] || currency;
  return `${symbol}${value.toLocaleString()}`;
}

export default function CRMPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [showDealForm, setShowDealForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | undefined>();
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [pipelinesData, dealsData] = await Promise.all([
        api.get<Pipeline[]>("/pipelines"),
        api.get<Deal[]>("/deals"),
      ]);
      setPipelines(pipelinesData);
      setDeals(dealsData);

      const defaultPipeline =
        pipelinesData.find((p) => p.isDefault) || pipelinesData[0];
      setSelectedPipeline(defaultPipeline || null);

      if (defaultPipeline) {
        const statsData = await api.get(`/deals/stats/${defaultPipeline.id}`);
        setStats(statsData);
      }
    } catch (err) {
      console.error("Failed to load CRM data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDealClick = (deal: Deal) => {
    setEditingDeal(deal);
    setShowDealForm(true);
  };

  const handleFormSubmit = () => {
    setShowDealForm(false);
    setEditingDeal(undefined);
    loadData();
  };

  const handlePipelineChange = async (pipelineId: string) => {
    const pipeline = pipelines.find((p) => p.id === pipelineId);
    setSelectedPipeline(pipeline || null);
    if (pipeline) {
      const [dealsData, statsData] = await Promise.all([
        api.get<Deal[]>(`/deals?pipelineId=${pipeline.id}`),
        api.get(`/deals/stats/${pipeline.id}`),
      ]);
      setDeals(dealsData);
      setStats(statsData);
    }
  };

  const pipelineDeals = selectedPipeline
    ? deals.filter((d) => d.pipelineId === selectedPipeline.id)
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CRM</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Manage your sales pipeline and deals
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => { setEditingDeal(undefined); setShowDealForm(true); }}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Deal
          </Button>
          <Button>
            <ActivityIcon className="mr-1.5 h-4 w-4" />
            Log Activity
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-primary-100 p-2.5 dark:bg-primary-900/30">
                <Target className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalDeals}</p>
                <p className="text-xs text-neutral-500">Total Deals</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-success-100 p-2.5 dark:bg-success-900/30">
                <DollarSign className="h-5 w-5 text-success-600 dark:text-success-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats.totalValue)}
                </p>
                <p className="text-xs text-neutral-500">Pipeline Value</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-warning-100 p-2.5 dark:bg-warning-900/30">
                <TrendingUp className="h-5 w-5 text-warning-600 dark:text-warning-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.wonThisMonth}</p>
                <p className="text-xs text-neutral-500">Won This Month</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-error-100 p-2.5 dark:bg-error-900/30">
                <Users className="h-5 w-5 text-error-600 dark:text-error-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.conversionRate}%</p>
                <p className="text-xs text-neutral-500">Conversion Rate</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {pipelines.length > 0 && (
        <div className="flex items-center gap-2">
          {pipelines.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePipelineChange(p.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedPipeline?.id === p.id
                  ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                  : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {selectedPipeline && (
        <PipelineView
          pipeline={selectedPipeline}
          deals={pipelineDeals}
          onDealsChange={loadData}
          onDealClick={handleDealClick}
        />
      )}

      {!selectedPipeline && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
          <Target className="mb-3 h-12 w-12" />
          <p className="text-lg font-medium">No pipelines yet</p>
          <p className="text-sm">Create a pipeline to start managing deals</p>
        </div>
      )}

      <Dialog
        open={showDealForm}
        onOpenChange={(open) => {
          setShowDealForm(open);
          if (!open) setEditingDeal(undefined);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDeal ? "Edit Deal" : "New Deal"}
            </DialogTitle>
          </DialogHeader>
          <DealForm
            deal={editingDeal}
            pipelines={pipelines}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowDealForm(false);
              setEditingDeal(undefined);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
