import { Test, TestingModule } from '@nestjs/testing';
import { PositionsController } from '../positions.controller';
import { PositionsService } from '../../services/positions.service';

describe('PositionsController', () => {
  let controller: PositionsController;

  const mockPositionsService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PositionsController],
      providers: [PositionsService],
    })
      .overrideProvider(PositionsService)
      .useValue(mockPositionsService)
      .compile();

    controller = module.get<PositionsController>(PositionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
