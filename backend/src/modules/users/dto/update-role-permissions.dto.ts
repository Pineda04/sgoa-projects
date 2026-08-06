import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class UpdateRolePermissionsDto {
  @ApiProperty({
    description:
      'IDs de los permisos que tendrá el rol (reemplaza el set actual).',
    example: ['b3f1...', 'c4a2...'],
    required: true,
  })
  @IsArray({ message: 'Los permisos deben enviarse en un arreglo.' })
  @IsString({
    each: true,
    message: 'Cada permissionId debe ser una cadena de texto.',
  })
  permissionIds: string[];
}
