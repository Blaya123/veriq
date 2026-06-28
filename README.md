# VERIQ

**Run your business with AI.**

VERIQ is an AI Business Operating System designed to replace dozens of business tools with one intelligent platform.

## Mission

Become the operating system every business uses every day.

## Vision

Replace dozens of business tools with one AI platform.

## Core Modules

- **Unified Inbox** — Every customer message, one place, AI-powered responses.
- **AI CRM** — Contacts, deals, and history intelligently managed.
- **Smart Calendar** — Scheduling, reminders, and availability synced across teams.
- **Task & Project Management** — AI-assisted planning, tracking, and delivery.
- **Finance & Invoicing** — Billing, expenses, and reconciliations automated.
- **Knowledge Base** — Company wiki, SOPs, and AI-trained on your data.
- **Analytics & Reports** — Real-time dashboards and AI-driven insights.
- **Team & Permissions** — Role-based access, collaboration, and audit logs.
- **Integrations** — Connect email, Slack, WhatsApp, Shopify, Stripe, and more.
- **AI Agents** — Custom autonomous workers for any business process.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js, React, TypeScript |
| Styling | TailwindCSS, ShadCN |
| Animation | Framer Motion |
| Backend | NestJS, Node.js |
| Database | PostgreSQL, Redis |
| ORM | Prisma |
| AI | OpenAI, Claude, Gemini |
| Containerization | Docker |
| Cloud | AWS |

## Development Process

| Step | Phase |
|---|---|
| 1 | Research |
| 2 | Ideation |
| 3 | Validation |
| 4 | Blueprint |
| 5 | Design System |
| 6 | UI/UX Design |
| 7 | Prototype |
| 8 | Architecture |
| 9 | Database Design |
| 10 | API Design |
| 11 | Backend Development |
| 12 | Frontend Development |
| 13 | AI Integration |
| 14 | Testing |
| 15 | Security Audit |
| 16 | Staging |
| 17 | Production Launch |
| 18 | Monitoring |
| 19 | Iteration |
| 20 | Scale |

## Directory Structure

```
VERIQ/
├── 00 COMPANY/          # Vision, mission, values, brand
├── 01 PRODUCT/          # PRD, roadmap, features, user stories
├── 02 DESIGN/           # Design system, mockups, assets
├── 03 FRONTEND/         # Next.js application
├── 04 BACKEND/          # NestJS API server
├── 05 AI/               # AI models, prompts, agents
├── 06 DATABASE/         # Prisma schema, migrations, seeds
├── 07 APIs/             # API specifications, integrations
├── 08 INFRASTRUCTURE/   # Docker, AWS, CI/CD configurations
├── 09 SECURITY/         # Security policies, audits
├── 10 WEBSITE/          # Marketing website
├── 11 MOBILE/           # React Native mobile app
├── 12 DESKTOP/          # Electron desktop app
├── 13 MARKETING/        # Marketing collateral
├── 14 SALES/            # Sales playbook, pricing
├── 15 FINANCE/          # Financial models, budgets
├── 16 LEGAL/            # Terms, privacy, incorporation
├── 17 TESTING/          # Test plans, QA reports
├── 18 DEPLOYMENT/       # Deployment runbooks
├── 19 SCALING/          # Scaling strategy
├── 20 ENTERPRISE/       # Enterprise features, compliance
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Docker (optional)

### Installation

```bash
git clone https://github.com/veriq/veriq.git
cd veriq
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

The application starts at `http://localhost:3000` with the API at `http://localhost:4000`.
