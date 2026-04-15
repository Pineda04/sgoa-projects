import { PartialType } from '@nestjs/swagger';
import { CreateAcademicAssignmentReportDto } from './create-academic-assignment-report.dto';

export class UpdateAcademicAssignmentReportDto extends PartialType(
  CreateAcademicAssignmentReportDto,
) {}
