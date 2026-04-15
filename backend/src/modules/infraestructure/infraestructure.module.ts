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
import { ClassroomService } from './services/classroom.service';
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
  ],
  providers: [
    BuildingService,
    ClassroomService,
    RoomTypeService,
    ConnectivityService,
    AudioEquipmentService,
    IsValidIdsClassroomConfigConstraint,
  ],
  exports: [
    BuildingService,
    ClassroomService,
    RoomTypeService,
    ConnectivityService,
    AudioEquipmentService,
  ],
})
export class InfraestructureModule {}
