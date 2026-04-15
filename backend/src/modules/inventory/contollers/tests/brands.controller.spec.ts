import { Test, TestingModule } from '@nestjs/testing';
import { BrandsController } from '../brands.controller';
import { BrandsService } from '../../services/brands.service';

describe('BrandsController', () => {
  let controller: BrandsController;

  const mockBrandsService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrandsController],
      providers: [BrandsService],
    })
      .overrideProvider(BrandsService)
      .useValue(mockBrandsService)
      .compile();

    controller = module.get<BrandsController>(BrandsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
