import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: { email: dto.email, name: dto.name, password: hashed },
    });

    // Auto-create a workspace for the user
    const slug = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + user.id.slice(-6);
    const workspace = await this.prisma.workspace.create({
      data: { name: `${dto.name}'s Workspace`, slug },
    });
    await this.prisma.workspaceMember.create({
      data: { userId: user.id, workspaceId: workspace.id, role: 'OWNER' },
    });
    // Auto-create Free subscription
    const freePlan = await this.prisma.subscriptionPlan.findUnique({ where: { code: 'FREE' } });
    if (freePlan) {
      await this.prisma.workspaceSubscription.create({
        data: {
          workspaceId: workspace.id,
          planId: freePlan.id,
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      });
    }

    const tokens = await this.generateTokens(user.id, user.email);
    const { password, ...safeUser } = user;
    return { user: safeUser, ...tokens, workspaceId: workspace.id };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(user.id, user.email);
    const { password, ...safeUser } = user;
    return { user: safeUser, ...tokens };
  }

  async logout(refreshToken: string) {
    await this.prisma.session.deleteMany({
      where: { token: refreshToken },
    });
    return { message: 'Logged out successfully' };
  }

  async refreshToken(refreshToken: string) {
    const session = await this.prisma.session.findUnique({
      where: { token: refreshToken },
    });
    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: session.userId },
    });
    if (!user || !user.isActive) throw new UnauthorizedException();

    const accessToken = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: '15m' },
    );
    return { accessToken };
  }

  async verifyEmail(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      await this.prisma.user.update({
        where: { id: payload.sub },
        data: { isActive: true },
      });
      return { message: 'Email verified successfully' };
    } catch {
      throw new BadRequestException('Invalid or expired token');
    }
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { message: 'If the email exists, a reset link has been sent' };

    const token = this.jwtService.sign(
      { sub: user.id, type: 'password-reset' },
      { expiresIn: '1h' },
    );
    return { message: 'Reset link sent', token };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.type !== 'password-reset') throw new Error();
      const hashed = await bcrypt.hash(newPassword, 12);
      await this.prisma.user.update({
        where: { id: payload.sub },
        data: { password: hashed },
      });
      return { message: 'Password reset successfully' };
    } catch {
      throw new BadRequestException('Invalid or expired token');
    }
  }

  async oAuthLogin(profile: { email: string; name: string; avatarUrl?: string }) {
    let user = await this.prisma.user.findUnique({
      where: { email: profile.email },
    });
    if (!user) {
      const randomPass = randomBytes(32).toString('hex');
      const hashed = await bcrypt.hash(randomPass, 12);
      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          avatarUrl: profile.avatarUrl,
          password: hashed,
        },
      });
    }
    const tokens = await this.generateTokens(user.id, user.email);
    const { password, ...safeUser } = user;
    return { user: safeUser, ...tokens };
  }

  async oAuthLoginWithProvider(provider: string, code: string) {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) throw new BadRequestException('BACKEND_URL not configured');

    if (provider === 'google') {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: `${backendUrl}/api/auth/google/callback`,
          grant_type: 'authorization_code',
        }),
      });
      const tokenData = await tokenRes.json();
      console.log('Google token response:', JSON.stringify(tokenData));
      if (!tokenData.access_token) throw new BadRequestException('Google OAuth failed: ' + (tokenData.error_description || tokenData.error || 'no access_token'));

      const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const profile = await profileRes.json();
      console.log('Google profile response:', JSON.stringify(profile));
      return this.oAuthLogin({
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.picture,
      });
    }

      if (provider === 'github') {
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          code,
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          redirect_uri: `${backendUrl}/api/auth/github/callback`,
        }),
      });
      const tokenData = await tokenRes.json();
      console.log('GitHub token response:', JSON.stringify(tokenData));
      if (!tokenData.access_token) throw new BadRequestException('GitHub OAuth failed: ' + (tokenData.error_description || tokenData.error || 'no access_token'));

      const profileRes = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const profile = await profileRes.json();

      const emailRes = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const emails = await emailRes.json();
      const primaryEmail = Array.isArray(emails) ? emails.find((e: any) => e.primary)?.email || emails[0]?.email : null;

      return this.oAuthLogin({
        email: primaryEmail || `${profile.login}@github.user`,
        name: profile.name || profile.login,
        avatarUrl: profile.avatar_url,
      });
    }

    throw new BadRequestException(`Unsupported OAuth provider: ${provider}`);
  }

  private async generateTokens(userId: string, email: string) {
    const accessToken = this.jwtService.sign(
      { sub: userId, email },
      { expiresIn: '15m' },
    );
    const refreshToken = randomBytes(48).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.session.create({
      data: { token: refreshToken, userId, expiresAt },
    });

    return { accessToken, refreshToken };
  }
}
