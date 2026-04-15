import { Test, TestingModule } from '@nestjs/testing';
import { TeachingSessionsController } from '../teaching-sessions.controller';
import { TeachingSessionsService } from '../../services/teaching-sessions.service';

describe('TeachingSessionsController', () => {
  let controller: TeachingSessionsController;

  const mockTeachingSessionsService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeachingSessionsController],
      providers: [TeachingSessionsService],
    })
      .overrideProvider(TeachingSessionsService)
      .useValue(mockTeachingSessionsService)
      .compile();

    controller = module.get<TeachingSessionsController>(
      TeachingSessionsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
