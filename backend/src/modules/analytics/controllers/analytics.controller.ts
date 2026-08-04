import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { GetCurrentUserId, Roles } from 'src/common/decorators';
import { EUserRole } from 'src/common/enums';
import {
  AcademicLoadDetailsDto,
  AcademicLoadExportDto,
  AcademicLoadFiltersDto,
  AnalyticsFilterOptionsQueryDto,
  ClassroomAvailabilityDetailsDto,
  ClassroomAvailabilityExportDto,
  ClassroomAvailabilityFiltersDto,
  ClassroomCapacityDetailsDto,
  ClassroomCapacityExportDto,
  ClassroomCapacityFiltersDto,
  EnrollmentDetailsDto,
  EnrollmentExportDto,
  EnrollmentFiltersDto,
  TechnologyDetailsDto,
  TechnologyExportDto,
  TechnologyFiltersDto,
  StaffFiltersDto,
  StaffDetailsDto,
  StaffExportDto,
  ActivityFiltersDto,
  ActivityDetailsDto,
  ActivityExportDto,
  MonitoringDetailsDto,
  MonitoringExportDto,
  MonitoringFiltersDto,
} from '../dto';
import { AcademicLoadAnalyticsService } from '../services/academic-load-analytics.service';
import { AnalyticsFilterOptionsService } from '../services/analytics-filter-options.service';
import { EnrollmentAnalyticsService } from '../services/enrollment-analytics.service';
import { AnalyticsExcelExportService } from '../services/analytics-excel-export.service';
import { ClassroomAvailabilityAnalyticsService } from '../services/classroom-availability-analytics.service';
import { ClassroomCapacityAnalyticsService } from '../services/classroom-capacity-analytics.service';
import { TechnologyAnalyticsService } from '../services/technology-analytics.service';
import { StaffAnalyticsService } from '../services/staff-analytics.service';
import { ActivityAnalyticsService } from '../services/activity-analytics.service';
import { MonitoringAnalyticsService } from '../services/monitoring-analytics.service';

const XLSX_CONTENT_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const ANALYTICS_ROLES = [
  EUserRole.ADMIN,
  EUserRole.DIRECCION,
  EUserRole.RRHH,
  EUserRole.COORDINADOR_AREA,
  EUserRole.DOCENTE,
  EUserRole.MONITOR,
];

const ACADEMIC_LOAD_ROLES = [
  EUserRole.ADMIN,
  EUserRole.DIRECCION,
  EUserRole.RRHH,
  EUserRole.COORDINADOR_AREA,
  EUserRole.DOCENTE,
];

const ENROLLMENT_ROLES = [
  EUserRole.ADMIN,
  EUserRole.DIRECCION,
  EUserRole.COORDINADOR_AREA,
  EUserRole.DOCENTE,
];

const CLASSROOM_ROLES = [
  EUserRole.ADMIN,
  EUserRole.DIRECCION,
  EUserRole.COORDINADOR_AREA,
  EUserRole.DOCENTE,
];

const TECHNOLOGY_ROLES = [
  EUserRole.ADMIN,
  EUserRole.DIRECCION,
  EUserRole.COORDINADOR_AREA,
];

const STAFF_ROLES = [
  EUserRole.ADMIN,
  EUserRole.DIRECCION,
  EUserRole.RRHH,
  EUserRole.COORDINADOR_AREA,
];

const ACTIVITY_ROLES = [
  EUserRole.ADMIN,
  EUserRole.DIRECCION,
  EUserRole.COORDINADOR_AREA,
  EUserRole.DOCENTE,
];

