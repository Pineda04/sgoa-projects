import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from '../courses.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryPaginationDto } from 'src/common/dto';

describe('CoursesService', () => {
  let service: CoursesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    course: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
    prisma = module.get<PrismaService>(PrismaService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findBySearchTerm', () => {
    const mockQuery: QueryPaginationDto = { page: '1', size: '10' };
    const searchTerm = 'test';

    beforeEach(() => {
      mockPrismaService.course.findMany.mockResolvedValue([]);
      mockPrismaService.course.count.mockResolvedValue(0);
    });

    it('should include activeStatus: true in where clause when activeStatus is true', async () => {
      await service.findBySearchTerm(searchTerm, mockQuery, undefined, true);

      expect(prisma.course.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            activeStatus: true,
          }),
        }),
      );
    });

    it('should include activeStatus: false in where clause when activeStatus is false', async () => {
      await service.findBySearchTerm(searchTerm, mockQuery, undefined, false);

      expect(prisma.course.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            activeStatus: false,
          }),
        }),
      );
    });

    it('should not include activeStatus in where clause when activeStatus is undefined', async () => {
      await service.findBySearchTerm(searchTerm, mockQuery, undefined, undefined);

      const callArgs = mockPrismaService.course.findMany.mock.calls[0][0];
      expect(callArgs.where).not.toHaveProperty('activeStatus');
    });

    it('should include centerDepartmentId filter when provided', async () => {
      const centerDepartmentId = '123e4567-e89b-12d3-a456-426614174000';
      await service.findBySearchTerm(searchTerm, mockQuery, centerDepartmentId, true);

      expect(prisma.course.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            department: {
              centers: {
                some: {
                  id: centerDepartmentId,
                },
              },
            },
            activeStatus: true,
          }),
        }),
      );
    });

    it('should apply search term to both code and name fields', async () => {
      await service.findBySearchTerm(searchTerm, mockQuery, undefined, undefined);

      const callArgs = mockPrismaService.course.findMany.mock.calls[0][0];
      expect(callArgs.where.OR).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: { contains: searchTerm.replace(/-/g, ''), mode: 'insensitive' },
          }),
          expect.objectContaining({
            name: { contains: searchTerm, mode: 'insensitive' },
          }),
        ]),
      );
    });
  });
});
