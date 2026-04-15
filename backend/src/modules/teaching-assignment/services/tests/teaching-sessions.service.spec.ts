import { Test, TestingModule } from '@nestjs/testing';
import { TeachingSessionsService } from '../teaching-sessions.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('TeachingSessionsService', () => {
  let service: TeachingSessionsService;

  const mockPrismaService = {
    teachingSessions: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeachingSessionsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TeachingSessionsService>(TeachingSessionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
