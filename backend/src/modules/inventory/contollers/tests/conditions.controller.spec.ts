import { Test, TestingModule } from '@nestjs/testing';
import { ConditionsController } from '../conditions.controller';
import { ConditionsService } from '../../services/conditions.service';

describe('ConditionsController', () => {
  let controller: ConditionsController;

  const mockConditionsService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConditionsController],
      providers: [ConditionsService],
    })
      .overrideProvider(ConditionsService)
      .useValue(mockConditionsService)
      .compile();

    controller = module.get<ConditionsController>(ConditionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
