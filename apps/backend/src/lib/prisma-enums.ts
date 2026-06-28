export const UserRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  VIEWER: 'VIEWER',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const IntegrationType = {
  EMAIL: 'EMAIL',
  WHATSAPP: 'WHATSAPP',
  TELEGRAM: 'TELEGRAM',
  INSTAGRAM: 'INSTAGRAM',
  FACEBOOK: 'FACEBOOK',
  SLACK: 'SLACK',
  API: 'API',
  WEBHOOK: 'WEBHOOK',
} as const;
export type IntegrationType = (typeof IntegrationType)[keyof typeof IntegrationType];

export const ContactSource = {
  MANUAL: 'MANUAL',
  IMPORT: 'IMPORT',
  API: 'API',
  WEBFORM: 'WEBFORM',
  CHAT: 'CHAT',
  EMAIL: 'EMAIL',
  OTHER: 'OTHER',
} as const;
export type ContactSource = (typeof ContactSource)[keyof typeof ContactSource];

export const ConversationStatus = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  PENDING: 'PENDING',
  WAITING: 'WAITING',
} as const;
export type ConversationStatus = (typeof ConversationStatus)[keyof typeof ConversationStatus];

export const MessageContentType = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
  FILE: 'FILE',
  AUDIO: 'AUDIO',
  VIDEO: 'VIDEO',
} as const;
export type MessageContentType = (typeof MessageContentType)[keyof typeof MessageContentType];

export const MessageDirection = {
  INBOUND: 'INBOUND',
  OUTBOUND: 'OUTBOUND',
} as const;
export type MessageDirection = (typeof MessageDirection)[keyof typeof MessageDirection];

export const InvoiceStatus = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;
export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

export const PaymentStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  CANCELLED: 'CANCELLED',
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const SubscriptionStatus = {
  ACTIVE: 'ACTIVE',
  TRIALING: 'TRIALING',
  CANCELED: 'CANCELED',
  EXPIRED: 'EXPIRED',
  PAUSED: 'PAUSED',
} as const;
export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export const DealStatus = {
  OPEN: 'OPEN',
  WON: 'WON',
  LOST: 'LOST',
  ABANDONED: 'ABANDONED',
} as const;
export type DealStatus = (typeof DealStatus)[keyof typeof DealStatus];

export const ActivityType = {
  NOTE: 'NOTE',
  CALL: 'CALL',
  EMAIL: 'EMAIL',
  MEETING: 'MEETING',
  TASK: 'TASK',
} as const;
export type ActivityType = (typeof ActivityType)[keyof typeof ActivityType];

export const AiChatRole = {
  USER: 'USER',
  ASSISTANT: 'ASSISTANT',
} as const;
export type AiChatRole = (typeof AiChatRole)[keyof typeof AiChatRole];

export const AiAgentExecutionStatus = {
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;
export type AiAgentExecutionStatus = (typeof AiAgentExecutionStatus)[keyof typeof AiAgentExecutionStatus];
