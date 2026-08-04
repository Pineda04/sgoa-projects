import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TeachingAssignmentModule } from '../teaching-assignment/teaching-assignment.module';
import { MonitorAssignmentsController } from './controllers/monitor-assignments.controller';
import { MonitorChecksController } from './controllers/monitor-checks.controller';
import { MonitorReportsController } from './controllers/monitor-reports.controller';
import { MonitorAssignmentsService } from './services/monitor-assignments.service';
import { MonitorChecksService } from './services/monitor-checks.service';
import { MonitorReportsService } from './services/monitor-reports.service';
import { MonitorAccessService } from './services/monitor-access.service';

@Module({
  imports: [PrismaModule, TeachingAssignmentModule],
  controllers: [
    MonitorAssignmentsController,
    MonitorChecksController,
    MonitorReportsController,
  ],
  providers: [
    MonitorAssignmentsService,
    MonitorChecksService,
    MonitorReportsService,
    MonitorAccessService,
  ],
  exports: [MonitorAccessService, MonitorChecksService, MonitorReportsService],
})
export class MonitorModule {}
