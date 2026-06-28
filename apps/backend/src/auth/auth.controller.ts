import { Controller, Post, Body, HttpCode, HttpStatus, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`FATAL: Required environment variable "${key}" is not set.`);
  return value;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Body('refreshToken') refreshToken: string) {
    return this.authService.logout(refreshToken);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  verifyEmail(@Body('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body('token') token: string, @Body('password') password: string) {
    return this.authService.resetPassword(token, password);
  }

  @Get('google')
  googleAuth(@Res() res: Response) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) return res.redirect('/login?error=Google OAuth not configured');
    const backendUrl = requireEnv('BACKEND_URL');
    const redirectUri = `${backendUrl}/api/auth/google/callback`;
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email%20profile`;
    return res.redirect(url);
  }

  @Get('google/callback')
  async googleCallback(@Query('code') code: string, @Res() res: Response) {
    try {
      const result = await this.authService.oAuthLoginWithProvider('google', code);
      const frontendUrl = requireEnv('FRONTEND_URL');
      return res.redirect(`${frontendUrl}/oauth-callback?token=${result.accessToken}&refreshToken=${result.refreshToken}`);
    } catch (err: any) {
      const frontendUrl = requireEnv('FRONTEND_URL');
      const message = encodeURIComponent(err?.message || 'unknown');
      return res.redirect(`${frontendUrl}/login?error=oauth-failed&details=${message}`);
    }
  }

  @Get('github')
  githubAuth(@Res() res: Response) {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) return res.redirect('/login?error=GitHub OAuth not configured');
    const backendUrl = requireEnv('BACKEND_URL');
    const redirectUri = `${backendUrl}/api/auth/github/callback`;
    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
    return res.redirect(url);
  }

  @Get('github/callback')
  async githubCallback(@Query('code') code: string, @Res() res: Response) {
    try {
      const result = await this.authService.oAuthLoginWithProvider('github', code);
      const frontendUrl = requireEnv('FRONTEND_URL');
      return res.redirect(`${frontendUrl}/oauth-callback?token=${result.accessToken}&refreshToken=${result.refreshToken}`);
    } catch (err: any) {
      const frontendUrl = requireEnv('FRONTEND_URL');
      const message = encodeURIComponent(err?.message || 'unknown');
      return res.redirect(`${frontendUrl}/login?error=oauth-failed&details=${message}`);
    }
  }
}
