import { Test, TestingModule } from '@nestjs/testing';
import { BuildingController } from '../building.controller';
import { BuildingService } from '../../services/building.service';

describe('BuildingsController', () => {
  let controller: BuildingController;

  const mockBuildingService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BuildingController],
      providers: [BuildingService],
    })
      .overrideProvider(BuildingService)
      .useValue(mockBuildingService)
      .compile();

    controller = module.get<BuildingController>(BuildingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
