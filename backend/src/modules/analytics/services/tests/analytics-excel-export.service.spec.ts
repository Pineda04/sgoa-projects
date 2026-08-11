import { PayloadTooLargeException } from '@nestjs/common';
import * as XlsxPopulate from 'xlsx-populate';
import { AcademicLoadDetailRow } from '../academic-load-analytics.service';
import { AnalyticsExcelExportService } from '../analytics-excel-export.service';
import { EnrollmentDetailRow } from '../enrollment-analytics.service';
import { ClassroomCapacityRow } from '../classroom-capacity-analytics.service';
import {
  TechnologyClassroomRow,
  TechnologyEnrollmentRow,
  TechnologyInventoryRow,
} from '../technology-analytics.service';
import { StaffDetailRow } from '../staff-analytics.service';
import { ActivityDetailRow } from '../activity-analytics.service';

describe('AnalyticsExcelExportService', () => {
  const service = new AnalyticsExcelExportService();

  it('rejects exports over 5000 rows with status 413', async () => {
    const row: AcademicLoadDetailRow = {
      teacherId: 'teacher-1',
      name: 'Teacher',
      code: 'T-1',
      sectionCount: 1,
      distinctCourseCount: 1,
      assignedUvs: 4,
    };

    await expect(
      service.academicLoad(Array.from({ length: 5001 }, () => row)),
    ).rejects.toMatchObject({
      constructor: PayloadTooLargeException,
      status: 413,
    });
  });

  it('neutralizes formula-like strings after leading spaces and controls', async () => {
    const buffer = await service.academicLoad([
      {
        teacherId: 'teacher-1',
        name: '  =SUM(1,1)',
        code: '\t@command',
        sectionCount: 2,
        distinctCourseCount: 1,
        assignedUvs: 4,
      },
    ]);
    const workbook = await XlsxPopulate.fromDataAsync(buffer);
    const sheet = workbook.sheet(0);

    expect(sheet.name()).toBe('Carga académica');
    expect(sheet.cell('A2').value()).toBe("'  =SUM(1,1)");
    expect(sheet.cell('B2').value()).toBe("'\t@command");
    expect(sheet.cell('A2').formula()).toBeUndefined();
    expect(sheet.cell('B2').formula()).toBeUndefined();
  });

  it('exports one sanitized staff row with multiline current positions and an honest note', async () => {
    const row: StaffDetailRow = {
      teacherId: 'teacher-1',
      name: '=Docente',
      code: '001',
      contractType: { id: 'contract', name: 'Contrato' },
      category: { id: 'category', name: 'Categoría' },
      shift: { id: 'shift', name: 'Jornada' },
      shiftStart: null,
      shiftEnd: null,
      currentPositions: [
        {
          position: { id: 'position-1', name: 'Cargo 1' },
          centerDepartment: {
            id: 'center-1',
            label: 'Centro - Departamento 1',
            centerName: 'Centro',
            departmentName: 'Departamento 1',
          },
          startDate: new Date('2026-01-01T00:00:00.000Z'),
          endDate: null,
        },
        {
          position: { id: 'position-2', name: 'Cargo 2' },
          centerDepartment: {
            id: 'center-2',
            label: 'Centro - Departamento 2',
            centerName: 'Centro',
            departmentName: 'Departamento 2',
          },
          startDate: new Date('2026-02-01T00:00:00.000Z'),
          endDate: null,
        },
      ],
    };
    const workbook = await XlsxPopulate.fromDataAsync(
      await service.staff([row]),
    );
    const sheet = workbook.sheet(0);
    expect(sheet.cell('A2').value()).toBe("'=Docente");
    expect(String(sheet.cell('H2').value())).toContain('\n');
    expect(sheet.cell('A4').value()).toContain('estado actual');
  });

  it('exports sanitized activities without evidence or file columns', async () => {
    const row: ActivityDetailRow = {
      id: 'activity-1',
      activityName: '@Actividad',
      progressLevel: 'Completa',
      isRegistered: true,
      activityType: { id: 'type-1', name: 'Tipo' },
      teacher: { id: 'teacher-1', name: 'Docente', code: '001' },
      assignmentReportId: 'report-1',
      period: {
        id: 'period-1',
        year: 2026,
        pac: 1,
        pacModality: 'Trimestre',
        label: 'No. 1, Trimestre, 2026',
      },
      centerDepartment: {
        id: 'center-1',
        centerName: 'Centro',
        departmentName: 'Departamento',
        label: 'Centro - Departamento',
      },
    };
    const workbook = await XlsxPopulate.fromDataAsync(
      await service.activities([row]),
    );
    const sheet = workbook.sheet(0);
    expect(sheet.cell('A2').value()).toBe("'@Actividad");
    const headers = sheet.range('A1:I1').value()[0].join(' ');
    expect(headers).not.toMatch(/evidencia|archivo|url|file/i);
    expect(sheet.cell('A4').value()).toContain('catálogo actual');
  });

  it('keeps numbers numeric, nulls empty, and includes the capacity note', async () => {
    const rows: EnrollmentDetailRow[] = [
      {
        sectionId: 'section-1',
        courseCode: 'MAT-101',
        courseName: 'Matemática',
        groupCode: '0800',
        teacherId: 'teacher-1',
        teacherName: 'Docente',
        classroomId: 'classroom-1',
        classroomName: 'A-1',
        studentCount: 35,
        maxCapacity: 30,
        occupancyRate: (35 / 30) * 100,
        availableSeats: 0,
        overCapacity: true,
      },
      {
        sectionId: 'section-2',
        courseCode: 'MAT-102',
        courseName: 'Álgebra',
        groupCode: '0900',
        teacherId: 'teacher-2',
        teacherName: 'Docente 2',
        classroomId: 'classroom-2',
        classroomName: 'A-2',
        studentCount: null,
        maxCapacity: null,
        occupancyRate: null,
        availableSeats: null,
        overCapacity: null,
      },
    ];

    const buffer = await service.enrollment(rows);
    const workbook = await XlsxPopulate.fromDataAsync(buffer);
    const sheet = workbook.sheet(0);

    expect(sheet.name()).toBe('Matrícula');
    expect(sheet.cell('F2').value()).toBe(35);
    expect(sheet.cell('H2').value()).toBe((35 / 30) * 100);
    expect(sheet.cell('F3').value()).toBeUndefined();
    expect(sheet.cell('G3').value()).toBeUndefined();
    expect(sheet.cell('J2').value()).toBe('Sobre capacidad');
    expect(sheet.cell('J3').value()).toBe('No calculable');
    expect(sheet.cell('A5').value()).toBe(
      'La capacidad corresponde al estado actual de las aulas.',
    );
  });

  it('exports restricted classroom conflicts without protected metadata', async () => {
    const buffer = await service.classroomAvailability([
      {
        classroomId: 'room-1',
        classroomName: 'A-101',
        buildingId: 'building-1',
        buildingName: 'Principal',
        centerId: 'center-1',
        centerName: 'Centro',
        status: 'occupied',
        dataStatus: 'complete',
        conflictCount: 1,
        conflicts: [
          {
            visibility: 'restricted',
            startTime: '08:00',
            endTime: '09:00',
          },
        ],
        scheduleIssues: [
          {
            visibility: 'restricted',
            reason: 'invalid_schedule_section',
          },
        ],
      },
    ]);
    const workbook = await XlsxPopulate.fromDataAsync(buffer);
    const sheet = workbook.sheet(0);

    expect(sheet.cell('G2').value()).toBe('Clase fuera del alcance');
    expect(sheet.cell('H2').value()).toBe('08:00 - 09:00');
    expect(sheet.cell('I2').value()).toBe(
      'Incidencia en clase fuera del alcance: Rango de horario inválido',
    );
    expect(String(sheet.cell('I2').value())).not.toMatch(/raw|section|days/i);
    expect(sheet.cell('A4').value()).toBe(
      'Las aulas activas y sus vinculaciones corresponden al catálogo actual.',
    );
  });

  it('exports capacity columns, current-data note, and neutralized classroom names', async () => {
    const row: ClassroomCapacityRow = {
      classroomId: 'room-1',
      classroomName: '=Aula',
      buildingId: 'building-1',
      buildingName: 'Edificio',
      centerId: 'center-1',
      centerName: 'Centro',
      roomTypeId: 'type-1',
      roomType: 'Laboratorio',
      maxCapacity: 40,
      capacityStatus: 'known',
    };
    const workbook = await XlsxPopulate.fromDataAsync(
      await service.classroomCapacity([row]),
    );
    const sheet = workbook.sheet(0);

    expect(sheet.cell('A1').value()).toBe('Aula');
    expect(sheet.cell('A2').value()).toBe("'=Aula");
    expect(sheet.cell('E2').value()).toBe(40);
    expect(sheet.cell('F2').value()).toBe('Conocida');
    expect(sheet.cell('A4').value()).toBe(
      'Las aulas y capacidades corresponden al catálogo actual.',
    );
  });

  it('exports each technology discriminator with metric-specific columns and notes', async () => {
    const classroom: TechnologyClassroomRow = {
      rowType: 'equipped_classroom',
      classroomId: 'room-1',
      classroomName: 'Aula',
      buildingId: 'building-1',
      buildingName: 'Edificio',
      centerId: 'center-1',
      centerName: 'Centro',
      roomType: 'Aula',
      digitalBlackboardCount: 2,
      equipped: true,
    };
    const enrollment: TechnologyEnrollmentRow = {
      rowType: 'equipped_classroom_enrollment',
      sectionId: 'section-1',
      courseCode: 'MAT-101',
      courseName: 'Matemática',
      groupCode: 'G1',
      teacherId: 'teacher-1',
      teacherName: 'Docente',
      classroomId: 'room-1',
      classroomName: 'Aula',
      studentCount: null,
      enrollmentStatus: 'missing',
    };
    const inventory: TechnologyInventoryRow = {
      rowType: 'equipment_inventory',
      equipmentKey: 'pc_equipment:pc-1',
      equipmentId: 'pc-1',
      equipmentTypeId: 'pc_equipment',
      equipmentType: 'Equipo de cómputo',
      itemLabel: '@inventory',
      conditionId: 'condition-1',
      conditionLabel: 'Bueno',
      classroomId: 'room-1',
      classroomName: 'Aula',
      buildingId: 'building-1',
      buildingName: 'Edificio',
      centerId: 'center-1',
      centerName: 'Centro',
    };

    const classroomSheet = (
      await XlsxPopulate.fromDataAsync(
        await service.technology([classroom], 'equipped_classrooms'),
      )
    ).sheet(0);
    const enrollmentSheet = (
      await XlsxPopulate.fromDataAsync(
        await service.technology([enrollment], 'equipped_classroom_enrollment'),
      )
    ).sheet(0);
    const inventorySheet = (
      await XlsxPopulate.fromDataAsync(
        await service.technology([inventory], 'equipment_inventory'),
      )
    ).sheet(0);

    expect(classroomSheet.cell('E1').value()).toBe('Pizarras digitales');
    expect(classroomSheet.cell('F2').value()).toBe('Sí');
    expect(enrollmentSheet.cell('F2').value()).toBeUndefined();
    expect(enrollmentSheet.cell('G2').value()).toBe('Faltante');
    expect(inventorySheet.cell('A2').value()).toBe('pc_equipment:pc-1');
    expect(inventorySheet.cell('C2').value()).toBe("'@inventory");
    expect(inventorySheet.cell('A4').value()).toContain('Inventario físico');
  });

  it('applies the 5000-row limit to technology exports', async () => {
    const row = {
      rowType: 'equipment_inventory' as const,
      equipmentKey: 'pc_equipment:pc-1',
      equipmentId: 'pc-1',
      equipmentTypeId: 'pc_equipment' as const,
      equipmentType: 'Equipo de cómputo',
      itemLabel: null,
      conditionId: 'condition-1',
      conditionLabel: 'Bueno',
      classroomId: 'room-1',
      classroomName: 'Aula',
      buildingId: 'building-1',
      buildingName: 'Edificio',
      centerId: 'center-1',
      centerName: 'Centro',
    };
    await expect(
      service.technology(
        Array.from({ length: 5001 }, () => row),
        'equipment_inventory',
      ),
    ).rejects.toBeInstanceOf(PayloadTooLargeException);
  });
});
