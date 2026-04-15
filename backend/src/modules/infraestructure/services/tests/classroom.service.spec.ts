import { Test, TestingModule } from '@nestjs/testing';
import { ClassroomService } from '../classroom.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('ClassroomService', () => {
  let service: ClassroomService;

  const mockPrismaService = {
    classroom: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassroomService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ClassroomService>(ClassroomService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
