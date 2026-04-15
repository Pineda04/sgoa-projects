import { Test, TestingModule } from '@nestjs/testing';
import { FacultiesController } from '../faculties.controller';
import { FacultiesService } from '../../services/faculties.service';

describe('FacultiesController', () => {
  let controller: FacultiesController;

  const mockFacultiesService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacultiesController],
      providers: [FacultiesService],
    })
      .overrideProvider(FacultiesService)
      .useValue(mockFacultiesService)
      .compile();

    controller = module.get<FacultiesController>(FacultiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
