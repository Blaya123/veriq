"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  Check,
  Star,
  Inbox,
  Users,
  Calendar,
  CheckSquare,
  DollarSign,
  BookOpen,
  BarChart3,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/layout/hero";
import { Footer } from "@/components/layout/footer";
import {
  COMPANY,
  FEATURES,
  HOW_IT_WORKS,
  TESTIMONIALS,
  PRICING_PLANS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  Inbox,
  Users,
  Calendar,
  CheckSquare,
  DollarSign,
  BookOpen,
  BarChart3,
  Bot,
};

const trustedLogos = [
  "TechFlow",
  "DataBridge",
  "ScaleUp",
  "NexGen",
  "CloudBase",
  "InnoSys",
];

function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />

      <section className="border-y border-neutral-200 bg-neutral-50 py-12 dark:border-neutral-800 dark:bg-neutral-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-neutral-500">
            Trusted by innovative companies worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {trustedLogos.map((logo) => (
              <div
                key={logo}
                className="flex items-center gap-2 text-lg font-bold text-neutral-400 dark:text-neutral-600"
              >
                <div className="h-6 w-6 rounded bg-neutral-300 dark:bg-neutral-700" />
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="relative overflow-hidden py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <Badge variant="default" size="sm">
              Features
            </Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to run your business
            </h2>
            <p className="mt-4 text-lg text-neutral-500 dark:text-neutral-400">
              Eight powerful modules that work together seamlessly, powered by AI
              to automate your workflows.
            </p>
          </FadeIn>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature, i) => {
              const Icon = iconMap[feature.icon];
              return (
                <FadeIn key={feature.title} delay={i * 0.1}>
                  <Card className="group h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                        {Icon && <Icon className="h-6 w-6" />}
                      </div>
                      <h3 className="mb-2 text-lg font-semibold">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-neutral-950 py-24 sm:py-32">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" size="sm" className="border-neutral-700">
              How it works
            </Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              From setup to growth in three steps
            </h2>
            <p className="mt-4 text-lg text-neutral-400">
              Get your business running on AI in no time.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => (
              <FadeIn key={step.step} delay={i * 0.2}>
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600/20 text-2xl font-bold text-primary-400">
                    {step.step}
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-neutral-400">{step.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <Badge variant="default" size="sm">
              Testimonials
            </Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Loved by business leaders
            </h2>
            <p className="mt-4 text-lg text-neutral-500 dark:text-neutral-400">
              Hear from teams that transformed their operations with VERIQ.
            </p>
          </FadeIn>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {TESTIMONIALS.map((testimonial, i) => (
              <FadeIn key={testimonial.name} delay={i * 0.15}>
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="mb-4 flex gap-1">
                      {[...Array(5)].map((_, j) => (
                        <Star
                          key={j}
                          className="h-4 w-4 fill-warning-400 text-warning-400"
                        />
                      ))}
                    </div>
                    <p className="mb-6 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <Avatar fallback={testimonial.avatar} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                          {testimonial.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="relative overflow-hidden bg-neutral-50 py-24 dark:bg-neutral-900/50 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <Badge variant="default" size="sm">
              Pricing
            </Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-neutral-500 dark:text-neutral-400">
              Start free, upgrade when you grow. No hidden fees.
            </p>
          </FadeIn>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {PRICING_PLANS.map((plan, i) => (
              <FadeIn key={plan.name} delay={i * 0.15}>
                <Card
                  className={cn(
                    "relative flex flex-col",
                    plan.popular && "border-primary-500 shadow-lg ring-1 ring-primary-500"
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
                      <span className="text-sm text-neutral-500">/month</span>
                    </div>
                    <p className="mt-2 text-sm text-neutral-500">
                      {plan.description}
                    </p>
                    <ul className="mt-6 flex-1 space-y-3">
                      {plan.features.map((feat) => (
                        <li
                          key={feat}
                          className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400"
                        >
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-success-500" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={plan.popular ? "primary" : "outline"}
                      className="mt-8 w-full"
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-neutral-950 py-24 sm:py-32">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial" />
        <FadeIn className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to run your business with AI?
          </h2>
          <p className="mt-4 text-lg text-neutral-400">
            Join thousands of businesses using VERIQ to automate operations,
            save time, and grow faster.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button size="xl">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="xl"
              className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            >
              Talk to Sales
            </Button>
          </div>
          <p className="mt-4 text-sm text-neutral-500">
            No credit card required. Free 14-day trial.
          </p>
        </FadeIn>
      </section>

      <Footer />
    </>
  );
}
