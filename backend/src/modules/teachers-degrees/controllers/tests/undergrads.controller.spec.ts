import { Test, TestingModule } from '@nestjs/testing';
import { UndergradsController } from '../undergrads.controller';
import { UndergradsService } from '../../services/undergrads.service';

describe('TeachersUndergradController', () => {
  let controller: UndergradsController;

  const mockUndergradsService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UndergradsController],
      providers: [UndergradsService],
    })
      .overrideProvider(UndergradsService)
      .useValue(mockUndergradsService)
      .compile();

    controller = module.get<UndergradsController>(UndergradsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
