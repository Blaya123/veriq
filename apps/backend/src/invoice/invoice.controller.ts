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
import { InvoiceService } from './invoice.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import {
  CreateInvoiceDto,
  UpdateInvoiceStatusDto,
  ProcessPaymentDto,
} from './dto/create-invoice.dto';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoiceController {
  constructor(private invoiceService: InvoiceService) {}

  @Post()
  create(@Body() dto: CreateInvoiceDto) {
    return this.invoiceService.create(dto);
  }

  @Get('workspace/:workspaceId')
  findByWorkspace(@Param('workspaceId') workspaceId: string) {
    return this.invoiceService.findByWorkspace(workspaceId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.invoiceService.findById(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceStatusDto,
  ) {
    return this.invoiceService.updateStatus(id, dto);
  }

  @Post(':id/payments')
  processPayment(
    @Param('id') id: string,
    @Body() dto: ProcessPaymentDto,
  ) {
    return this.invoiceService.processPayment(id, dto);
  }

  @Post('generate-monthly')
  generateMonthly() {
    return this.invoiceService.generateMonthlyInvoices();
  }

  @Post('webhook/:provider')
  handleWebhook(
    @Param('provider') provider: string,
    @Body() body: any,
  ) {
    return this.invoiceService.handleWebhook(provider, body);
  }

  @Get('payment-methods/:workspaceId')
  getPaymentMethods(@Param('workspaceId') workspaceId: string) {
    return this.invoiceService.getPaymentMethods(workspaceId);
  }

  @Post('payment-methods/:workspaceId')
  addPaymentMethod(
    @Param('workspaceId') workspaceId: string,
    @Body() body: { type: 'CARD' | 'BANK_TRANSFER'; details: any },
  ) {
    return this.invoiceService.addPaymentMethod(
      workspaceId,
      body.type,
      body.details,
    );
  }

  @Delete('payment-methods/:id')
  removePaymentMethod(@Param('id') id: string) {
    return this.invoiceService.removePaymentMethod(id);
  }

  @Patch('payment-methods/:workspaceId/:id/default')
  setDefaultPaymentMethod(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.invoiceService.setDefaultPaymentMethod(workspaceId, id);
  }
}
