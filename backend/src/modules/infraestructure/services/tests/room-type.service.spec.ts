import { Test, TestingModule } from '@nestjs/testing';
import { RoomTypeService } from '../room-type.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('RoomTypeService', () => {
  let service: RoomTypeService;

  const mockPrismaService = {
    roomType: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomTypeService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<RoomTypeService>(RoomTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
