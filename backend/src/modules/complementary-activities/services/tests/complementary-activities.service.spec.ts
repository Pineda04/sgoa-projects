import { Test, TestingModule } from '@nestjs/testing';
import { ComplementaryActivitiesService } from '../complementary-activities.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/modules/cloudinary/services/cloudinary.service';
import { ActivityTypesService } from '../activity-types.service';
import { VerificationMediasService } from '../verification-medias.service';
import { MultimediaTypesService } from '../multimedia-types.service';

describe('ComplementaryActivitiesService', () => {
  let service: ComplementaryActivitiesService;

  const mockPrismaService = {
    complementaryActivities: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplementaryActivitiesService,
        ActivityTypesService,
        CloudinaryService,
        VerificationMediasService,
        MultimediaTypesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ComplementaryActivitiesService>(
      ComplementaryActivitiesService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
