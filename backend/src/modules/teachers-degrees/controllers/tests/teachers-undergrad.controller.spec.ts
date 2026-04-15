import { Test, TestingModule } from '@nestjs/testing';
import { TeachersUndergradController } from '../teachers-undergrad.controller';
import { TeachersUndergradService } from '../../services/teachers-undergrad.service';

describe('TeachersUndergradController', () => {
  let controller: TeachersUndergradController;

  const mockTeachersUndergradService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeachersUndergradController],
      providers: [TeachersUndergradService],
    })
      .overrideProvider(TeachersUndergradService)
      .useValue(mockTeachersUndergradService)
      .compile();

    controller = module.get<TeachersUndergradController>(TeachersUndergradController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
