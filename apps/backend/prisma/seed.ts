import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const plans = [
    {
      name: 'Free',
      code: 'FREE',
      priceMonthly: 0,
      priceYearly: 0,
      isActive: true,
      features: JSON.stringify({ basic_inbox: true, basic_crm: true, email_integration: true }),
      limits: JSON.stringify({ maxUsers: 1, maxWorkspaces: 1, maxAiCredits: 50, maxStorage: 0.5 }),
    },
    {
      name: 'Pro',
      code: 'PRO',
      priceMonthly: 29,
      priceYearly: 290,
      isActive: true,
      features: JSON.stringify({ basic_inbox: true, basic_crm: true, email_integration: true, ai_reply: true, ai_chat: true, advanced_analytics: true, api_access: true, priority_support: true }),
      limits: JSON.stringify({ maxUsers: 5, maxWorkspaces: 1, maxAiCredits: 1000, maxStorage: 10 }),
    },
    {
      name: 'Business',
      code: 'BUSINESS',
      priceMonthly: 99,
      priceYearly: 990,
      isActive: true,
      features: JSON.stringify({ basic_inbox: true, basic_crm: true, email_integration: true, ai_reply: true, ai_chat: true, advanced_analytics: true, api_access: true, priority_support: true, advanced_ai_agents: true, custom_workflows: true, knowledge_base: true, audit_logs: true, team_collaboration: true }),
      limits: JSON.stringify({ maxUsers: 50, maxWorkspaces: 3, maxAiCredits: 10000, maxStorage: 100 }),
    },
    {
      name: 'Enterprise',
      code: 'ENTERPRISE',
      priceMonthly: 0,
      priceYearly: 0,
      isActive: true,
      features: JSON.stringify({ all: true }),
      limits: JSON.stringify({ maxUsers: 9999, maxWorkspaces: 99, maxAiCredits: 999999, maxStorage: 9999 }),
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { code: plan.code },
      update: plan,
      create: plan,
    });
    console.log(`Plan ${plan.code} seeded`);
  }

  console.log('Seeding complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
