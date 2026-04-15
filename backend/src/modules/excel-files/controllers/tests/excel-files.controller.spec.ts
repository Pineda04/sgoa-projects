import { Test, TestingModule } from '@nestjs/testing';
import { ExcelFilesController } from '../excel-files.controller';
import { ExcelFilesService } from '../../services/excel-files.service';

describe('ExcelFilesController', () => {
  let controller: ExcelFilesController;

  const mockExcelFilesService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExcelFilesController],
      providers: [ExcelFilesService],
    })
      .overrideProvider(ExcelFilesService)
      .useValue(mockExcelFilesService)
      .compile();

    controller = module.get<ExcelFilesController>(ExcelFilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
