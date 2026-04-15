import { Test, TestingModule } from '@nestjs/testing';
import { VerificationMediasService } from '../verification-medias.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/modules/cloudinary/services/cloudinary.service';
import { ComplementaryActivitiesService } from '../complementary-activities.service';
import { MultimediaTypesService } from '../multimedia-types.service';
import { ActivityTypesService } from '../activity-types.service';

describe('VerificationMediasService', () => {
  let service: VerificationMediasService;

  const mockPrismaService = {
    verificationMedias: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerificationMediasService,
        MultimediaTypesService,
        CloudinaryService,
        ComplementaryActivitiesService,
        ActivityTypesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<VerificationMediasService>(VerificationMediasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
