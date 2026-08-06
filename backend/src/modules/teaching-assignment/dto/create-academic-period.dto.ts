import {
  IsInt,
  Min,
  Max,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { EModality } from '../enums';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAcademicPeriodDto {
  @ApiProperty({
    description: 'Año del periodo académico.',
    example: 2025,
    required: true,
  })
  @IsInt({ message: 'La propiedad <year> debe ser un número entero.' })
  @Min(2000, { message: 'La propiedad <year> debe ser mayor o igual a 2000.' })
  @Max(2500, { message: 'La propiedad <year> debe ser menor o igual a 2500.' })
  @IsNotEmpty({ message: 'La propiedad <year> no debe estar vacía.' })
  year: number;

  @ApiProperty({
    description: 'Fecha de inicio del periodo académico.',
    example: '2025-01-01',
    required: true,
  })

  // Quiza necesite mas limites a futuro...
  @IsDateString(
    {},
    { message: 'La propiedad <startDate> debe ser una fecha válida.' },
  )
  @IsNotEmpty({ message: 'La propiedad <startDate> no debe estar vacía.' })
  startDate: string;

  @ApiProperty({
    description: 'Fecha de fin del periodo académico.',
    example: '2025-04-30',
    required: true,
  })
  @IsDateString(
    {},
    { message: 'La propiedad <endDate> debe ser una fecha válida.' },
  )
  @IsNotEmpty({ message: 'La propiedad <endDate> no debe estar vacía.' })
  endDate: string;

  @ApiProperty({
    description: 'Número del periodo académico (PAC).',
    example: 1,
    required: true,
  })
  @IsInt({ message: 'La propiedad <pac> debe ser un número entero.' })
  @Min(1, { message: 'La propiedad <pac> debe ser mayor o igual a 1.' })
  @Max(3, { message: 'La propiedad <pac> debe ser menor o igual a 3.' })
  @IsNotEmpty({ message: 'La propiedad <pac> no debe estar vacía.' })
  pac: number;

  @ApiProperty({
    description: 'Modalidad del periodo académico.',
    example: EModality.TRIMESTRE,
    enum: EModality,
    required: true,
  })
  @IsString({
    message: 'La propiedad <pac_modality> debe ser una cadena de texto.',
  })
  @IsEnum(EModality, {
    message: `La modalidad debe ser uno de los siguientes: ${Object.values(EModality).join(', ')}`,
  })
  @IsNotEmpty({ message: 'La propiedad <pac_modality> no debe estar vacía.' })
  pac_modality: string;
}
