import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AirConditionersController } from './contollers/air-conditioners.controller';
import { BrandsController } from './contollers/brands.controller';
import { ConditionsController } from './contollers/conditions.controller';
import { MonitorSizesController } from './contollers/monitor-sizes.controller';
import { MonitorTypesController } from './contollers/monitor-types.controller';
import { PcEquipmentsController } from './contollers/pc-equipments.controller';
import { PcTypesController } from './contollers/pc-types.controller';
import { AirConditionersService } from './services/air-conditioners.service';
import { BrandsService } from './services/brands.service';
import { ConditionsService } from './services/conditions.service';
import { MonitorSizesService } from './services/monitor-sizes.service';
import { MonitorTypesService } from './services/monitor-types.service';
import { PcEquipmentsService } from './services/pc-equipments.service';
import { PcTypesService } from './services/pc-types.service';
import { IsValidIdsInventoryConfigConstraint } from './validators';
import { InfraestructureModule } from '../infraestructure/infraestructure.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule, InfraestructureModule],
  providers: [
    BrandsService,
    ConditionsService,
    AirConditionersService,
    MonitorTypesService,
    MonitorSizesService,
    PcTypesService,
    PcEquipmentsService,
    IsValidIdsInventoryConfigConstraint,
  ],
  controllers: [
    BrandsController,
    ConditionsController,
    AirConditionersController,
    MonitorTypesController,
    MonitorSizesController,
    PcTypesController,
    PcEquipmentsController,
  ],
  exports: [
    BrandsService,
    ConditionsService,
    AirConditionersService,
    MonitorTypesService,
    MonitorSizesService,
    PcTypesService,
    PcEquipmentsService,
  ],
})
export class InventoryModule {}
