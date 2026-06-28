import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminSetupController } from './admin-setup.controller';
import { AdminService } from './admin.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [AdminController, AdminSetupController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