const MONITORING_ROLES = [
  EUserRole.ADMIN,
  EUserRole.DIRECCION,
  EUserRole.MONITOR,
];

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly filterOptionsService: AnalyticsFilterOptionsService,
    private readonly academicLoadService: AcademicLoadAnalyticsService,
    private readonly enrollmentService: EnrollmentAnalyticsService,
    private readonly classroomAvailabilityService: ClassroomAvailabilityAnalyticsService,
    private readonly classroomCapacityService: ClassroomCapacityAnalyticsService,
    private readonly technologyService: TechnologyAnalyticsService,
    private readonly staffService: StaffAnalyticsService,
    private readonly activityService: ActivityAnalyticsService,
    private readonly monitoringService: MonitoringAnalyticsService,
    private readonly excelExportService: AnalyticsExcelExportService,
  ) {}

  @Get('filter-options')
  @Roles(...ANALYTICS_ROLES)
  @ApiOperation({
    summary: 'Obtener contexto y filtros autorizados de Analytics',
  })
  getFilterOptions(
    @GetCurrentUserId() userId: string,
    @Query() query: AnalyticsFilterOptionsQueryDto,
  ) {
    return this.filterOptionsService.getOptions(
      userId,
      query.centerDepartmentId,
      query.buildingId,
    );
  }

  @Get('academic-load')
  @Roles(...ACADEMIC_LOAD_ROLES)
  @ApiOperation({ summary: 'Obtener resumen de carga académica' })
  getAcademicLoad(
    @GetCurrentUserId() userId: string,
    @Query() query: AcademicLoadFiltersDto,
  ) {
    return this.academicLoadService.getSummary(userId, query);
  }

  @Get('academic-load/details')
  @Roles(...ACADEMIC_LOAD_ROLES)
  @ApiOperation({ summary: 'Obtener detalle paginado de carga por docente' })
  getAcademicLoadDetails(
    @GetCurrentUserId() userId: string,
    @Query() query: AcademicLoadDetailsDto,
  ) {
    return this.academicLoadService.getDetails(userId, query);
  }

  @Get('academic-load/export')
  @Roles(...ACADEMIC_LOAD_ROLES)
  @ApiOperation({ summary: 'Exportar detalle de carga académica a XLSX' })
  async exportAcademicLoadDetails(
    @GetCurrentUserId() userId: string,
    @Query() query: AcademicLoadExportDto,
    @Res() response: Response,
  ): Promise<void> {
    const rows = await this.academicLoadService.getExportRows(userId, query);
    const buffer = await this.excelExportService.academicLoad(rows);
    this.sendXlsx(
      response,
      buffer,
      `analytics-carga-academica-${this.safePeriodId(query.periodId)}.xlsx`,
    );
  }

  @Get('enrollment')
  @Roles(...ENROLLMENT_ROLES)
  @ApiOperation({ summary: 'Obtener resumen de matrícula y capacidad' })
  getEnrollment(
    @GetCurrentUserId() userId: string,
    @Query() query: EnrollmentFiltersDto,
  ) {
    return this.enrollmentService.getSummary(userId, query);
  }

  @Get('enrollment/details')
  @Roles(...ENROLLMENT_ROLES)
  @ApiOperation({ summary: 'Obtener detalle de matrícula y capacidad' })
  getEnrollmentDetails(
    @GetCurrentUserId() userId: string,
    @Query() query: EnrollmentDetailsDto,
  ) {
    return this.enrollmentService.getDetails(userId, query);
  }

  @Get('enrollment/export')
  @Roles(...ENROLLMENT_ROLES)
  @ApiOperation({ summary: 'Exportar detalle de matrícula a XLSX' })
  async exportEnrollmentDetails(
    @GetCurrentUserId() userId: string,
    @Query() query: EnrollmentExportDto,
    @Res() response: Response,
  ): Promise<void> {
    const rows = await this.enrollmentService.getExportRows(userId, query);
    const buffer = await this.excelExportService.enrollment(rows);
    this.sendXlsx(
      response,
      buffer,
      `analytics-matricula-${this.safePeriodId(query.periodId)}.xlsx`,
    );
  }

  @Get('classrooms')
  @Roles(...CLASSROOM_ROLES)
  @ApiOperation({ summary: 'Obtener disponibilidad planificada de aulas' })
  getClassroomAvailability(
    @GetCurrentUserId() userId: string,
    @Query() query: ClassroomAvailabilityFiltersDto,
  ) {
    return this.classroomAvailabilityService.getSummary(userId, query);
  }

  @Get('classrooms/details')
  @Roles(...CLASSROOM_ROLES)
  @ApiOperation({ summary: 'Obtener detalle de disponibilidad de aulas' })
  getClassroomAvailabilityDetails(
    @GetCurrentUserId() userId: string,
    @Query() query: ClassroomAvailabilityDetailsDto,
  ) {
    return this.classroomAvailabilityService.getDetails(userId, query);
  }

  @Get('classrooms/export')
  @Roles(...CLASSROOM_ROLES)
  @ApiOperation({ summary: 'Exportar disponibilidad de aulas a XLSX' })
  async exportClassroomAvailabilityDetails(
    @GetCurrentUserId() userId: string,
    @Query() query: ClassroomAvailabilityExportDto,
    @Res() response: Response,
  ): Promise<void> {
    const rows = await this.classroomAvailabilityService.getExportRows(
      userId,
      query,
    );
    const buffer = await this.excelExportService.classroomAvailability(rows);
    this.sendXlsx(
      response,
      buffer,
      `analytics-disponibilidad-aulas-${this.safePeriodId(query.periodId)}.xlsx`,
    );
  }

  @Get('classrooms/capacity')
  @Roles(...CLASSROOM_ROLES)
  @ApiOperation({ summary: 'Obtener capacidad instalada de aulas' })
  getClassroomCapacity(
    @GetCurrentUserId() userId: string,
    @Query() query: ClassroomCapacityFiltersDto,
  ) {
    return this.classroomCapacityService.getSummary(userId, query);
  }

  @Get('classrooms/capacity/details')
  @Roles(...CLASSROOM_ROLES)
  @ApiOperation({ summary: 'Obtener detalle de capacidad instalada' })
  getClassroomCapacityDetails(
    @GetCurrentUserId() userId: string,
    @Query() query: ClassroomCapacityDetailsDto,
  ) {
    return this.classroomCapacityService.getDetails(userId, query);
  }

  @Get('classrooms/capacity/export')
  @Roles(...CLASSROOM_ROLES)
  @ApiOperation({ summary: 'Exportar capacidad instalada a XLSX' })
  async exportClassroomCapacityDetails(
    @GetCurrentUserId() userId: string,
    @Query() query: ClassroomCapacityExportDto,
    @Res() response: Response,
  ): Promise<void> {
    const rows = await this.classroomCapacityService.getExportRows(
      userId,
      query,
    );
    const buffer = await this.excelExportService.classroomCapacity(rows);
    this.sendXlsx(
      response,
      buffer,
      `analytics-capacidad-aulas-${this.safePeriodId(query.periodId)}.xlsx`,
    );
  }

  @Get('technology')
  @Roles(...TECHNOLOGY_ROLES)
  @ApiOperation({ summary: 'Obtener resumen de tecnología en aulas' })
  getTechnology(
    @GetCurrentUserId() userId: string,
    @Query() query: TechnologyFiltersDto,
  ) {
    return this.technologyService.getSummary(userId, query);
  }

  @Get('technology/details')
  @Roles(...TECHNOLOGY_ROLES)
  @ApiOperation({
    summary: 'Obtener detalle de tecnología en aulas',
    description:
      'La métrica equipped_classrooms incluye todas las aulas elegibles para reconciliar el denominador de cobertura.',
  })
  getTechnologyDetails(
    @GetCurrentUserId() userId: string,
    @Query() query: TechnologyDetailsDto,
  ) {
    return this.technologyService.getDetails(userId, query);
  }

  @Get('technology/export')
  @Roles(...TECHNOLOGY_ROLES)
  @ApiOperation({ summary: 'Exportar detalle de tecnología a XLSX' })
  async exportTechnologyDetails(
    @GetCurrentUserId() userId: string,
    @Query() query: TechnologyExportDto,
    @Res() response: Response,
  ): Promise<void> {
    const rows = await this.technologyService.getExportRows(userId, query);
    const buffer = await this.excelExportService.technology(rows, query.metric);
    this.sendXlsx(
      response,
      buffer,
      `analytics-tecnologia-${this.safePeriodId(query.periodId)}-${query.metric}.xlsx`,
    );
  }

  @Get('staff')
  @Roles(...STAFF_ROLES)
  @ApiOperation({ summary: 'Obtener resumen del personal actual' })
  getStaff(
    @GetCurrentUserId() userId: string,
    @Query() query: StaffFiltersDto,
  ) {
    return this.staffService.getSummary(userId, query);
  }

  @Get('staff/details')
  @Roles(...STAFF_ROLES)
  @ApiOperation({ summary: 'Obtener detalle paginado del personal actual' })
  getStaffDetails(
    @GetCurrentUserId() userId: string,
    @Query() query: StaffDetailsDto,
  ) {
    return this.staffService.getDetails(userId, query);
  }

  @Get('staff/export')
  @Roles(...STAFF_ROLES)
  @ApiOperation({ summary: 'Exportar personal actual a XLSX' })
  async exportStaff(
    @GetCurrentUserId() userId: string,
    @Query() query: StaffExportDto,
    @Res() response: Response,
  ): Promise<void> {
    const rows = await this.staffService.getExportRows(userId, query);
    const buffer = await this.excelExportService.staff(rows);
    this.sendXlsx(response, buffer, 'analytics-personal-actual.xlsx');
  }

  @Get('activities')
  @Roles(...ACTIVITY_ROLES)
  @ApiOperation({ summary: 'Obtener resumen de actividades complementarias' })
  getActivities(
    @GetCurrentUserId() userId: string,
    @Query() query: ActivityFiltersDto,
  ) {
    return this.activityService.getSummary(userId, query);
  }

  @Get('activities/details')
  @Roles(...ACTIVITY_ROLES)
  @ApiOperation({ summary: 'Obtener detalle paginado de actividades' })
  getActivityDetails(
    @GetCurrentUserId() userId: string,
    @Query() query: ActivityDetailsDto,
  ) {
    return this.activityService.getDetails(userId, query);
  }

  @Get('activities/export')
  @Roles(...ACTIVITY_ROLES)
  @ApiOperation({ summary: 'Exportar actividades a XLSX' })
  async exportActivities(
    @GetCurrentUserId() userId: string,
    @Query() query: ActivityExportDto,
    @Res() response: Response,
  ): Promise<void> {
    const rows = await this.activityService.getExportRows(userId, query);
    const buffer = await this.excelExportService.activities(rows);
    const temporal = query.periodId ?? query.year ?? 'seleccion';
    this.sendXlsx(
      response,
      buffer,
      `analytics-actividades-${this.safePeriodId(temporal)}.xlsx`,
    );
  }

  @Get('monitoring')
  @Roles(...MONITORING_ROLES)
  @ApiOperation({ summary: 'Obtener resumen analítico de monitoreo' })
  getMonitoring(
    @GetCurrentUserId() userId: string,
    @Query() query: MonitoringFiltersDto,
  ) {
    return this.monitoringService.getSummary(userId, query);
  }

  @Get('monitoring/details')
  @Roles(...MONITORING_ROLES)
  @ApiOperation({ summary: 'Obtener detalle paginado de monitoreo' })
  getMonitoringDetails(
    @GetCurrentUserId() userId: string,
    @Query() query: MonitoringDetailsDto,
  ) {
    return this.monitoringService.getDetails(userId, query);
  }

  @Get('monitoring/export')
  @Roles(...MONITORING_ROLES)
  @ApiOperation({ summary: 'Exportar detalle de monitoreo a XLSX' })
  async exportMonitoring(
    @GetCurrentUserId() userId: string,
    @Query() query: MonitoringExportDto,
    @Res() response: Response,
  ): Promise<void> {
    const rows = await this.monitoringService.getExportRows(userId, query);
    const buffer = await this.excelExportService.monitoring(rows, query.metric);
    this.sendXlsx(response, buffer, `analytics-monitoreo-${query.metric}.xlsx`);
  }

  private sendXlsx(response: Response, buffer: Buffer, filename: string): void {
    response.setHeader('Content-Type', XLSX_CONTENT_TYPE);
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`,
    );
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.send(buffer);
  }

  private safePeriodId(periodId: string): string {
    return periodId.replace(/[^a-zA-Z0-9-]/g, '') || 'periodo';
  }
}
