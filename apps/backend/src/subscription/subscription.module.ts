import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { PlanGuard } from './guards/plan.guard';

@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService, PlanGuard],
  exports: [SubscriptionService, PlanGuard],
})
export class SubscriptionModule {}
