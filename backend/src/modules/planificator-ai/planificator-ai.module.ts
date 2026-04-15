import { Module } from '@nestjs/common';
import { PlanificatorAiService } from './services/planificator-ai.service';
import { PlanificatorAiController } from './controllers/planificator-ai.controller';
import { HttpModule } from '@nestjs/axios';
import { TeachersModule } from '../teachers/teachers.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule, HttpModule, TeachersModule],
  controllers: [PlanificatorAiController],
  providers: [PlanificatorAiService],
})
export class PlanificatorAiModule {}
