import { Test, TestingModule } from '@nestjs/testing';
import * as XlsxPopulate from 'xlsx-populate';
import { ExcelFilesService } from '../excel-files.service';

import { propertiesAcademicAssignment } from 'src/modules/teaching-assignment/dto/academic-assignment.dto';
import type {
  TAcademicAssignment,
  AcademicAssignmentDto,
} from 'src/modules/teaching-assignment/dto/academic-assignment.dto';

const LEGACY_TEMPLATE_HEADERS = [
  '#',
  'No.Emp',
  'Nombre',
  'Código',
  'Asignatura',
  'UV',
  'Sección',
  'No. Alumnos',
  'Días',
  'Centro / Telecentro',
  'N° de Aula',
  'Carrera o Área',
  'Jefe / Coordinador',
  'Estudiantes por graduarse',
  'Observaciones',
];

const TEMPLATE_HEADERS = [
  '#',
  'No.Emp',
  'Nombre',
  'Código',
  'Asignatura',
  'Sección',
  'UV',
  'Días',
  'No. Alumnos de la sección',
  'N° de Aula',
  'Centro / Telecentro',
  'Estudiantes por egresar',
  'Observaciones',
];

// Encabezados del archivo que usan los coordinadores (incluye Horario de trabajo).
const COORDINATOR_HEADERS = [
  '#',
  'No.Emp',
  'Nombre',
  'Código',
  'Asignatura',
  'Sección',
  'UV',
  'Días',
  'No. Alumnos de la sección',
  'N° de Aula',
  'Horario de trabajo',
  'Centro / Telecentro',
  'Observaciones',
];

async function buildWorkbookBuffer(
  fillSheet: (sheet: XlsxPopulate.Sheet) => void,
): Promise<Buffer> {
  const workbook = await XlsxPopulate.fromBlankAsync();
  fillSheet(workbook.sheet(0));
  return Buffer.from((await workbook.outputAsync()) as ArrayBuffer);
}

