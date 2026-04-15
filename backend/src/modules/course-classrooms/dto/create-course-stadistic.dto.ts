import { IsNotEmpty, IsInt, IsUUID } from 'class-validator';
import { ValidatorConstraintDecorator } from 'src/common/decorators';
import { ECourseClassroomConfig } from '../enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidClassroomConfigConstraint } from '../validators';

export class CreateCourseStadisticDto {
  @ApiProperty({ description: 'Cantidad de APB.', example: 10, required: true })
  @IsInt({ message: 'La propiedad <APB> debe ser un número entero.' })
  @IsNotEmpty({ message: 'La propiedad <APB> no debe estar vacía.' })
  APB: number = 0;

  @ApiProperty({ description: 'Cantidad de RPB.', example: 5, required: true })
  @IsInt({ message: 'La propiedad <RPB> debe ser un número entero.' })
  @IsNotEmpty({ message: 'La propiedad <RPB> no debe estar vacía.' })
  RPB: number = 0;

  @ApiProperty({ description: 'Cantidad de NSP.', example: 3, required: true })
  @IsInt({ message: 'La propiedad <NSP> debe ser un número entero.' })
  @IsNotEmpty({ message: 'La propiedad <NSP> no debe estar vacía.' })
  NSP: number = 0;

  @ApiProperty({ description: 'Cantidad de ABD.', example: 2, required: true })
  @IsInt({ message: 'La propiedad <ABD> debe ser un número entero.' })
  @IsNotEmpty({ message: 'La propiedad <ABD> no debe estar vacía.' })
  ABD: number = 0;

  @ApiProperty({
    description: 'UUID de la sección de curso.',
    example: 'd4e5f6a1-b2c3-7890-abcd-1234567890ab',
    required: true,
  })
  @IsUUID('all', {
    each: true,
    message: 'La propiedad <courseClassroomId> debe ser un UUID válido.',
  })
  @IsNotEmpty({
    message: 'La propiedad <courseClassroomId> no debe estar vacía.',
  })
  @ValidatorConstraintDecorator(
    ECourseClassroomConfig.COURSE_CLASSROOM,
    IsValidClassroomConfigConstraint,
  )
  courseClassroomId: string;
}
