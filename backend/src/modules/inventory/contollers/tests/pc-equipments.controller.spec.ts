import { Test, TestingModule } from '@nestjs/testing';
import { PcEquipmentsController } from '../pc-equipments.controller';
import { PcEquipmentsService } from '../../services/pc-equipments.service';

describe('PcEquipmentsController', () => {
  let controller: PcEquipmentsController;

  const mockPcEquipmentsService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PcEquipmentsController],
      providers: [PcEquipmentsService],
    })
      .overrideProvider(PcEquipmentsService)
      .useValue(mockPcEquipmentsService)
      .compile();

    controller = module.get<PcEquipmentsController>(PcEquipmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
