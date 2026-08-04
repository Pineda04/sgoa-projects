import { Injectable, PayloadTooLargeException } from '@nestjs/common';
import * as XlsxPopulate from 'xlsx-populate';
import type { AcademicLoadDetailRow } from './academic-load-analytics.service';
import type { EnrollmentDetailRow } from './enrollment-analytics.service';
import type { ClassroomAvailabilityRow } from './classroom-availability-analytics.service';
import type { ClassroomCapacityRow } from './classroom-capacity-analytics.service';
import type {
  TechnologyClassroomRow,
  TechnologyDetailRow,
  TechnologyEnrollmentRow,
  TechnologyInventoryRow,
} from './technology-analytics.service';
import type { TechnologyDetailMetric } from '../dto';
import type { StaffDetailRow } from './staff-analytics.service';
import type { ActivityDetailRow } from './activity-analytics.service';
import type { MonitoringDetailRow } from './monitoring-analytics.service';
import type { MonitoringDetailMetric } from '../dto';

const MAX_EXPORT_ROWS = 5000;

type CellValue = string | number | null;

@Injectable()
export class AnalyticsExcelExportService {
  async academicLoad(rows: AcademicLoadDetailRow[]): Promise<Buffer> {
    return this.createWorkbook(
      'Carga académica',
      [
        'Docente',
        'Código',
        'Secciones',
        'Asignaturas distintas',
        'UV asignadas',
      ],
      rows.map((row) => [
        row.name,
        row.code,
        row.sectionCount,
        row.distinctCourseCount,
        row.assignedUvs,
      ]),
      [30, 18, 12, 23, 15],
    );
  }

  async enrollment(rows: EnrollmentDetailRow[]): Promise<Buffer> {
    return this.createWorkbook(
      'Matrícula',
      [
        'Código de asignatura',
        'Asignatura',
        'Sección',
        'Docente',
        'Aula',
        'Matrícula',
        'Capacidad actual',
        'Ocupación %',
        'Cupos disponibles',
        'Estado',
      ],
      rows.map((row) => [
        row.courseCode,
        row.courseName,
        row.groupCode,
        row.teacherName,
        row.classroomName,
        row.studentCount,
        row.maxCapacity,
        row.occupancyRate,
        row.availableSeats,
        row.overCapacity === null
          ? 'No calculable'
          : row.overCapacity
            ? 'Sobre capacidad'
            : 'Dentro de capacidad',
      ]),
      [22, 32, 14, 28, 18, 13, 18, 14, 19, 21],
      'La capacidad corresponde al estado actual de las aulas.',
    );
  }

  async classroomAvailability(
    rows: ClassroomAvailabilityRow[],
  ): Promise<Buffer> {
    return this.createWorkbook(
      'Disponibilidad de aulas',
      [
        'Aula',
        'Edificio',
        'Centro',
        'Estado',
        'Calidad',
        'Cantidad de conflictos',
        'Clases conflictivas',
        'Horarios conflictivos',
        'Incidencias',
      ],
      rows.map((row) => [
        row.classroomName,
        row.buildingName,
        row.centerName,
        row.status === 'occupied'
          ? 'Ocupada'
          : row.status === 'available'
            ? 'Disponible'
            : 'Indeterminada',
        row.dataStatus === 'complete' ? 'Completa' : 'Parcial',
        row.conflictCount,
        row.conflicts
          .map((conflict) =>
            conflict.visibility === 'restricted'
              ? 'Clase fuera del alcance'
              : `${conflict.courseCode} - ${conflict.courseName} (${conflict.groupCode}) - ${conflict.teacherName}`,
          )
          .join('\n'),
        row.conflicts
          .map((conflict) => `${conflict.startTime} - ${conflict.endTime}`)
          .join('\n'),
        row.scheduleIssues
          .map((issue) => {
            const label =
              issue.reason === 'invalid_schedule_days'
                ? 'Días de horario inválidos'
                : 'Rango de horario inválido';
            return issue.visibility === 'restricted'
              ? `Incidencia en clase fuera del alcance: ${label}`
              : `${label}: ${issue.rawDays} / ${issue.rawSection}`;
          })
          .join('\n'),
      ]),
      [20, 24, 24, 16, 14, 22, 50, 24, 42],
      'Las aulas activas y sus vinculaciones corresponden al catálogo actual.',
    );
  }

