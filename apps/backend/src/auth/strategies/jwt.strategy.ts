import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'veriq-secret-key',
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        workspaceMemberships: {
          take: 1,
          include: { workspace: true },
        },
      },
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }
    const { password, workspaceMemberships, ...result } = user;
    const membership = workspaceMemberships?.[0];
    return {
      ...result,
      workspaceId: membership?.workspaceId,
      workspace: membership?.workspace,
    };
  }
}
