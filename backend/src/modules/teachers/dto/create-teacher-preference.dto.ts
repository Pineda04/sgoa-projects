import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsArray, ArrayMaxSize } from 'class-validator';

export class CreateTeacherPreferenceDto {
  @ApiProperty({
    description: 'ID del docente a agregar las preferencias.',
    example: '65039ef6-1fc5-474c-b4e3-27239c200138',
    required: true,
  })
  @IsUUID('all', {
    each: true,
    message: 'La propiedad <teacherId> debe ser un UUID válido.',
  })
  @IsNotEmpty({
    message: 'La propiedad <teacherId> no debe estar vacía.',
  })
  teacherId: string;

  @ApiProperty({
    description: 'Clases de preferencia del docente (máximo 5).',
    type: 'array',
    items: { type: 'string', format: 'uuid' },
    maxItems: 5,
    required: true,
    nullable: false,
    example: [
      'a5854c2b-6547-4109-9208-97ee4cc64555',
      '748e42de-4125-4acd-b551-a9cbdd422dc9',
    ],
  })
  @IsArray({
    message:
      'Las preferencias de clases deben mandarse en un arreglo con los IDs de las clases.',
  })
  @ArrayMaxSize(5, { message: 'Solo se permiten máximo 5 clases.' })
  @IsUUID('all', { each: true, message: 'Cada clase debe ser un UUID válido.' })
  @IsNotEmpty({
    message: 'El docente debe elegir al menos una clase de preferencia.',
  })
  preferredClasses: string[];
}
