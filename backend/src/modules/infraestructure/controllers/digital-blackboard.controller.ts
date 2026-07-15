import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import {
  ApiCommonResponses,
  RequirePermission,
  ResponseMessage,
} from 'src/common/decorators';
import { ValidateIdPipe } from 'src/common/pipes';
import { DigitalBlackboardService } from '../services/digital-blackboard.service';

@Controller('digital-blackboards')
export class DigitalBlackboardController {
  constructor(
    private readonly digitalBlackboardService: DigitalBlackboardService,
  ) {}

  @Get()
  @RequirePermission('read', 'classrooms')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de pizarras digitales.')
  @ApiCommonResponses({
    summary: 'Obtener todas las pizarras digitales',
    okDescription: 'Listado de pizarras digitales obtenido correctamente.',
  })
  findAll() {
    return this.digitalBlackboardService.findAll();
  }

  @Get(':id')
  @RequirePermission('read', 'classrooms')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha encontrado la pizarra digital.')
  @ApiCommonResponses({
    summary: 'Obtener una pizarra digital por ID',
    okDescription: 'Pizarra digital obtenida correctamente.',
    notFoundDescription: 'La pizarra digital no existe.',
  })
  findOne(@Param('id', ValidateIdPipe) id: string) {
    return this.digitalBlackboardService.findOne(id);
  }
}