  async classroomCapacity(rows: ClassroomCapacityRow[]): Promise<Buffer> {
    return this.createWorkbook(
      'Capacidad instalada',
      [
        'Aula',
        'Edificio',
        'Centro',
        'Tipo de aula',
        'Capacidad máxima',
        'Estado',
      ],
      rows.map((row) => [
        row.classroomName,
        row.buildingName,
        row.centerName,
        row.roomType,
        row.maxCapacity,
        row.capacityStatus === 'known'
          ? 'Conocida'
          : row.capacityStatus === 'missing'
            ? 'Faltante'
            : 'Inválida',
      ]),
      [22, 24, 24, 22, 20, 16],
      'Las aulas y capacidades corresponden al catálogo actual.',
    );
  }

  async technology(
    rows: TechnologyDetailRow[],
    metric: TechnologyDetailMetric,
  ): Promise<Buffer> {
    if (metric === 'equipped_classrooms') {
      const typedRows = rows as TechnologyClassroomRow[];
      return this.createWorkbook(
        'Aulas equipadas',
        [
          'Aula',
          'Edificio',
          'Centro',
          'Tipo de aula',
          'Pizarras digitales',
          'Equipada',
        ],
        typedRows.map((row) => [
          row.classroomName,
          row.buildingName,
          row.centerName,
          row.roomType,
          row.digitalBlackboardCount,
          row.equipped ? 'Sí' : 'No',
        ]),
        [22, 24, 24, 22, 20, 14],
        'Cobertura potencial según el catálogo actual de aulas e inventario.',
      );
    }
    if (metric === 'equipped_classroom_enrollment') {
      const typedRows = rows as TechnologyEnrollmentRow[];
      return this.createWorkbook(
        'Matrícula equipada',
        [
          'Código',
          'Asignatura',
          'Sección',
          'Docente',
          'Aula',
          'Matrícula',
          'Estado',
        ],
        typedRows.map((row) => [
          row.courseCode,
          row.courseName,
          row.groupCode,
          row.teacherName,
          row.classroomName,
          row.studentCount,
          row.enrollmentStatus === 'known' ? 'Conocida' : 'Faltante',
        ]),
        [18, 30, 14, 28, 22, 16, 16],
        'Las matrículas corresponden a secciones, no a estudiantes únicos.',
      );
    }
    const typedRows = rows as TechnologyInventoryRow[];
    return this.createWorkbook(
      'Inventario tecnológico',
      [
        'Clave',
        'Tipo',
        'Descripción',
        'Condición',
        'Aula',
        'Edificio',
        'Centro',
      ],
      typedRows.map((row) => [
        row.equipmentKey,
        row.equipmentType,
        row.itemLabel,
        row.conditionLabel,
        row.classroomName,
        row.buildingName,
        row.centerName,
      ]),
      [40, 22, 28, 20, 22, 24, 24],
      'Inventario físico asignado a aulas elegibles según el catálogo actual.',
    );
  }

  async staff(rows: StaffDetailRow[]): Promise<Buffer> {
    return this.createWorkbook(
      'Personal actual',
      [
        'Docente',
        'Código',
        'Contrato actual',
        'Categoría actual',
        'Jornada actual',
        'Inicio de jornada',
        'Fin de jornada',
        'Cargos académicos vigentes',
      ],
      rows.map((row) => [
        row.name,
        row.code,
        row.contractType.name,
        row.category.name,
        row.shift.name,
        this.timeValue(row.shiftStart),
        this.timeValue(row.shiftEnd),
        row.currentPositions.length
          ? row.currentPositions
              .map(
                ({ position, centerDepartment, startDate, endDate }) =>
                  `${position.name} | ${centerDepartment.label} | ${this.dateValue(startDate)} - ${endDate ? this.dateValue(endDate) : 'Vigente'}`,
              )
              .join('\n')
          : 'Sin cargo académico vigente',
      ]),
      [30, 18, 24, 24, 20, 18, 18, 60],
      'Contrato, categoría, jornada y cargos corresponden al estado actual del personal.',
    );
  }

  async activities(rows: ActivityDetailRow[]): Promise<Buffer> {
    return this.createWorkbook(
      'Actividades',
      [
        'Actividad',
        'Tipo actual',
        'Progreso',
        'Registrada',
        'Docente',
        'Código',
        'Informe de asignación',
        'Período',
        'Centro y departamento',
      ],
      rows.map((row) => [
        row.activityName,
        row.activityType.name,
        row.progressLevel,
        row.isRegistered === null
          ? 'Sin información'
          : row.isRegistered
            ? 'Sí'
            : 'No',
        row.teacher.name,
        row.teacher.code,
        row.assignmentReportId,
        row.period.label,
        row.centerDepartment.label,
      ]),
      [34, 28, 18, 18, 30, 18, 38, 28, 38],
      'Los tipos corresponden al catálogo actual. Los informes no poseen flujo de aprobación o anulación.',
    );
  }

