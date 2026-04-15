import { Test, TestingModule } from '@nestjs/testing';
import { MonitorSizesController } from '../monitor-sizes.controller';
import { MonitorSizesService } from '../../services/monitor-sizes.service';

describe('MonitorSizesController', () => {
  let controller: MonitorSizesController;

  const mockMonitorSizesService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonitorSizesController],
      providers: [MonitorSizesService],
    })
      .overrideProvider(MonitorSizesService)
      .useValue(mockMonitorSizesService)
      .compile();

    controller = module.get<MonitorSizesController>(MonitorSizesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
