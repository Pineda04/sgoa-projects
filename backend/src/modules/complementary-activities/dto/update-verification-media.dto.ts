import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateVerificationMediaDto } from './create-verification-media.dto';
import { IsOptional, IsString, Length, ValidateIf } from 'class-validator';

export class UpdateVerificationMediaDto extends PartialType(
  CreateVerificationMediaDto,
) {}

export class UpdateVerificationMediaWithFilesDto {
  @ValidateIf(
    (vm: UpdateVerificationMediaWithFilesDto) =>
      typeof vm.description === 'string',
  )
  @ApiProperty({
    description: 'Descripción del medio de verificación.',
    example: 'Foto de la actividad...',
    required: false,
    oneOf: [
      {
        type: 'string',
      },
      {
        type: 'undefined',
      },
    ],
  })
  @IsString({
    message: 'La propiedad <description> debe ser una cadena de texto.',
  })
  @Length(3, 250, {
    message: 'La propiedad <description> debe tener entre 3 y 250 caracteres.',
  })
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Archivos a adjuntar, opcional y múltiples (solamente 5).',
    type: 'array',
    items: { type: 'string', format: 'binary' },
    maxItems: 5,
    required: false,
    nullable: true,
  })
  files: Express.Multer.File[];
}
