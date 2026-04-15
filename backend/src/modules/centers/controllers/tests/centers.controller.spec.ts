import { Test, TestingModule } from '@nestjs/testing';
import { CentersController } from '../centers.controller';
import { CentersService } from '../../services/centers.service';

describe('CentersController', () => {
  let controller: CentersController;

  const mockUserService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CentersController],
      providers: [CentersService],
    })
      .overrideProvider(CentersService)
      .useValue(mockUserService)
      .compile();

    controller = module.get<CentersController>(CentersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
