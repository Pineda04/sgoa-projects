import { Test, TestingModule } from '@nestjs/testing';
import { ConnectivityController } from '../connectivity.controller';
import { ConnectivityService } from '../../services/connectivity.service';

describe('ConnectivityController', () => {
  let controller: ConnectivityController;

  const mockConnectivityService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConnectivityController],
      providers: [ConnectivityService],
    })
      .overrideProvider(ConnectivityService)
      .useValue(mockConnectivityService)
      .compile();

    controller = module.get<ConnectivityController>(ConnectivityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
