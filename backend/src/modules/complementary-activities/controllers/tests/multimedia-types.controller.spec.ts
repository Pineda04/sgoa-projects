import { Test, TestingModule } from '@nestjs/testing';
import { MultimediaTypesController } from '../multimedia-types.controller';
import { MultimediaTypesService } from '../../services/multimedia-types.service';

describe('MultimediaTypesController', () => {
  let controller: MultimediaTypesController;

  const mockMultimediaTypesService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MultimediaTypesController],
      providers: [MultimediaTypesService],
    })
      .overrideProvider(MultimediaTypesService)
      .useValue(mockMultimediaTypesService)
      .compile();

    controller = module.get<MultimediaTypesController>(
      MultimediaTypesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
