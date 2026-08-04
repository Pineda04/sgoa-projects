import { Test, TestingModule } from '@nestjs/testing';
import * as XlsxPopulate from 'xlsx-populate';
import { ExcelFilesService } from '../excel-files.service';

import { propertiesAcademicAssignment } from 'src/modules/teaching-assignment/dto/academic-assignment.dto';
import type {
  TAcademicAssignment,
  AcademicAssignmentDto,
} from 'src/modules/teaching-assignment/dto/academic-assignment.dto';

const TEMPLATE_HEADERS = [
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

        TEMPLATE_HEADERS.forEach((header, index) =>
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

    it('parses the new template format (headers row 1, data from row 2)', async () => {
      const buffer = await buildWorkbookBuffer((sheet) => {
        TEMPLATE_HEADERS.forEach((header, index) =>
          sheet.cell(1, index + 1).value(header),
        );

        sheet.cell(2, 2).value('DOC001');
        sheet.cell(2, 3).value('Juan Pérez');
        sheet.cell(2, 4).value('IS101-2025');
        sheet.cell(2, 5).value('Ingeniería en Sistemas');
        sheet.cell(2, 6).value(4);
        sheet.cell(2, 7).value('A1');
        sheet.cell(2, 8).value(35);
        sheet.cell(2, 9).value('LuMaMiVi');
        sheet.cell(2, 10).value('Centro Universitario Regional');
        sheet.cell(2, 11).value('Edificio C, Aula 302');
        sheet.cell(2, 12).value('Ingeniería en Sistemas');
        sheet.cell(2, 13).value('María López');
        sheet.cell(2, 14).value('Sí');
        sheet.cell(2, 15).value('Clase trasladada');

        sheet.cell(3, 2).value('DOC002');
        sheet.cell(3, 3).value('Ana Gómez');
        sheet.cell(3, 4).value('MAT-201');
        sheet.cell(3, 5).value('Matemáticas');
        sheet.cell(3, 6).value(3);
        sheet.cell(3, 7).value('B2');
        sheet.cell(3, 8).value(25);
        sheet.cell(3, 9).value('MaJuVi');
        sheet.cell(3, 10).value('Centro Universitario Regional');
        sheet.cell(3, 11).value('Edificio A, Aula 105');
        sheet.cell(3, 12).value('Ingeniería en Sistemas');
        sheet.cell(3, 13).value('María López');
        sheet.cell(3, 14).value('No');
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
        uv: 4,
        studentCount: 35,
      });
      expect(result.data[1]).toMatchObject({
        teacherCode: 'DOC002',
        teacherName: 'Ana Gómez',
        uv: 3,
        studentCount: 25,
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
          sheet.cell(row, 6).value(4);
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
});
