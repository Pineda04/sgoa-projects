import { Controller, Get, Post, Body } from '@nestjs/common';
import { PlanificatorAiService } from '../services/planificator-ai.service';
import { CreatePlanificatorAiDto } from '../dto/create-planificator-ai.dto';
import { GetCurrentUserId } from 'src/common/decorators';
import { TeacherDepartmentPositionService } from 'src/modules/teachers/services/teacher-department-position.service';

@Controller('planificator-ai')
export class PlanificatorAiController {
  constructor(
    private readonly planificatorAiService: PlanificatorAiService,
    private readonly teacherDepartmentPositionService: TeacherDepartmentPositionService,
  ) {}

  @Get()
  health() {
    return this.planificatorAiService.health();
  }

  @Post()
  async create(
    @Body() createPlanificatorAiDto: CreatePlanificatorAiDto,
    @GetCurrentUserId() userId: string,
  ) {
    // valida que el usuario sea jefe/coordinador en ese centerDepartment
    await this.teacherDepartmentPositionService.findOneDepartmentHeadByUserIdAndCenterDepartment(
      userId,
      createPlanificatorAiDto.centerDepartmentId,
    );

    return this.planificatorAiService.create(createPlanificatorAiDto);
  }
}
