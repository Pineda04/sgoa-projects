import { Test, TestingModule } from '@nestjs/testing';
import { TeacherDepartmentPositionService } from '../../services/teacher-department-position.service';
import { TeacherDepartmentPositionController } from '../teacher-department-position.controller';
import { CreateTeacherDepartmentPositionDto } from '../../dto/create-teacher-department-position.dto';
import { formatISO } from 'date-fns';

describe('TeacherDepartmentPositionController', () => {
  let controller: TeacherDepartmentPositionController;

  const mockTeacherDepartmentPositionService = {
    create: jest.fn((dto: CreateTeacherDepartmentPositionDto) => ({
      id: Date.now().toString(),
      ...dto,
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeacherDepartmentPositionController],
      providers: [TeacherDepartmentPositionService],
    })
      .overrideProvider(TeacherDepartmentPositionService)
      .useValue(mockTeacherDepartmentPositionService)
      .compile();

    controller = module.get<TeacherDepartmentPositionController>(
      TeacherDepartmentPositionController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('/teacher-department-positions (POST)', () => {
    const dto: CreateTeacherDepartmentPositionDto = {
      userId: '8f7ec0c7-0e19-48f6-98e7-99db8b4bd9e2',
      centerDepartmentId: 'fd53d980-b5f4-4f77-9088-363d7b2d4c25',
      positionId: '758e38c5-be0e-484f-9089-22f9931385cd',
      startDate: formatISO(new Date().toISOString()),
    };

    expect(controller.create(dto)).toEqual({
      id: expect.any(String),
      ...dto,
    });

    expect(mockTeacherDepartmentPositionService.create).toHaveBeenCalledWith(
      dto,
    );
  });
});
