export type DealStage = string;

export interface Deal {
  id: string;
  name: string;
  value: number;
  currency: string;
  stageId: string;
  pipelineId: string;
  contactId?: string;
  contact?: Contact;
  assignedToId?: string;
  assignedTo?: { id: string; name: string; email: string; avatarUrl?: string };
  expectedCloseDate?: string;
  probability: number;
  notes?: string;
  status: "OPEN" | "WON" | "LOST";
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  color?: string;
  order?: number;
}

export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  stages: PipelineStage[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  type: "NOTE" | "CALL" | "EMAIL" | "MEETING" | "TASK";
  subject: string;
  description?: string;
  contactId?: string;
  contact?: { id: string; name: string };
  dealId?: string;
  deal?: { id: string; name: string };
  createdById: string;
  createdBy: { id: string; name: string; avatarUrl?: string };
  createdAt: string;
}

export type ChannelType =
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "telegram"
  | "email"
  | "website";

export type MessageStatus = "sending" | "sent" | "delivered" | "read";

export type ContactStatus = "online" | "away" | "offline";

export type IntegrationStatus = "connected" | "disconnected" | "error" | "pending";

export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  phone?: string;
  status: ContactStatus;
  channel: ChannelType;
  notes?: string;
  tags?: string[];
}

export interface Attachment {
  id: string;
  type: "image" | "file" | "video" | "audio";
  url: string;
  name: string;
  size?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  inbound: boolean;
  status: MessageStatus;
  attachments?: Attachment[];
  timestamp: string;
  channel: ChannelType;
}

export interface Conversation {
  id: string;
  contact: Contact;
  lastMessage: {
    content: string;
    timestamp: string;
    status: MessageStatus;
  };
  unreadCount: number;
  channel: ChannelType;
  isTyping?: boolean;
  assignedTo?: string;
  labels?: string[];
}

export interface Integration {
  id: string;
  channel: ChannelType;
  name: string;
  description: string;
  icon: string;
  status: IntegrationStatus;
  connectedAt?: string;
}

export interface AiSuggestion {
  id: string;
  content: string;
  tone: "professional" | "friendly" | "concise";
  confidence: number;
}

export interface LeadQualification {
  score: number;
  intent: "high" | "medium" | "low";
  budget?: string;
  timeline?: string;
  requirements?: string[];
}

export interface NextAction {
  id: string;
  label: string;
  icon: string;
  action: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "admin" | "member" | "viewer";
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  plan: "FREE" | "PRO" | "BUSINESS" | "ENTERPRISE";
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  code: "FREE" | "PRO" | "BUSINESS" | "ENTERPRISE";
  priceMonthly: number;
  priceYearly: number;
  features: Record<string, boolean>;
  limits: {
    maxUsers: number;
    maxWorkspaces: number;
    maxAiCredits: number;
    maxStorage: number;
  };
  isActive: boolean;
}

export interface WorkspaceSubscription {
  id: string;
  status: "ACTIVE" | "PAST_DUE" | "CANCELED" | "EXPIRED" | "TRIALING";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndsAt?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  canceledAt?: string;
  plan: SubscriptionPlan;
}

export interface PaymentMethod {
  id: string;
  type: "CARD" | "BANK_TRANSFER";
  details: Record<string, string>;
  isDefault: boolean;
  createdAt: string;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  provider?: string;
  providerPaymentId?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";
  dueDate?: string;
  paidAt?: string;
  createdAt: string;
  contact?: { id: string; name: string };
  payments?: Payment[];
}