  async monitoring(
    rows: MonitoringDetailRow[],
    metric: MonitoringDetailMetric,
  ): Promise<Buffer> {
    return this.createWorkbook(
      metric === 'digital_blackboard_use'
        ? 'Uso observado de pizarra'
        : 'Chequeos de monitoreo',
      [
        'Fecha',
        'Hora',
        'Estado',
        'Uso de pizarra',
        'Docente',
        'Asignatura',
        'Sección',
        'Aula',
        'Edificio',
        'Centro',
        'Carrera',
        'Período',
        'Monitor',
        'Observación',
      ],
      rows.map((row) => [
        row.checkDate.toISOString().slice(0, 10),
        row.checkTime,
        row.isPresent ? 'Presente' : 'Ausente',
        row.digitalBlackboardUseStatus === 'USED'
          ? 'Usada'
          : row.digitalBlackboardUseStatus === 'NOT_USED'
            ? 'No usada'
            : row.digitalBlackboardUseStatus === 'UNKNOWN'
              ? 'Desconocido'
              : 'No capturado / no aplica',
        row.teacherName,
        `${row.courseCode} - ${row.courseName}`,
        row.groupCode,
        row.classroomName,
        row.buildingName,
        row.centerName,
        row.centerDepartmentName,
        row.periodLabel,
        row.monitorName,
        row.observation,
      ]),
      [16, 12, 14, 24, 28, 38, 14, 18, 22, 22, 34, 26, 28, 45],
      'El uso de pizarra representa observaciones durante chequeos presentes; no mide el uso total institucional.',
    );
  }

  private async createWorkbook(
    sheetName: string,
    headers: string[],
    rows: CellValue[][],
    widths: number[],
    note?: string,
  ): Promise<Buffer> {
    if (rows.length > MAX_EXPORT_ROWS) {
      throw new PayloadTooLargeException(
        'La exportación supera el máximo de 5000 filas. Reduzca los filtros e intente nuevamente.',
      );
    }

    const workbook = await XlsxPopulate.fromBlankAsync();
    const sheet = workbook.sheet(0).name(sheetName);
    const values = [headers, ...rows].map((row) =>
      row.map((value) => this.safeValue(value)),
    );
    sheet.range(1, 1, values.length, headers.length).value(values);
    sheet.range(1, 1, 1, headers.length).style({
      bold: true,
      fill: 'D9EAF7',
      horizontalAlignment: 'center',
      verticalAlignment: 'center',
    });
    sheet.range(1, 1, values.length, headers.length).style({
      border: true,
      wrapText: true,
      verticalAlignment: 'center',
    });
    sheet.range(1, 1, values.length, headers.length).autoFilter();
    sheet.freezePanes('A2');
    widths.forEach((width, index) => sheet.column(index + 1).width(width));

    if (note) {
      const noteRow = values.length + 2;
      sheet.range(noteRow, 1, noteRow, headers.length).merged(true);
      sheet.cell(noteRow, 1).value(this.safeValue(note)).style({
        italic: true,
        fontColor: '595959',
      });
    }

    const output = await workbook.outputAsync();
    return output as Buffer;
  }

  private safeValue(value: CellValue): CellValue {
    if (typeof value !== 'string') return value;
    let firstMeaningfulIndex = 0;
    while (firstMeaningfulIndex < value.length) {
      const character = value[firstMeaningfulIndex];
      const code = character.charCodeAt(0);
      if (!/\s/u.test(character) && code > 31 && code !== 127) break;
      firstMeaningfulIndex += 1;
    }
    return ['=', '+', '-', '@'].includes(value[firstMeaningfulIndex])
      ? `'${value}`
      : value;
  }

  private timeValue(value: Date | null): string | null {
    if (!value) return null;
    return `${value.getUTCHours().toString().padStart(2, '0')}:${value.getUTCMinutes().toString().padStart(2, '0')}`;
  }

  private dateValue(value: Date): string {
    return value.toISOString().slice(0, 10);
  }
}
