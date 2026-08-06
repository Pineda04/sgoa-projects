import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiQuery } from '@nestjs/swagger';
import { ApiCommonResponses } from 'src/common/decorators/api-response.decorator';
import { AcademicPeriodsService } from '../services/academic-periods.service';
import { CreateAcademicPeriodDto, UpdateAcademicPeriodDto } from '../dto';
import {
  LookupSource,
  RequirePermission,
  ResponseMessage,
} from 'src/common/decorators';
import { ValidateIdPipe } from 'src/common/pipes';
import { TPacModality } from '../types';

@Controller('academic-periods')
export class AcademicPeriodsController {
  constructor(
    private readonly academicPeriodsService: AcademicPeriodsService,
  ) {}

  @Post()
  @RequirePermission('create', 'periods')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({
    type: CreateAcademicPeriodDto,
    description: 'Datos para crear periodo académico',
    required: true,
  })
  @ApiCommonResponses({
    summary: 'Crear periodo académico',
    description: 'Crea un nuevo periodo académico en el sistema.',
    createdDescription: 'Periodo académico creado exitosamente.',
    badRequestDescription: 'Datos inválidos para la creación del periodo.',
    internalErrorDescription: 'Error interno al crear el periodo.',
  })
  create(@Body() createAssignmentReportDto: CreateAcademicPeriodDto) {
    return this.academicPeriodsService.create(createAssignmentReportDto);
  }

  @Get()
  @RequirePermission('read', 'periods')
  @LookupSource()
  @HttpCode(HttpStatus.OK)
  @ApiCommonResponses({
    summary: 'Listar periodos académicos',
    description:
      'Obtiene la lista de todos los periodos académicos registrados.',
    okDescription: 'Lista de periodos académicos obtenida correctamente.',
    internalErrorDescription: 'Error interno al obtener los periodos.',
  })
  findAll(
    @Query('year') year?: string,
    @Query('pac') pac?: string,
    @Query('modality') modality?: string,
  ) {
    return this.academicPeriodsService.findAll(year, pac, modality);
  }

  @Get('one/:id')
  @RequirePermission('read', 'periods')
  @HttpCode(HttpStatus.OK)
  @ApiCommonResponses({
    summary: 'Obtener periodo académico por ID',
    description:
      'Obtiene la información de un periodo académico específico por su ID.',
    okDescription: 'Periodo académico obtenido correctamente.',
    internalErrorDescription: 'Error interno al obtener el periodo.',
    notFoundDescription: 'No se encontró el periodo solicitado.',
  })
  findOne(@Param('id', ValidateIdPipe) id: string) {
    return this.academicPeriodsService.findOne(id);
  }

  @Get('current')
  @RequirePermission('read', 'periods')
  @LookupSource()
  @HttpCode(HttpStatus.OK)
  @ApiCommonResponses({
    summary: 'Obtener periodo académico actual',
    description: 'Obtiene la información del periodo académico actual.',
    okDescription: 'Periodo académico obtenido correctamente.',
    internalErrorDescription: 'Error interno al obtener el periodo.',
    notFoundDescription: 'No se encontró el periodo solicitado.',
  })
  @ApiQuery({
    name: 'modality',
    description:
      'Modalidad del perido: ' +
      (['Trimestre', 'Semestre'] as TPacModality[]).join(', '),
    type: String,
    enum: ['Trimestre', 'Semestre'] as TPacModality[],
    required: false,
  })
  findCurrent(@Query('modality') modality: TPacModality = 'Trimestre') {
    return this.academicPeriodsService.currentAcademicPeriod(modality);
  }

  @Get('next-to-create')
  @RequirePermission('read', 'periods')
  @LookupSource()
  @HttpCode(HttpStatus.OK)
  @ApiCommonResponses({
    summary: 'Obtener periodo académico siguiente a crear una planificación',
    description:
      'Obtiene la información del periodo académico siguiente a crear una planificación.',
    okDescription: 'Periodo académico obtenido correctamente.',
    internalErrorDescription: 'Error interno al obtener el periodo.',
    notFoundDescription: 'No se encontró el periodo solicitado.',
  })
  @ApiQuery({
    name: 'modality',
    description:
      'Modalidad del perido: ' +
      (['Trimestre', 'Semestre'] as TPacModality[]).join(', '),
    type: String,
    enum: ['Trimestre', 'Semestre'] as TPacModality[],
    required: false,
  })
  async findNextToCreate(
    @Query('modality') modality: TPacModality = 'Trimestre',
  ) {
    return await this.academicPeriodsService.getNextAcademicPeriod(
      await this.academicPeriodsService.currentAcademicPeriod(modality),
    );
  }

  @Patch(':id')
  @RequirePermission('update', 'periods')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    type: UpdateAcademicPeriodDto,
    description: 'Datos para actualizar periodo académico',
    required: true,
  })
  @ApiCommonResponses({
    summary: 'Actualizar periodo académico',
    description: 'Actualiza la información de un periodo académico existente.',
    internalErrorDescription: 'Error interno al actualizar el periodo.',
    notFoundDescription: 'No se encontró el periodo solicitado.',
  })
  update(
    @Param('id', ValidateIdPipe) id: string,
    @Body() updateAcademicPeriodDto: UpdateAcademicPeriodDto,
  ) {
    return this.academicPeriodsService.update(id, updateAcademicPeriodDto);
  }

  @Delete(':id')
  @RequirePermission('delete', 'periods')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha eliminado el periodo académico.')
  @ApiCommonResponses({
    summary: 'Eliminar periodo académico por ID',
    okDescription: 'Periodo académico eliminado correctamente.',
    badRequestDescription: 'ID inválido para eliminar el periodo.',
    internalErrorDescription: 'Error interno al eliminar el periodo.',
    notFoundDescription: 'No se encontró el periodo a eliminar.',
  })
  remove(@Param('id', ValidateIdPipe) id: string) {
    return this.academicPeriodsService.remove(id);
  }
}
