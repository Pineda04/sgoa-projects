import { Test, TestingModule } from '@nestjs/testing';
import { VerificationMediasController } from '../verification-medias.controller';
import { VerificationMediasService } from '../../services/verification-medias.service';

describe('VerificationMediasController', () => {
  let controller: VerificationMediasController;

  const mockVerificationMediasService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VerificationMediasController],
      providers: [VerificationMediasService],
    })
      .overrideProvider(VerificationMediasService)
      .useValue(mockVerificationMediasService)
      .compile();

    controller = module.get<VerificationMediasController>(
      VerificationMediasController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
