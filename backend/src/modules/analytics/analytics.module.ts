import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AnalyticsScopeService } from './services/analytics-scope.service';
import { AnalyticsController } from './controllers/analytics.controller';
import { AcademicLoadAnalyticsService } from './services/academic-load-analytics.service';
import { AnalyticsFilterOptionsService } from './services/analytics-filter-options.service';
import { EnrollmentAnalyticsService } from './services/enrollment-analytics.service';
import { AnalyticsExcelExportService } from './services/analytics-excel-export.service';
import { ClassroomAvailabilityAnalyticsService } from './services/classroom-availability-analytics.service';
import { ClassroomAnalyticsUniverseService } from './services/classroom-analytics-universe.service';
import { ClassroomCapacityAnalyticsService } from './services/classroom-capacity-analytics.service';
import { TechnologyAnalyticsService } from './services/technology-analytics.service';
import { StaffAnalyticsService } from './services/staff-analytics.service';
import { ActivityAnalyticsService } from './services/activity-analytics.service';
import { MonitoringAnalyticsService } from './services/monitoring-analytics.service';

@Module({
  imports: [PrismaModule],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsScopeService,
    AnalyticsFilterOptionsService,
    AcademicLoadAnalyticsService,
    EnrollmentAnalyticsService,
    ClassroomAvailabilityAnalyticsService,
    ClassroomAnalyticsUniverseService,
    ClassroomCapacityAnalyticsService,
    TechnologyAnalyticsService,
    StaffAnalyticsService,
    ActivityAnalyticsService,
    MonitoringAnalyticsService,
    AnalyticsExcelExportService,
  ],
  exports: [AnalyticsScopeService],
})
export class AnalyticsModule {}
