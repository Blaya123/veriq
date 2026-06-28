import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IntegrationType } from '../lib/prisma-enums';
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

@Injectable()
export class IntegrationService {
  constructor(private prisma: PrismaService) {}

  async connect(workspaceId: string, type: IntegrationType, name: string, credentials?: Record<string, any>) {
    const existing = await this.prisma.integration.findFirst({
      where: { workspaceId, type },
    });
    if (existing) throw new ConflictException(`${type} integration already exists for this workspace`);

    const encrypted = credentials ? this.encrypt(credentials) : undefined;

    const integration = await this.prisma.integration.create({
      data: {
        workspaceId,
        type,
        name,
        credentials: encrypted as any,
        isConnected: true,
        lastSyncedAt: new Date(),
      },
    });
    return integration;
  }

  async disconnect(id: string) {
    const integration = await this.prisma.integration.findUnique({ where: { id } });
    if (!integration) throw new NotFoundException('Integration not found');
    return this.prisma.integration.update({
      where: { id },
      data: { isConnected: false, credentials: null },
    });
  }

  async reconnect(id: string) {
    const integration = await this.prisma.integration.findUnique({ where: { id } });
    if (!integration) throw new NotFoundException('Integration not found');
    return this.prisma.integration.update({
      where: { id },
      data: { isConnected: true, lastSyncedAt: new Date() },
    });
  }

  async getStatus(id: string) {
    const integration = await this.prisma.integration.findUnique({ where: { id } });
    if (!integration) throw new NotFoundException('Integration not found');
    return {
      id: integration.id,
      type: integration.type,
      name: integration.name,
      isConnected: integration.isConnected,
      lastSyncedAt: integration.lastSyncedAt,
    };
  }

  async findAllByWorkspace(workspaceId: string) {
    return this.prisma.integration.findMany({ where: { workspaceId } });
  }

  async syncMessages(id: string) {
    const integration = await this.prisma.integration.findUnique({ where: { id } });
    if (!integration) throw new NotFoundException('Integration not found');
    return this.prisma.integration.update({
      where: { id },
      data: { lastSyncedAt: new Date() },
    });
  }

  async handleWebhook(channel: string, payload: any) {
    switch (channel) {
      case 'whatsapp':
        return this.handleWhatsAppWebhook(payload);
      case 'telegram':
        return this.handleTelegramWebhook(payload);
      case 'instagram':
        return this.handleInstagramWebhook(payload);
      case 'facebook':
        return this.handleFacebookWebhook(payload);
      default:
        throw new BadRequestException(`Unknown channel: ${channel}`);
    }
  }

  async handleOAuthCallback(type: IntegrationType, code: string, workspaceId: string) {
    const tokens = await this.exchangeOAuthCode(type, code);
    const encrypted = this.encrypt(tokens);
    const integration = await this.prisma.integration.create({
      data: {
        workspaceId,
        type,
        name: `${type} Integration`,
        credentials: encrypted as any,
        isConnected: true,
        lastSyncedAt: new Date(),
      },
    });
    return integration;
  }

  private async handleWhatsAppWebhook(payload: any) {
    return { received: true, channel: 'whatsapp', payload };
  }

  private async handleTelegramWebhook(payload: any) {
    return { received: true, channel: 'telegram', payload };
  }

  private async handleInstagramWebhook(payload: any) {
    return { received: true, channel: 'instagram', payload };
  }

  private async handleFacebookWebhook(payload: any) {
    return { received: true, channel: 'facebook', payload };
  }

  private async exchangeOAuthCode(type: IntegrationType, code: string) {
    return { accessToken: `mock-${type}-${code}`, refreshToken: `mock-refresh-${code}` };
  }

  private encrypt(data: any): { iv: string; encrypted: string; tag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { iv: iv.toString('hex'), encrypted, tag: cipher.getAuthTag().toString('hex') };
  }

  decrypt(encrypted: { iv: string; encrypted: string; tag: string }): any {
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      Buffer.from(encrypted.iv, 'hex'),
    );
    decipher.setAuthTag(Buffer.from(encrypted.tag, 'hex'));
    let decrypted = decipher.update(encrypted.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  }
}
