import { Test, TestingModule } from '@nestjs/testing';
import { AirConditionersController } from '../air-conditioners.controller';
import { AirConditionersService } from '../../services/air-conditioners.service';

describe('AirConditionersController', () => {
  let controller: AirConditionersController;

  const mockAirConditionersService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AirConditionersController],
      providers: [AirConditionersService],
    })
      .overrideProvider(AirConditionersService)
      .useValue(mockAirConditionersService)
      .compile();

    controller = module.get<AirConditionersController>(
      AirConditionersController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
