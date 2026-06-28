import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InvoiceStatus, PaymentStatus } from '../lib/prisma-enums';
import {
  CreateInvoiceDto,
  UpdateInvoiceStatusDto,
  ProcessPaymentDto,
} from './dto/create-invoice.dto';

@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) {}

  private async generateInvoiceNumber(): Promise<string> {
    const count = await this.prisma.invoice.count();
    const year = new Date().getFullYear();
    const seq = String(count + 1).padStart(6, '0');
    return `INV-${year}-${seq}`;
  }

  async create(dto: CreateInvoiceDto) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: dto.workspaceId },
    });
    if (!workspace) throw new NotFoundException('Workspace not found');

    const number = await this.generateInvoiceNumber();

    return this.prisma.invoice.create({
      data: {
        number,
        amount: dto.amount,
        currency: dto.currency || 'USD',
        status: InvoiceStatus.DRAFT,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        workspaceId: dto.workspaceId,
        contactId: dto.contactId,
      },
      include: { workspace: true, contact: true },
    });
  }

  async findByWorkspace(workspaceId: string) {
    return this.prisma.invoice.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      include: { contact: true, payments: true },
    });
  }

  async findById(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { workspace: true, contact: true, payments: true },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async updateStatus(id: string, dto: UpdateInvoiceStatusDto) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new NotFoundException('Invoice not found');

    const data: any = { status: dto.status };
    if (dto.status === InvoiceStatus.PAID) {
      data.paidAt = new Date();
    }

    return this.prisma.invoice.update({
      where: { id },
      data,
      include: { workspace: true, contact: true },
    });
  }

  async processPayment(invoiceId: string, dto: ProcessPaymentDto) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { workspace: true },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');

    const payment = await this.prisma.payment.create({
      data: {
        amount: dto.amount,
        currency: dto.currency || invoice.currency,
        status: PaymentStatus.COMPLETED,
        provider: dto.provider,
        providerPaymentId: dto.providerPaymentId,
        workspaceId: invoice.workspaceId,
        invoiceId: invoice.id,
        subscriptionId: (
          await this.prisma.workspaceSubscription.findFirst({
            where: { workspaceId: invoice.workspaceId },
            orderBy: { createdAt: 'desc' },
          })
        )?.id || '',
      },
    });

    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: InvoiceStatus.PAID, paidAt: new Date() },
    });

    return payment;
  }

  async handleWebhook(provider: string, payload: any) {
    const eventType = payload.type || payload.event;

    switch (eventType) {
      case 'payment_intent.succeeded':
      case 'charge.success': {
        const paymentIntentId =
          payload.data?.object?.id || payload.data?.reference;
        const invoiceId = payload.data?.object?.metadata?.invoiceId;

        if (invoiceId) {
          await this.processPayment(invoiceId, {
            provider,
            providerPaymentId: paymentIntentId,
            amount: payload.data?.object?.amount / 100 || 0,
            currency: payload.data?.object?.currency || 'USD',
          });
        }
        break;
      }
      case 'invoice.payment_failed': {
        const failedInvoiceId = payload.data?.object?.metadata?.invoiceId;
        if (failedInvoiceId) {
          await this.updateStatus(failedInvoiceId, {
            status: InvoiceStatus.OVERDUE,
          });
        }
        break;
      }
    }

    return { received: true };
  }

  async generateMonthlyInvoices() {
    const subscriptions = await this.prisma.workspaceSubscription.findMany({
      where: { status: { in: ['ACTIVE', 'TRIALING'] as any } },
      include: { workspace: true, plan: true },
    });

    const invoices = [];
    for (const sub of subscriptions) {
      if (sub.plan.priceMonthly <= 0) continue;

      const number = await this.generateInvoiceNumber();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 15);

      const invoice = await this.prisma.invoice.create({
        data: {
          number,
          amount: sub.plan.priceMonthly,
          currency: 'USD',
          status: InvoiceStatus.DRAFT,
          dueDate,
          workspaceId: sub.workspaceId,
        },
      });
      invoices.push(invoice);
    }

    return invoices;
  }

  async getPaymentMethods(workspaceId: string) {
    return this.prisma.paymentMethod.findMany({
      where: { workspaceId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async addPaymentMethod(
    workspaceId: string,
    type: 'CARD' | 'BANK_TRANSFER',
    details: any,
  ) {
    const existingCount = await this.prisma.paymentMethod.count({
      where: { workspaceId },
    });

    return this.prisma.paymentMethod.create({
      data: {
        workspaceId,
        type: type as any,
        details,
        isDefault: existingCount === 0,
      },
    });
  }

  async removePaymentMethod(id: string) {
    const method = await this.prisma.paymentMethod.findUnique({
      where: { id },
    });
    if (!method) throw new NotFoundException('Payment method not found');

    await this.prisma.paymentMethod.delete({ where: { id } });
    return { message: 'Payment method removed' };
  }

  async setDefaultPaymentMethod(workspaceId: string, id: string) {
    await this.prisma.paymentMethod.updateMany({
      where: { workspaceId },
      data: { isDefault: false },
    });

    return this.prisma.paymentMethod.update({
      where: { id },
      data: { isDefault: true },
    });
  }
}
