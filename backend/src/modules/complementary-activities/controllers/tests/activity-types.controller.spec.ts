import { Test, TestingModule } from '@nestjs/testing';
import { ActivityTypesController } from '../activity-types.controller';
import { ActivityTypesService } from '../../services/activity-types.service';

describe('ActivityTypesController', () => {
  let controller: ActivityTypesController;

  const mockActivityTypesService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityTypesController],
      providers: [ActivityTypesService],
    })
      .overrideProvider(ActivityTypesService)
      .useValue(mockActivityTypesService)
      .compile();

    controller = module.get<ActivityTypesController>(ActivityTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
