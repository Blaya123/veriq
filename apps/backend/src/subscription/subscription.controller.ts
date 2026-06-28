import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
} from './dto/create-subscription.dto';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  @Get('plans')
  getPlans() {
    return this.subscriptionService.getPlans();
  }

  @Get(':workspaceId/current')
  getCurrentPlan(@Param('workspaceId') workspaceId: string) {
    return this.subscriptionService.getCurrentPlan(workspaceId);
  }

  @Post(':workspaceId')
  create(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateSubscriptionDto,
  ) {
    return this.subscriptionService.createSubscription(workspaceId, dto);
  }

  @Patch(':workspaceId')
  upgradeDowngrade(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionService.upgradeDowngrade(workspaceId, dto);
  }

  @Delete(':workspaceId')
  cancel(@Param('workspaceId') workspaceId: string) {
    return this.subscriptionService.cancelSubscription(workspaceId);
  }

  @Get(':workspaceId/limits/:resource')
  checkLimit(
    @Param('workspaceId') workspaceId: string,
    @Param('resource') resource: string,
  ) {
    return this.subscriptionService.checkLimit(
      workspaceId,
      resource as any,
    );
  }

  @Get(':workspaceId/usage')
  getUsageStats(@Param('workspaceId') workspaceId: string) {
    return this.subscriptionService.getUsageStats(workspaceId);
  }
}
