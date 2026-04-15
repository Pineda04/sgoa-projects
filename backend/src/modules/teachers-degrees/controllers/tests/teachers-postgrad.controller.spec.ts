import { Test, TestingModule } from '@nestjs/testing';
import { TeachersPostgradController } from '../teachers-postgrad.controller';
import { TeachersPostgradService } from '../../services/teachers-postgrad.service';

describe('TeachersPostgradController', () => {
  let controller: TeachersPostgradController;

  const mockTeachersPostgradService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeachersPostgradController],
      providers: [TeachersPostgradService],
    })
      .overrideProvider(TeachersPostgradService)
      .useValue(mockTeachersPostgradService)
      .compile();

    controller = module.get<TeachersPostgradController>(
      TeachersPostgradController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