describe('ExcelFilesService', () => {
  let service: ExcelFilesService<TAcademicAssignment, AcademicAssignmentDto>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExcelFilesService],
    }).compile();

    service =
      module.get<ExcelFilesService<TAcademicAssignment, AcademicAssignmentDto>>(
        ExcelFilesService,
      );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processFile', () => {
    it('parses the legacy format (title A1, subtitle A2, headers row 4, data from row 5)', async () => {
      const buffer = await buildWorkbookBuffer((sheet) => {
        sheet.cell('A1').value('PLANIFICACIÓN ACADÉMICA');
        sheet.cell('A2').value('PAC No. 2, Semestre, 2026');

        LEGACY_TEMPLATE_HEADERS.forEach((header, index) =>
          sheet.cell(4, index + 1).value(header),
        );

        sheet.cell(5, 2).value('DOC001');
        sheet.cell(5, 3).value('Juan Pérez');
        sheet.cell(5, 4).value('IS101-2025');
        sheet.cell(5, 5).value('Ingeniería en Sistemas');
        sheet.cell(5, 6).value(4);
        sheet.cell(5, 7).value('A1');
        sheet.cell(5, 8).value(35);
        sheet.cell(5, 9).value('LuMaMiVi');
        sheet.cell(5, 10).value('Centro Universitario Regional');
        sheet.cell(5, 11).value('Edificio C, Aula 302');
        sheet.cell(5, 12).value('Ingeniería en Sistemas');
        sheet.cell(5, 13).value('María López');
        sheet.cell(5, 14).value('Sí');
        sheet.cell(5, 15).value('Clase trasladada');

        sheet.cell(6, 2).value('DOC002');
        sheet.cell(6, 3).value('Ana Gómez');
        sheet.cell(6, 4).value('MAT-201');
        sheet.cell(6, 5).value('Matemáticas');
        sheet.cell(6, 6).value(3);
        sheet.cell(6, 7).value('B2');
        sheet.cell(6, 8).value(25);
        sheet.cell(6, 9).value('MaJuVi');
        sheet.cell(6, 10).value('Centro Universitario Regional');
        sheet.cell(6, 11).value('Edificio A, Aula 105');
        sheet.cell(6, 12).value('Ingeniería en Sistemas');
        sheet.cell(6, 13).value('María López');
        sheet.cell(6, 14).value('No');
      });

      const result = await service.processFile(
        propertiesAcademicAssignment,
        buffer,
      );

      expect(result.title).toBe('PLANIFICACIÓN ACADÉMICA');
      expect(result.subtitle).toBe('PAC No. 2, Semestre, 2026');
      expect(result.totalRecords).toBe(2);
      expect(result.data[0]).toMatchObject({
        teacherCode: 'DOC001',
        teacherName: 'Juan Pérez',
        courseCode: 'IS101-2025',
        courseName: 'Ingeniería en Sistemas',
        section: 'A1',
        uv: 4,
        days: 'LuMaMiVi',
        studentCount: 35,
        classroomName: 'Edificio C, Aula 302',
        departmentName: 'Ingeniería en Sistemas',
        coordinator: 'María López',
        center: 'Centro Universitario Regional',
        nearGraduation: true,
        observation: 'Clase trasladada',
      });
      expect(result.data[1]).toMatchObject({
        teacherCode: 'DOC002',
        teacherName: 'Ana Gómez',
        courseCode: 'MAT-201',
        courseName: 'Matemáticas',
        section: 'B2',
        uv: 3,
        days: 'MaJuVi',
        studentCount: 25,
        classroomName: 'Edificio A, Aula 105',
        nearGraduation: false,
      });
    });

    it('parses the new template format (headers row 1, example row skipped, data from row 3)', async () => {
      const buffer = await buildWorkbookBuffer((sheet) => {
        TEMPLATE_HEADERS.forEach((header, index) =>
          sheet.cell(1, index + 1).value(header),
        );

        // Fila de ejemplo: debe ser omitida por el parser.
        sheet.cell(2, 1).value('Ejemplo');
        sheet.cell(2, 2).value('3332');
        sheet.cell(2, 3).value('HUGO RICARDO ALARCON WELL');
        sheet.cell(2, 4).value('IS-510');
        sheet.cell(2, 5).value('Instalaciones Eléctricas');
        sheet.cell(2, 6).value('17:00');
        sheet.cell(2, 7).value(3);
        sheet.cell(2, 8).value('LuMaMi');
        sheet.cell(2, 9).value(12);
        sheet.cell(2, 10).value('17');
        sheet.cell(2, 12).value('No');

        sheet.cell(3, 2).value('DOC001');
        sheet.cell(3, 3).value('Juan Pérez');
        sheet.cell(3, 4).value('IS101-2025');
        sheet.cell(3, 5).value('Ingeniería en Sistemas');
        sheet.cell(3, 6).value('17:00');
        sheet.cell(3, 7).value(4);
        sheet.cell(3, 8).value('LuMaMi');
        sheet.cell(3, 9).value(35);
        sheet.cell(3, 10).value('Edificio C, Aula 302');
        sheet.cell(3, 11).value('Centro Universitario Regional');
        sheet.cell(3, 12).value('Sí');
        sheet.cell(3, 13).value('Clase trasladada');

        sheet.cell(4, 2).value('DOC002');
        sheet.cell(4, 3).value('Ana Gómez');
        sheet.cell(4, 4).value('MAT-201');
        sheet.cell(4, 5).value('Matemáticas');
        sheet.cell(4, 6).value('15:00');
        sheet.cell(4, 7).value(3);
        sheet.cell(4, 8).value('MaJuVi');
        sheet.cell(4, 9).value(25);
        sheet.cell(4, 10).value('Edificio A, Aula 105');
        sheet.cell(4, 11).value('Centro Universitario Regional');
        sheet.cell(4, 12).value('No');
      });

      const result = await service.processFile(
        propertiesAcademicAssignment,
        buffer,
      );

      expect(result.title).toBe('');
      expect(result.subtitle).toBe('');
      expect(result.totalRecords).toBe(2);
      expect(result.data[0]).toMatchObject({
        teacherCode: 'DOC001',
        teacherName: 'Juan Pérez',
        courseCode: 'IS101-2025',
        courseName: 'Ingeniería en Sistemas',
        section: '17:00',
        uv: 4,
        days: 'LuMaMi',
        studentCount: 35,
        classroomName: 'Edificio C, Aula 302',
        center: 'Centro Universitario Regional',
        nearGraduation: true,
        observation: 'Clase trasladada',
      });
      expect(result.data[1]).toMatchObject({
        teacherCode: 'DOC002',
        teacherName: 'Ana Gómez',
        courseCode: 'MAT-201',
        courseName: 'Matemáticas',
        section: '15:00',
        uv: 3,
        days: 'MaJuVi',
        studentCount: 25,
        classroomName: 'Edificio A, Aula 105',
        nearGraduation: false,
      });
    });

    it('parses the coordinator file column order and ignores "Horario de trabajo"', async () => {
      const buffer = await buildWorkbookBuffer((sheet) => {
        COORDINATOR_HEADERS.forEach((header, index) =>
          sheet.cell(1, index + 1).value(header),
        );

        // Hora como valor numérico de Excel (0.70833... = 17:00)
        sheet.cell(2, 2).value('3332');
        sheet.cell(2, 3).value('HUGO RICARDO ALARCON WELL');
        sheet.cell(2, 4).value('IS-510');
        sheet.cell(2, 5).value('Instalaciones Eléctricas');
        sheet.cell(2, 6).value(0.7083333333333333);
        sheet.cell(2, 7).value(3);
        sheet.cell(2, 8).value('LuMaMi');
        sheet.cell(2, 9).value(12);
        sheet.cell(2, 10).value('17');
        sheet.cell(2, 11).value('Lunes a viernes de 17:00 a 21:00');
        sheet.cell(2, 13).value('Turno tarde');

        // Hora como texto con segundos
        sheet.cell(3, 2).value('7006');
        sheet.cell(3, 3).value('PEDRO ODAIR SAUCEDA GARCIA');
        sheet.cell(3, 4).value('IS914');
        sheet.cell(3, 5).value('Liderazgo para el cambio');
        sheet.cell(3, 6).value('15:00:00');
        sheet.cell(3, 7).value(3);
        sheet.cell(3, 8).value('LuMaMi');
        sheet.cell(3, 9).value(11);
        sheet.cell(3, 10).value('30');
      });

      const result = await service.processFile(
        propertiesAcademicAssignment,
        buffer,
      );

      expect(result.totalRecords).toBe(2);
      expect(result.data[0]).toMatchObject({
        teacherCode: '3332',
        teacherName: 'HUGO RICARDO ALARCON WELL',
        courseCode: 'IS-510',
        courseName: 'Instalaciones Eléctricas',
        section: '5:00 PM',
        uv: 3,
        days: 'LuMaMi',
        studentCount: 12,
        classroomName: '17',
        observation: 'Turno tarde',
      });
      expect(result.data[1]).toMatchObject({
        teacherCode: '7006',
        teacherName: 'PEDRO ODAIR SAUCEDA GARCIA',
        courseCode: 'IS914',
        courseName: 'Liderazgo para el cambio',
        section: '15:00:00',
        uv: 3,
        days: 'LuMaMi',
        studentCount: 11,
        classroomName: '30',
      });
    });

    it('detects the new format even when data rows fill row 4', async () => {
      const buffer = await buildWorkbookBuffer((sheet) => {
        TEMPLATE_HEADERS.forEach((header, index) =>
          sheet.cell(1, index + 1).value(header),
        );

        for (let row = 2; row <= 5; row++) {
          sheet.cell(row, 2).value(`DOC00${row - 1}`);
          sheet.cell(row, 3).value(`Docente ${row - 1}`);
          sheet.cell(row, 4).value(`IS10${row - 1}-2025`);
          sheet.cell(row, 7).value(4);
        }
      });

      const result = await service.processFile(
        propertiesAcademicAssignment,
        buffer,
      );

      expect(result.title).toBe('');
      expect(result.subtitle).toBe('');
      expect(result.totalRecords).toBe(4);
      expect(result.data[0]).toMatchObject({ teacherCode: 'DOC001' });
      expect(result.data[3]).toMatchObject({ teacherCode: 'DOC004' });
    });
  });

  describe('generateTemplate', () => {
    it('generates a template with an example row that is skipped when parsed', async () => {
      const buffer = await service.generateTemplate(TEMPLATE_HEADERS, 5, [
        '',
        '3332',
        'HUGO RICARDO ALARCON WELL',
        'IS-510',
        'Instalaciones Eléctricas',
        '17:00',
        '3',
        'LuMaMi',
        '12',
        '17',
        '',
        'No',
        '',
      ]);

      const result = await service.processFile(
        propertiesAcademicAssignment,
        buffer,
      );

      // Solo hay fila de ejemplo (omitida), por lo tanto no debe haber registros.
      expect(result.totalRecords).toBe(0);
    });
  });
});
