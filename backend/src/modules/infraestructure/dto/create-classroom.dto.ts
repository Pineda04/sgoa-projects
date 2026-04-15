import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsUUID,
  Length,
} from 'class-validator';
import { IsValidIdsClassroomConfigConstraint } from '../validators';
import { EClassroomConfig } from '../enums';
import { ValidatorConstraintDecorator } from 'src/common/decorators';
import { IsValidIdsInventoryConfigConstraint } from 'src/modules/inventory/validators';
import { EInventoryConfig } from 'src/modules/inventory/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClassroomDto {
  @ApiProperty({
    description: 'Nombre del aula.',
    example: 'Aula 101',
    required: true,
  })
  @IsString({
    message: 'La propiedad <name> debe ser una cadena de texto.',
  })
  @IsNotEmpty({ message: 'La propiedad <name> no debe estar vacía.' })
  @Length(1, 100, {
    message: 'La propiedad <name> debe tener entre 1 y 100 caracteres.',
  })
  name: string;

  @ApiProperty({
    description: 'Cantidad de escritorios.',
    example: 20,
    required: true,
  })
  @IsInt({ message: 'La propiedad <desks> debe ser un número entero.' })
  @IsNotEmpty({ message: 'La propiedad <desks> no debe estar vacía.' })
  desks: number;

  @ApiProperty({
    description: 'Cantidad de mesas.',
    example: 10,
    required: true,
  })
  @IsInt({ message: 'La propiedad <tables> debe ser un número entero.' })
  @IsNotEmpty({ message: 'La propiedad <tables> no debe estar vacía.' })
  tables: number;

  @ApiProperty({
    description: 'Cantidad de proyectores.',
    example: 2,
    required: true,
  })
  @IsInt({ message: 'La propiedad <projectors> debe ser un número entero.' })
  @IsNotEmpty({ message: 'La propiedad <projectors> no debe estar vacía.' })
  projectors: number;

  @ApiProperty({
    description: 'Cantidad de tomacorrientes.',
    example: 10,
    required: true,
  })
  @IsInt({ message: 'La propiedad <powerOutlets> debe ser un número entero.' })
  @IsNotEmpty({ message: 'La propiedad <powerOutlets> no debe estar vacía.' })
  powerOutlets: number;

  @ApiProperty({
    description: 'Cantidad de luces.',
    example: 8,
    required: true,
  })
  @IsInt({ message: 'La propiedad <lights> debe ser un número entero.' })
  @IsNotEmpty({ message: 'La propiedad <lights> no debe estar vacía.' })
  lights: number;

  @ApiProperty({
    description: 'Cantidad de pizarras.',
    example: 1,
    required: true,
  })
  @IsInt({ message: 'La propiedad <blackboards> debe ser un número entero.' })
  @IsNotEmpty({ message: 'La propiedad <blackboards> no debe estar vacía.' })
  blackboards: number;

  @ApiProperty({
    description: 'Cantidad de atriles.',
    example: 1,
    required: true,
  })
  @IsInt({ message: 'La propiedad <lecterns> debe ser un número entero.' })
  @IsNotEmpty({ message: 'La propiedad <lecterns> no debe estar vacía.' })
  lecterns: number;

  @ApiProperty({
    description: 'Cantidad de ventanas.',
    example: 4,
    required: true,
  })
  @IsInt({ message: 'La propiedad <windows> debe ser un número entero.' })
  @IsNotEmpty({ message: 'La propiedad <windows> no debe estar vacía.' })
  windows: number;

  @ApiProperty({
    description: 'ID del edificio al que pertenece el aula.',
    example: '65039ef6-1fc5-474c-b4e3-27239c200138',
    required: true,
  })
  @IsUUID('all', {
    message: 'La propiedad <buildingId> debe ser un UUID válido.',
  })
  @IsNotEmpty({ message: 'La propiedad <buildingId> no debe estar vacía.' })
  @ValidatorConstraintDecorator(
    EClassroomConfig.BUILDING,
    IsValidIdsClassroomConfigConstraint,
  )
  buildingId: string;

  @ApiProperty({
    description: 'ID del tipo de aula.',
    example: '65039ef6-1fc5-474c-b4e3-27239c200138',
    required: true,
  })
  @IsUUID('all', {
    message: 'La propiedad <roomTypeId> debe ser un UUID válido.',
  })
  @IsNotEmpty({ message: 'La propiedad <roomTypeId> no debe estar vacía.' })
  @ValidatorConstraintDecorator(
    EClassroomConfig.ROOM_TYPE,
    IsValidIdsClassroomConfigConstraint,
  )
  roomTypeId: string;

  @ApiPropertyOptional({
    description: 'ID de la conectividad del aula.',
    example: '65039ef6-1fc5-474c-b4e3-27239c200138',
  })
  @IsUUID('all', {
    message: 'La propiedad <connectivityId> debe ser un UUID válido.',
  })
  @IsOptional()
  @ValidatorConstraintDecorator(
    EClassroomConfig.CONNECTIVITY,
    IsValidIdsClassroomConfigConstraint,
  )
  connectivityId?: string;

  @ApiPropertyOptional({
    description: 'ID del equipo de audio del aula.',
    example: '65039ef6-1fc5-474c-b4e3-27239c200138',
  })
  @IsUUID('all', {
    message: 'La propiedad <audioEquipmentId> debe ser un UUID válido.',
  })
  @IsOptional()
  @ValidatorConstraintDecorator(
    EClassroomConfig.AUDIO_EQUIPMENT,
    IsValidIdsClassroomConfigConstraint,
  )
  audioEquipmentId?: string;

  @ApiPropertyOptional({
    description: 'ID de la condición del aula.',
    example: '65039ef6-1fc5-474c-b4e3-27239c200138',
  })
  @IsUUID('all', {
    message: 'La propiedad <conditionId> debe ser un UUID válido.',
  })
  @IsOptional()
  @ValidatorConstraintDecorator(
    EInventoryConfig.CONDITION,
    IsValidIdsInventoryConfigConstraint,
  )
  conditionId?: string;
}
