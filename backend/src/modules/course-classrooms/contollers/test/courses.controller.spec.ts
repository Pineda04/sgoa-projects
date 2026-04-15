import { Test, TestingModule } from '@nestjs/testing';
import { CoursesController } from '../courses.controller';
import { CoursesService } from '../../services/courses.service';

describe('CoursesController', () => {
  let controller: CoursesController;

  const mockCoursesService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [CoursesService],
    })
      .overrideProvider(CoursesService)
      .useValue(mockCoursesService)
      .compile();

    controller = module.get<CoursesController>(CoursesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
