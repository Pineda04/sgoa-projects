import { Test, TestingModule } from '@nestjs/testing';
import { UndergradsService } from '../undergrads.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('TeachersUndergradService', () => {
  let service: UndergradsService;

  const mockPrismaService = {
    undergrads: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UndergradsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UndergradsService>(UndergradsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
