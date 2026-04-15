import { Test, TestingModule } from '@nestjs/testing';
import { ConnectivityService } from '../connectivity.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('ConnectivityService', () => {
  let service: ConnectivityService;

  const mockPrismaService = {
    connectivity: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConnectivityService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ConnectivityService>(ConnectivityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
