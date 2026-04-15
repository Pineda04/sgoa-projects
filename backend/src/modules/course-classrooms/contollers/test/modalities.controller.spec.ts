import { Test, TestingModule } from '@nestjs/testing';
import { ModalitiesController } from '../modalities.controller';
import { ModalitiesService } from '../../services/modalities.service';

describe('ModalitiesController', () => {
  let controller: ModalitiesController;

  const mockModalitiesService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModalitiesController],
      providers: [ModalitiesService],
    })
      .overrideProvider(ModalitiesService)
      .useValue(mockModalitiesService)
      .compile();

    controller = module.get<ModalitiesController>(ModalitiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
