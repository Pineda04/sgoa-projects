import { Test, TestingModule } from '@nestjs/testing';
import { AudioEquipmentService } from '../audio-equipment.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('AudioEquipmentService', () => {
  let service: AudioEquipmentService;

  const mockPrismaService = {
    audioEquipment: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AudioEquipmentService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AudioEquipmentService>(AudioEquipmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
