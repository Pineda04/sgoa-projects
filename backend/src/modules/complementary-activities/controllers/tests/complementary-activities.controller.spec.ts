import { Test, TestingModule } from '@nestjs/testing';
import { ComplementaryActivitiesController } from '../complementary-activities.controller';
import { ComplementaryActivitiesService } from '../../services/complementary-activities.service';

describe('ComplementaryActivitiesController', () => {
  let controller: ComplementaryActivitiesController;

  const mockComplementaryActivitiesService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComplementaryActivitiesController],
      providers: [ComplementaryActivitiesService],
    })
      .overrideProvider(ComplementaryActivitiesService)
      .useValue(mockComplementaryActivitiesService)
      .compile();

    controller = module.get<ComplementaryActivitiesController>(
      ComplementaryActivitiesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
