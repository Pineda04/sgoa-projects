import { Test, TestingModule } from '@nestjs/testing';
import { ExcelFilesService } from '../excel-files.service';

import { PrismaService } from 'src/prisma/prisma.service';
import {
  TAcademicAssignment,
  AcademicAssignmentDto,
} from 'src/modules/teaching-assignment/dto';

describe('ExcelFilesService', () => {
  let service: ExcelFilesService<TAcademicAssignment, AcademicAssignmentDto>;

  // const mockPrismaService = {
  //   excelFiles: {
  //     findUnique: jest.fn(),
  //     findMany: jest.fn(),
  //     update: jest.fn(),
  //     create: jest.fn(),
  //   },
  // };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExcelFilesService,
        // { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service =
      module.get<ExcelFilesService<TAcademicAssignment, AcademicAssignmentDto>>(
        ExcelFilesService,
      );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('studentCount conversion', () => {
    const convertStudentCount = (value: string, rawValue?: number | string) =>
      (service as any).convertValue(value, 8, rawValue);

    it('preserves an empty cell as null', () => {
      expect(convertStudentCount('')).toBeNull();
    });

    it('preserves an explicit zero as zero', () => {
      expect(convertStudentCount('0', 0)).toBe(0);
    });

    it.each(['12.5', '12 estudiantes', 'sin dato'])(
      'leaves invalid value %s for assignment validation',
      (value) => {
        expect(convertStudentCount(value, value)).toBe(value);
      },
    );
  });
});
