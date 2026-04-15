import { Test, TestingModule } from '@nestjs/testing';
import { TeacherCategoriesController } from '../teacher-categories.controller';
import { TeacherCategoriesService } from '../../services/teacher-categories.service';

describe('TeacherCategoriesController', () => {
  let controller: TeacherCategoriesController;

  const mockTeacherCategoriesService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeacherCategoriesController],
      providers: [TeacherCategoriesService],
    })
      .overrideProvider(TeacherCategoriesService)
      .useValue(mockTeacherCategoriesService)
      .compile();

    controller = module.get<TeacherCategoriesController>(
      TeacherCategoriesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
