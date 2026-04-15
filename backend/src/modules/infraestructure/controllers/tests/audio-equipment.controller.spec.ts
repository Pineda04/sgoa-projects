import { Test, TestingModule } from '@nestjs/testing';
import { AudioEquipmentController } from '../audio-equipment.controller';
import { AudioEquipmentService } from '../../services/audio-equipment.service';

describe('AudioEquipmentController', () => {
  let controller: AudioEquipmentController;

  const mockAudioEquipmentService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AudioEquipmentController],
      providers: [AudioEquipmentService],
    })
      .overrideProvider(AudioEquipmentService)
      .useValue(mockAudioEquipmentService)
      .compile();

    controller = module.get<AudioEquipmentController>(AudioEquipmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
