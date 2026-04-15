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
});
