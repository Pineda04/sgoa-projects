import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentReportsController } from '../academic-assignment-reports.controller';
import { AcademicAssignmentReportsService } from '../../services/academic-assignment-reports.service';
import { ExcelFilesService } from 'src/modules/excel-files/services/excel-files.service';

describe('AcademicAssignmentReportsController', () => {
  let controller: AssignmentReportsController;

  const mockAcademicAssignmentReportsService = {};
  const mockExcelFilesService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssignmentReportsController],
      providers: [AcademicAssignmentReportsService, ExcelFilesService],
    })
      .overrideProvider(AcademicAssignmentReportsService)
      .useValue(mockAcademicAssignmentReportsService)
      .overrideProvider(ExcelFilesService)
      .useValue(mockExcelFilesService)
      .compile();

    controller = module.get<AssignmentReportsController>(
      AssignmentReportsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
