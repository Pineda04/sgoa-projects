import { Test, TestingModule } from '@nestjs/testing';
import { RoomTypeController } from '../room-type.controller';
import { RoomTypeService } from '../../services/room-type.service';

describe('RoomTypeController', () => {
  let controller: RoomTypeController;

  const mockRoomTypeService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomTypeController],
      providers: [RoomTypeService],
    })
      .overrideProvider(RoomTypeService)
      .useValue(mockRoomTypeService)
      .compile();

    controller = module.get<RoomTypeController>(RoomTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
