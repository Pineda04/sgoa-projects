import { PartialType } from '@nestjs/swagger';
import { CreatePlanificatorAiDto } from './create-planificator-ai.dto';

export class UpdatePlanificatorAiDto extends PartialType(CreatePlanificatorAiDto) {}
