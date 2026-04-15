import { Test, TestingModule } from '@nestjs/testing';
import { MonitorTypesController } from '../monitor-types.controller';
import { MonitorTypesService } from '../../services/monitor-types.service';

describe('MonitorTypesController', () => {
  let controller: MonitorTypesController;

  const mockMonitorTypesService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonitorTypesController],
      providers: [MonitorTypesService],
    })
      .overrideProvider(MonitorTypesService)
      .useValue(mockMonitorTypesService)
      .compile();

    controller = module.get<MonitorTypesController>(MonitorTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
