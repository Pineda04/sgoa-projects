import { Test, TestingModule } from '@nestjs/testing';
import { TeachersController } from '../teachers.controller';
import { TeachersService } from '../../services/teachers.service';
import { TeacherDepartmentPositionService } from '../../services/teacher-department-position.service';
import { CreateTeacherDto } from '../../dto/create-teacher.dto';

describe('TeachersController', () => {
  let controller: TeachersController;

  const mockTeachersService = {
    create: jest.fn((dto: CreateTeacherDto) => ({
      id: Date.now().toString(),
      ...dto,
    })),
  };
  const mockTeacherDepartmentPositionService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeachersController],
      providers: [TeachersService, TeacherDepartmentPositionService],
    })
      .overrideProvider(TeachersService)
      .useValue(mockTeachersService)
      .overrideProvider(TeacherDepartmentPositionService)
      .useValue(mockTeacherDepartmentPositionService)
      .compile();

    controller = module.get<TeachersController>(TeachersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('/teachers (POST) ', () => {
    const dto: CreateTeacherDto = {
      undergradId: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
      postgradId: 'b2c3d4e5-f6a1-7890-abcd-1234567890ab',
      categoryId: 'c3d4e5f6-a1b2-7890-abcd-1234567890ab',
      contractTypeId: 'd4e5f6a1-b2c3-7890-abcd-1234567890ab',
      shiftId: 'e5f6a1b2-c3d4-7890-abcd-1234567890ab',
      userId: 'f6a1b2c3-d4e5-7890-abcd-1234567890ab',
      centerDepartmentId: '65039ef6-1fc5-474c-b4e3-27239c200138',
      positionId: 'g7h8i9j0-k1l2-7890-abcd-1234567890ab',
      shiftStart: '11:00',
      shiftEnd: '17:00',
    };

    expect(controller.create(dto)).toEqual({
      id: expect.any(String),
      ...dto,
    });

    expect(mockTeachersService.create).toHaveBeenCalledWith(dto);
  });
});
