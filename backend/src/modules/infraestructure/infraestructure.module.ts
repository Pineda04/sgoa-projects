import { Module } from '@nestjs/common';
import { BuildingController } from './controllers/building.controller';
import { BuildingService } from './services/building.service';
import { RoomTypeController } from './controllers/room-type.controller';
import { RoomTypeService } from './services/room-type.service';
import { AudioEquipmentController } from './controllers/audio-equipment.controller';
import { ConnectivityController } from './controllers/connectivity.controller';
import { AudioEquipmentService } from './services/audio-equipment.service';
import { ConnectivityService } from './services/connectivity.service';
import { ClassroomController } from './controllers/classroom.controller';
import { DigitalBlackboardController } from './controllers/digital-blackboard.controller';
import { ClassroomService } from './services/classroom.service';
import { DigitalBlackboardService } from './services/digital-blackboard.service';
import { IsValidIdsClassroomConfigConstraint } from './validators';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    BuildingController,
    ClassroomController,
    RoomTypeController,
    ConnectivityController,
    AudioEquipmentController,
    DigitalBlackboardController,
  ],
  providers: [
    BuildingService,
    ClassroomService,
    RoomTypeService,
    ConnectivityService,
    AudioEquipmentService,
    DigitalBlackboardService,
    IsValidIdsClassroomConfigConstraint,
  ],
  exports: [
    BuildingService,
    ClassroomService,
    RoomTypeService,
    ConnectivityService,
    AudioEquipmentService,
    DigitalBlackboardService,
  ],
})
export class InfraestructureModule {}
