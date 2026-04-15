import { Test, TestingModule } from '@nestjs/testing';
import { PcTypesController } from '../pc-types.controller';
import { PcTypesService } from '../../services/pc-types.service';

describe('PcTypesController', () => {
  let controller: PcTypesController;

  const mockPcTypesService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PcTypesController],
      providers: [PcTypesService],
    })
      .overrideProvider(PcTypesService)
      .useValue(mockPcTypesService)
      .compile();

    controller = module.get<PcTypesController>(PcTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
