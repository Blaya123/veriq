import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { IntegrationModule } from './integration/integration.module';
import { ContactModule } from './contact/contact.module';
import { DealModule } from './deal/deal.module';
import { PipelineModule } from './pipeline/pipeline.module';
import { ActivityModule } from './activity/activity.module';
import { ConversationModule } from './conversation/conversation.module';
import { MessageModule } from './message/message.module';
import { AiReplyModule } from './ai-reply/ai-reply.module';
import { AiChatModule } from './ai-chat/ai-chat.module';
import { AiAgentModule } from './ai-agent/ai-agent.module';
import { KnowledgeBaseModule } from './knowledge-base/knowledge-base.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { InvoiceModule } from './invoice/invoice.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
    PrismaModule,
    AuthModule,
    UserModule,
    WorkspaceModule,
    IntegrationModule,
    ContactModule,
    ConversationModule,
    MessageModule,
    AiReplyModule,
    AiChatModule,
    AiAgentModule,
    KnowledgeBaseModule,
    SubscriptionModule,
    InvoiceModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
