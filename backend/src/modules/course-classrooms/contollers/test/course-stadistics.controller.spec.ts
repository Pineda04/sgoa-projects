import { Test, TestingModule } from '@nestjs/testing';
import { CourseStadisticsController } from '../course-stadistics.controller';
import { CourseStadisticsService } from '../../services/course-stadistics.service';

describe('CourseStadisticsController', () => {
  let controller: CourseStadisticsController;

  const mockCourseStadisticsService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseStadisticsController],
      providers: [CourseStadisticsService],
    })
      .overrideProvider(CourseStadisticsService)
      .useValue(mockCourseStadisticsService)
      .compile();

    controller = module.get<CourseStadisticsController>(
      CourseStadisticsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
