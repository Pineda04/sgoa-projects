import { Test, TestingModule } from '@nestjs/testing';
import { AirConditionersService } from '../air-conditioners.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('AirConditionersService', () => {
  let service: AirConditionersService;

  const mockPrismaService = {
    airConditioners: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AirConditionersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AirConditionersService>(AirConditionersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
