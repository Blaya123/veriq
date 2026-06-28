"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Plan {
  name: string;
  code: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
}

interface PlanCardProps {
  plan: Plan;
  isCurrentPlan?: boolean;
  onSelect?: (code: string) => void;
}

export function PlanCard({ plan, isCurrentPlan, onSelect }: PlanCardProps) {
  return (
    <Card
      className={cn(
        "relative flex flex-col transition-all duration-200 hover:shadow-lg",
        plan.popular &&
          "border-primary-500 shadow-md ring-1 ring-primary-500"
      )}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="default" size="sm">
            Most Popular
          </Badge>
        </div>
      )}

      <CardContent className="flex flex-1 flex-col p-6">
        <h3 className="text-lg font-semibold">{plan.name}</h3>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-4xl font-bold">{plan.price}</span>
          {plan.price !== "Custom" && (
            <span className="text-sm text-neutral-500">/month</span>
          )}
        </div>
        <p className="mt-2 text-sm text-neutral-500">{plan.description}</p>

        <ul className="mt-6 flex-1 space-y-3">
          {plan.features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400"
            >
              <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-success-500" />
              {feature}
            </li>
          ))}
        </ul>

        <Button
          variant={plan.popular ? "primary" : "outline"}
          className="mt-8 w-full"
          disabled={isCurrentPlan}
          onClick={() => onSelect?.(plan.code)}
        >
          {isCurrentPlan ? "Current Plan" : plan.price === "Custom" ? "Contact Sales" : "Upgrade"}
        </Button>
      </CardContent>
    </Card>
  );
}
