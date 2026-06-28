export const COMPANY = {
  name: "VERIQ",
  tagline: "Run your business with AI.",
  description:
    "The AI-powered business operating system that unifies your entire workflow — inbox, CRM, calendar, tasks, finance, and more.",
};

export const NAV_ITEMS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
  { label: "Blog", href: "#blog" },
];

export const FEATURES = [
  {
    title: "Unified Inbox",
    description: "All your communications in one place, sorted and prioritized by AI.",
    icon: "Inbox",
  },
  {
    title: "AI CRM",
    description: "Smart customer relationship management with predictive insights and automation.",
    icon: "Users",
  },
  {
    title: "Smart Calendar",
    description: "AI-powered scheduling that finds the perfect time across your team.",
    icon: "Calendar",
  },
  {
    title: "Tasks",
    description: "Intelligent task management with auto-prioritization and assignment.",
    icon: "CheckSquare",
  },
  {
    title: "Finance",
    description: "Financial tracking, invoicing, and forecasting with AI analytics.",
    icon: "DollarSign",
  },
  {
    title: "Knowledge Base",
    description: "Centralized company knowledge, automatically indexed and instantly searchable.",
    icon: "BookOpen",
  },
  {
    title: "Analytics",
    description: "Real-time business intelligence dashboards and custom reports.",
    icon: "BarChart3",
  },
  {
    title: "AI Agents",
    description: "Autonomous agents that execute tasks, answer questions, and automate workflows.",
    icon: "Bot",
  },
];

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Connect",
    description: "Connect your existing tools — email, calendar, Slack, CRM, and more — in minutes.",
  },
  {
    step: "02",
    title: "Automate",
    description: "AI learns your workflows and automates repetitive tasks across your entire stack.",
  },
  {
    step: "03",
    title: "Grow",
    description: "Focus on what matters while VERIQ handles operations and provides actionable insights.",
  },
];

export const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "CEO, TechFlow Inc.",
    content:
      "VERIQ transformed how we operate. Our team saved 20+ hours per week on administrative tasks alone.",
    avatar: "SC",
  },
  {
    name: "Marcus Johnson",
    role: "Founder, ScaleUp Labs",
    content:
      "The AI agents handle our customer support and scheduling. It's like hiring a full operations team overnight.",
    avatar: "MJ",
  },
  {
    name: "Elena Rodriguez",
    role: "CTO, DataBridge",
    content:
      "We tried every business OS out there. VERIQ is the first that truly understands how modern teams work.",
    avatar: "ER",
  },
];

export const PRICING_PLANS = [
  {
    name: "Starter",
    price: "$29",
    description: "For small teams getting started with AI-powered operations.",
    features: ["Up to 5 team members", "Unified inbox", "Basic AI automation", "5GB storage"],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Business",
    price: "$79",
    description: "For growing businesses that need advanced automation and insights.",
    features: [
      "Up to 25 team members",
      "Everything in Starter",
      "Advanced AI agents",
      "CRM & analytics",
      "50GB storage",
      "Priority support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$199",
    description: "For organizations requiring full control and customization.",
    features: [
      "Unlimited team members",
      "Everything in Business",
      "Custom AI agents",
      "Dedicated infrastructure",
      "Unlimited storage",
      "24/7 dedicated support",
      "SSO & advanced security",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export const DASHBOARD_SIDEBAR = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
      { label: "Inbox", href: "/dashboard/inbox", icon: "Inbox" },
      { label: "AI Chat", href: "/dashboard/ai-chat", icon: "MessageSquare" },
      { label: "Calendar", href: "/dashboard/calendar", icon: "Calendar" },
      { label: "Tasks", href: "/dashboard/tasks", icon: "CheckSquare" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { label: "CRM", href: "/dashboard/crm", icon: "Users" },
      { label: "Finance", href: "/dashboard/finance", icon: "DollarSign" },
      { label: "Knowledge Base", href: "/dashboard/knowledge", icon: "BookOpen" },
      { label: "Analytics", href: "/dashboard/analytics", icon: "BarChart3" },
      { label: "AI Agents", href: "/dashboard/agents", icon: "Bot" },
    ],
  },
];
