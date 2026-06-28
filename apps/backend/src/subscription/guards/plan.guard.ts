import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionService } from '../subscription.service';

export const PLAN_FEATURE_KEY = 'plan_feature';
export const RequirePlanFeature = (feature: string) =>
  SetMetadata(PLAN_FEATURE_KEY, feature);

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private subscriptionService: SubscriptionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.getAllAndOverride<string>(
      PLAN_FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredFeature) return true;

    const request = context.switchToHttp().getRequest();
    const workspaceId =
      request.params?.workspaceId ||
      request.params?.id ||
      request.body?.workspaceId;

    if (!workspaceId) {
      throw new ForbiddenException('Workspace ID required');
    }

    const hasAccess = await this.subscriptionService.checkFeatureAccess(
      workspaceId,
      requiredFeature,
    );
    if (!hasAccess) {
      throw new ForbiddenException(
        `Your plan does not include: ${requiredFeature}. Please upgrade.`,
      );
    }
    return true;
  }
}
