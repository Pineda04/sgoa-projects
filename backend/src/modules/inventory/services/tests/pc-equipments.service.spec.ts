import { Test, TestingModule } from '@nestjs/testing';
import { PcEquipmentsService } from '../pc-equipments.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('PcEquipmentsService', () => {
  let service: PcEquipmentsService;

  const mockPrismaService = {
    pcEquipments: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PcEquipmentsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PcEquipmentsService>(PcEquipmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
