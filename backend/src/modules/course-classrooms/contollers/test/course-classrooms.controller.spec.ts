import { Test, TestingModule } from '@nestjs/testing';
import { CourseClassroomsService } from '../../services/course-classrooms.service';
import { CourseClassroomsController } from '../course-classrooms.controller';

describe('CourseClassroomsController', () => {
  let controller: CourseClassroomsController;

  const mockCourseClassroomsService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseClassroomsController],
      providers: [CourseClassroomsService],
    })
      .overrideProvider(CourseClassroomsService)
      .useValue(mockCourseClassroomsService)
      .compile();

    controller = module.get<CourseClassroomsController>(
      CourseClassroomsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
