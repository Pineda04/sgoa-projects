import { AnalyticsController } from './analytics.controller';
import { PERMISSION_KEY } from 'src/common/decorators';
import { AnalyticsFilterOptionsService } from '../services/analytics-filter-options.service';
import { AcademicLoadAnalyticsService } from '../services/academic-load-analytics.service';
import { EnrollmentAnalyticsService } from '../services/enrollment-analytics.service';
import { AnalyticsExcelExportService } from '../services/analytics-excel-export.service';
import { ClassroomAvailabilityAnalyticsService } from '../services/classroom-availability-analytics.service';
import { ClassroomCapacityAnalyticsService } from '../services/classroom-capacity-analytics.service';
import { TechnologyAnalyticsService } from '../services/technology-analytics.service';
import { StaffAnalyticsService } from '../services/staff-analytics.service';
import { ActivityAnalyticsService } from '../services/activity-analytics.service';
import { MonitoringAnalyticsService } from '../services/monitoring-analytics.service';
import { Test } from '@nestjs/testing';
import { Response } from 'express';
import { PATH_METADATA } from '@nestjs/common/constants';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  const filterOptionsService = { getOptions: jest.fn() };
  const academicLoadService = {
    getSummary: jest.fn(),
    getDetails: jest.fn(),
    getExportRows: jest.fn(),
  };
  const enrollmentService = {
    getSummary: jest.fn(),
    getDetails: jest.fn(),
    getExportRows: jest.fn(),
  };
  const classroomAvailabilityService = {
    getSummary: jest.fn(),
    getDetails: jest.fn(),
    getExportRows: jest.fn(),
  };
  const classroomCapacityService = {
    getSummary: jest.fn(),
    getDetails: jest.fn(),
    getExportRows: jest.fn(),
  };
  const technologyService = {
    getSummary: jest.fn(),
    getDetails: jest.fn(),
    getExportRows: jest.fn(),
  };
  const staffService = {
    getSummary: jest.fn(),
    getDetails: jest.fn(),
    getExportRows: jest.fn(),
  };
  const activityService = {
    getSummary: jest.fn(),
    getDetails: jest.fn(),
    getExportRows: jest.fn(),
  };
  const monitoringService = {
    getSummary: jest.fn(),
    getDetails: jest.fn(),
    getExportRows: jest.fn(),
  };
  const excelExportService = {
    academicLoad: jest.fn(),
    enrollment: jest.fn(),
    classroomAvailability: jest.fn(),
    classroomCapacity: jest.fn(),
    technology: jest.fn(),
    staff: jest.fn(),
    activities: jest.fn(),
    monitoring: jest.fn(),
  };
  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsFilterOptionsService,
          useValue: filterOptionsService,
        },
        {
          provide: AcademicLoadAnalyticsService,
          useValue: academicLoadService,
        },
        { provide: EnrollmentAnalyticsService, useValue: enrollmentService },
        {
          provide: ClassroomAvailabilityAnalyticsService,
          useValue: classroomAvailabilityService,
        },
        {
          provide: ClassroomCapacityAnalyticsService,
          useValue: classroomCapacityService,
        },
        { provide: TechnologyAnalyticsService, useValue: technologyService },
        { provide: StaffAnalyticsService, useValue: staffService },
        { provide: ActivityAnalyticsService, useValue: activityService },
        { provide: MonitoringAnalyticsService, useValue: monitoringService },
        { provide: AnalyticsExcelExportService, useValue: excelExportService },
      ],
    }).compile();
    controller = module.get(AnalyticsController);
  });

  it('forwards the authenticated user and filters to services', async () => {
    filterOptionsService.getOptions.mockResolvedValue({ domains: [] });
    academicLoadService.getSummary.mockResolvedValue({ metrics: {} });
    academicLoadService.getDetails.mockResolvedValue({ rows: [] });
    enrollmentService.getSummary.mockResolvedValue({ metrics: {} });
    enrollmentService.getDetails.mockResolvedValue({ rows: [] });
    classroomAvailabilityService.getSummary.mockResolvedValue({ metrics: {} });
    classroomAvailabilityService.getDetails.mockResolvedValue({ rows: [] });
    classroomCapacityService.getSummary.mockResolvedValue({ metrics: {} });
    classroomCapacityService.getDetails.mockResolvedValue({ rows: [] });
    technologyService.getSummary.mockResolvedValue({ metrics: {} });
    technologyService.getDetails.mockResolvedValue({ rows: [] });

    await controller.getFilterOptions('user-1', {
      centerDepartmentId: 'center-1',
    });
    await controller.getAcademicLoad('user-1', { periodId: 'period-1' });
    await controller.getAcademicLoadDetails('user-1', {
      metric: 'teacher_load',
      periodId: 'period-1',
    });
    await controller.getEnrollment('user-1', { periodId: 'period-1' });
    await controller.getEnrollmentDetails('user-1', {
      metric: 'enrollment_capacity',
      periodId: 'period-1',
    });
    const classroomFilters = {
      periodId: 'period-1',
      dayOfWeek: 'Lu' as const,
      startTime: '08:00',
      endTime: '10:00',
    };
    await controller.getClassroomAvailability('user-1', classroomFilters);
    await controller.getClassroomAvailabilityDetails('user-1', {
      ...classroomFilters,
      metric: 'classroom_availability',
    });
    await controller.getClassroomCapacity('user-1', { periodId: 'period-1' });
    await controller.getClassroomCapacityDetails('user-1', {
      periodId: 'period-1',
      metric: 'installed_capacity',
    });
    await controller.getTechnology('user-1', { periodId: 'period-1' });
    await controller.getTechnologyDetails('user-1', {
      periodId: 'period-1',
      metric: 'equipped_classrooms',
    });

    expect(filterOptionsService.getOptions).toHaveBeenCalledWith(
      'user-1',
      'center-1',
      undefined,
    );
    expect(academicLoadService.getSummary).toHaveBeenCalledWith('user-1', {
      periodId: 'period-1',
    });
    expect(academicLoadService.getDetails).toHaveBeenCalledWith('user-1', {
      metric: 'teacher_load',
      periodId: 'period-1',
    });
    expect(enrollmentService.getSummary).toHaveBeenCalledWith('user-1', {
      periodId: 'period-1',
    });
    expect(enrollmentService.getDetails).toHaveBeenCalledWith('user-1', {
      metric: 'enrollment_capacity',
      periodId: 'period-1',
    });
    expect(classroomAvailabilityService.getSummary).toHaveBeenCalledWith(
      'user-1',
      classroomFilters,
    );
    expect(classroomAvailabilityService.getDetails).toHaveBeenCalledWith(
      'user-1',
      { ...classroomFilters, metric: 'classroom_availability' },
    );
    expect(classroomCapacityService.getSummary).toHaveBeenCalledWith('user-1', {
      periodId: 'period-1',
    });
    expect(technologyService.getDetails).toHaveBeenCalledWith('user-1', {
      periodId: 'period-1',
      metric: 'equipped_classrooms',
    });
  });

  it('requires read:analytics once for every controller route', () => {
    expect(Reflect.getMetadata(PERMISSION_KEY, AnalyticsController)).toEqual({
      action: 'read',
      subject: 'analytics',
    });
  });

  it.each([
    ['exportAcademicLoadDetails', 'academic-load/export'],
    ['exportEnrollmentDetails', 'enrollment/export'],
    ['exportClassroomAvailabilityDetails', 'classrooms/export'],
    ['exportClassroomCapacityDetails', 'classrooms/capacity/export'],
    ['exportTechnologyDetails', 'technology/export'],
    ['exportStaff', 'staff/export'],
    ['exportActivities', 'activities/export'],
  ] as const)(
    'publishes only the planned export route for %s',
    (method, path) => {
      expect(Reflect.getMetadata(PATH_METADATA, controller[method])).toBe(path);
    },
  );

  it.each([
    {
      exportMethod: 'exportAcademicLoadDetails' as const,
      rowsMethod: academicLoadService.getExportRows,
      excelMethod: excelExportService.academicLoad,
      filename: 'analytics-carga-academica-period-1.xlsx',
    },
    {
      exportMethod: 'exportEnrollmentDetails' as const,
      rowsMethod: enrollmentService.getExportRows,
      excelMethod: excelExportService.enrollment,
      filename: 'analytics-matricula-period-1.xlsx',
    },
  ])(
    'sends a raw XLSX buffer with controlled headers: $exportMethod',
    async ({ exportMethod, rowsMethod, excelMethod, filename }) => {
      const rows = [{ id: 'row-1' }];
      const buffer = Buffer.from('PK workbook');
      rowsMethod.mockResolvedValue(rows);
      excelMethod.mockResolvedValue(buffer);
      const setHeader = jest.fn();
      const send = jest.fn();
      const response = {
        setHeader,
        send,
      } as unknown as Response;

      let query: object;
      if (exportMethod === 'exportAcademicLoadDetails') {
        const academicQuery = {
          periodId: 'period-1',
          metric: 'teacher_load' as const,
        };
        query = academicQuery;
        await controller.exportAcademicLoadDetails(
          'user-1',
          academicQuery,
          response,
        );
      } else {
        const enrollmentQuery = {
          periodId: 'period-1',
          metric: 'enrollment_capacity' as const,
        };
        query = enrollmentQuery;
        await controller.exportEnrollmentDetails(
          'user-1',
          enrollmentQuery,
          response,
        );
      }

      expect(rowsMethod).toHaveBeenCalledWith('user-1', query);
      expect(excelMethod).toHaveBeenCalledWith(rows);
      expect(setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      expect(setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );
      expect(setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store');
      expect(setHeader).toHaveBeenCalledWith(
        'X-Content-Type-Options',
        'nosniff',
      );
      expect(send).toHaveBeenCalledWith(buffer);
      expect(buffer.subarray(0, 2).toString()).toBe('PK');
    },
  );

  it('exports classroom availability as a raw XLSX buffer', async () => {
    const query = {
      periodId: 'period-1',
      metric: 'classroom_availability' as const,
      dayOfWeek: 'Lu' as const,
      startTime: '08:00',
      endTime: '10:00',
    };
    const rows = [{ classroomId: 'room-1' }];
    const buffer = Buffer.from('PK workbook');
    classroomAvailabilityService.getExportRows.mockResolvedValue(rows);
    excelExportService.classroomAvailability.mockResolvedValue(buffer);
    const setHeader = jest.fn();
    const response = {
      setHeader,
      send: jest.fn(),
    } as unknown as Response;

    await controller.exportClassroomAvailabilityDetails(
      'user-1',
      query,
      response,
    );

    expect(classroomAvailabilityService.getExportRows).toHaveBeenCalledWith(
      'user-1',
      query,
    );
    expect(excelExportService.classroomAvailability).toHaveBeenCalledWith(rows);
    expect(setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename="analytics-disponibilidad-aulas-period-1.xlsx"',
    );
    expect(response.send).toHaveBeenCalledWith(buffer);
  });

  it.each([
    {
      method: 'exportClassroomCapacityDetails' as const,
      service: classroomCapacityService,
      excel: excelExportService.classroomCapacity,
      query: { periodId: 'period-1', metric: 'installed_capacity' as const },
      filename: 'analytics-capacidad-aulas-period-1.xlsx',
    },
    {
      method: 'exportTechnologyDetails' as const,
      service: technologyService,
      excel: excelExportService.technology,
      query: { periodId: 'period-1', metric: 'equipment_inventory' as const },
      filename: 'analytics-tecnologia-period-1-equipment_inventory.xlsx',
    },
  ])(
    'exports phase 3 raw buffers: $method',
    async ({ method, service, excel, query, filename }) => {
      const rows = [{ id: 'row-1' }];
      const buffer = Buffer.from('PK workbook');
      service.getExportRows.mockResolvedValue(rows);
      excel.mockResolvedValue(buffer);
      const setHeader = jest.fn();
      const response = {
        setHeader,
        send: jest.fn(),
      } as unknown as Response;

      if (method === 'exportTechnologyDetails') {
        await controller.exportTechnologyDetails(
          'user-1',
          query as { periodId: string; metric: 'equipment_inventory' },
          response,
        );
      } else {
        await controller.exportClassroomCapacityDetails(
          'user-1',
          query,
          response,
        );
      }

      expect(service.getExportRows).toHaveBeenCalledWith('user-1', query);
      if (method === 'exportTechnologyDetails') {
        expect(excel).toHaveBeenCalledWith(rows, 'equipment_inventory');
      } else {
        expect(excel).toHaveBeenCalledWith(rows);
      }
      expect(setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );
      expect(response.send).toHaveBeenCalledWith(buffer);
    },
  );
});
