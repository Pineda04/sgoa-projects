import { Test, TestingModule } from '@nestjs/testing';
import { CoursesController } from '../courses.controller';
import { CoursesService } from '../../services/courses.service';
import { QueryPaginationDto } from 'src/common/dto';

describe('CoursesController', () => {
  let controller: CoursesController;
  let service: CoursesService;

  const mockCoursesService = {
    findBySearchTerm: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [CoursesService],
    })
      .overrideProvider(CoursesService)
      .useValue(mockCoursesService)
      .compile();

    controller = module.get<CoursesController>(CoursesController);
    service = module.get<CoursesService>(CoursesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findBySearchTerm', () => {
    const mockQuery: QueryPaginationDto = { page: '1', size: '10' };
    const searchTerm = 'test';

    it('should convert activeStatus "true" to boolean true', async () => {
      const activeStatus = 'true';
      await controller.findBySearchTerm(searchTerm, activeStatus, mockQuery);

      expect(service.findBySearchTerm).toHaveBeenCalledWith(
        searchTerm,
        mockQuery,
        undefined,
        true,
      );
    });

    it('should convert activeStatus "false" to boolean false', async () => {
      const activeStatus = 'false';
      await controller.findBySearchTerm(searchTerm, activeStatus, mockQuery);

      expect(service.findBySearchTerm).toHaveBeenCalledWith(
        searchTerm,
        mockQuery,
        undefined,
        false,
      );
    });

    it('should convert undefined activeStatus to undefined', async () => {
      await controller.findBySearchTerm(searchTerm, undefined, mockQuery);

      expect(service.findBySearchTerm).toHaveBeenCalledWith(
        searchTerm,
        mockQuery,
        undefined,
        undefined,
      );
    });

    it('should handle any other string value as false', async () => {
      const activeStatus = 'anything';
      await controller.findBySearchTerm(searchTerm, activeStatus, mockQuery);

      expect(service.findBySearchTerm).toHaveBeenCalledWith(
        searchTerm,
        mockQuery,
        undefined,
        false,
      );
    });
  });

  describe('findBySearchTermAndCenterDepartment', () => {
    const mockQuery: QueryPaginationDto = { page: '1', size: '10' };
    const searchTerm = 'test';
    const centerDepartmentId = '123e4567-e89b-12d3-a456-426614174000';

    it('should convert activeStatus "true" to boolean true', async () => {
      const activeStatus = 'true';
      await controller.findBySearchTermAndCenterDepartment(
        searchTerm,
        activeStatus,
        mockQuery,
        centerDepartmentId,
      );

      expect(service.findBySearchTerm).toHaveBeenCalledWith(
        searchTerm,
        mockQuery,
        centerDepartmentId,
        true,
      );
    });

    it('should convert activeStatus "false" to boolean false', async () => {
      const activeStatus = 'false';
      await controller.findBySearchTermAndCenterDepartment(
        searchTerm,
        activeStatus,
        mockQuery,
        centerDepartmentId,
      );

      expect(service.findBySearchTerm).toHaveBeenCalledWith(
        searchTerm,
        mockQuery,
        centerDepartmentId,
        false,
      );
    });

    it('should convert undefined activeStatus to undefined', async () => {
      await controller.findBySearchTermAndCenterDepartment(
        searchTerm,
        undefined,
        mockQuery,
        centerDepartmentId,
      );

      expect(service.findBySearchTerm).toHaveBeenCalledWith(
        searchTerm,
        mockQuery,
        centerDepartmentId,
        undefined,
      );
    });

    it('should propagate centerDepartmentId to service', async () => {
      const activeStatus = 'true';
      await controller.findBySearchTermAndCenterDepartment(
        searchTerm,
        activeStatus,
        mockQuery,
        centerDepartmentId,
      );

      expect(service.findBySearchTerm).toHaveBeenCalledWith(
        searchTerm,
        mockQuery,
        centerDepartmentId,
        true,
      );
    });
  });
});
