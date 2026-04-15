import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentsController } from '../departments.controller';
import { DepartmentsService } from '../../services/departments.service';

describe('DepartmentsController', () => {
  let controller: DepartmentsController;

  const mockDepartmentsService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartmentsController],
      providers: [DepartmentsService],
    })
      .overrideProvider(DepartmentsService)
      .useValue(mockDepartmentsService)
      .compile();

    controller = module.get<DepartmentsController>(DepartmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
