import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContactSource } from '../lib/prisma-enums';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  async create(workspaceId: string, dto: CreateContactDto) {
    if (dto.email) {
      const existing = await this.prisma.contact.findFirst({
        where: { workspaceId, email: dto.email },
      });
      if (existing) throw new ConflictException('Contact with this email already exists');
    }
    return this.prisma.contact.create({
      data: {
        ...dto,
        metadata: dto.metadata ? JSON.stringify(dto.metadata) : undefined,
        workspaceId,
      },
    });
  }

  async findAll(workspaceId: string, query?: { search?: string; source?: ContactSource }) {
    const where: any = { workspaceId };
    if (query?.search) {
      where.OR = [
        { name: { contains: query.search } },
        { email: { contains: query.search } },
        { phone: { contains: query.search } },
      ];
    }
    if (query?.source) where.source = query.source;
    return this.prisma.contact.findMany({
      where,
      include: {
        _count: { select: { deals: true, conversations: true, activities: true } },
        deals: { select: { value: true, currency: true, status: true } },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true, type: true, subject: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
      include: {
        _count: { select: { deals: true, conversations: true, activities: true } },
        deals: {
          include: {
            assignedTo: { select: { id: true, name: true, avatarUrl: true } },
          },
          orderBy: { updatedAt: 'desc' },
        },
        activities: {
          include: {
            createdBy: { select: { id: true, name: true, avatarUrl: true } },
            deal: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!contact) throw new NotFoundException('Contact not found');
    return contact;
  }

  async update(id: string, dto: UpdateContactDto) {
    await this.findById(id);
    return this.prisma.contact.update({ where: { id }, data: dto });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.contact.delete({ where: { id } });
    return { message: 'Contact deleted' };
  }

  async search(workspaceId: string, query: string) {
    return this.prisma.contact.findMany({
      where: {
        workspaceId,
        OR: [
          { name: { contains: query } },
          { email: { contains: query } },
          { phone: { contains: query } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBySource(workspaceId: string, source: ContactSource) {
    return this.prisma.contact.findMany({
      where: { workspaceId, source },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getByWorkspace(workspaceId: string) {
    return this.prisma.contact.findMany({
      where: { workspaceId },
      include: {
        _count: { select: { conversations: true, deals: true, activities: true } },
        deals: { select: { value: true, currency: true, status: true } },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true, type: true, subject: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async mergeDuplicates(workspaceId: string) {
    const contacts = await this.prisma.contact.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'asc' },
    });
    const emailMap = new Map<string, string>();
    const phoneMap = new Map<string, string>();
    let merged = 0;

    for (const contact of contacts) {
      if (contact.email && emailMap.has(contact.email)) {
        await this.prisma.contact.update({
          where: { id: contact.id },
          data: {
            conversations: {
              set: [],
            },
          },
        });
        merged++;
      } else if (contact.email) {
        emailMap.set(contact.email, contact.id);
      }
      if (contact.phone && phoneMap.has(contact.phone)) {
        merged++;
      } else if (contact.phone) {
        phoneMap.set(contact.phone, contact.id);
      }
    }
    return { message: 'Duplicates merged', merged };
  }
}
