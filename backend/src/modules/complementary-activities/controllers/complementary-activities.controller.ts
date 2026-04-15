import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiConsumes,
  PickType,
} from '@nestjs/swagger';
import {
  Roles,
  ResponseMessage,
  ApiPagination,
  GetCurrentUserId,
  ApiCommonResponses,
} from 'src/common/decorators';
import { EUserRole } from 'src/common/enums';
import { ValidateIdPipe } from 'src/common/pipes';
import { ComplementaryActivitiesService } from '../services/complementary-activities.service';
import {
  CreateComplementaryActivityDto,
  UpdateComplementaryActivityDto,
  UpdateComplementaryActivityWithFilesDto,
  UpdateVerificationMediaWithFilesDto,
} from '../dto';
import { QueryPaginationDto } from 'src/common/dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/modules/cloudinary/configs/multer.config';

@Controller('complementary-activities')
export class ComplementaryActivitiesController {
  constructor(
    private readonly complementaryActivitiesService: ComplementaryActivitiesService,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', 5, multerConfig))
  @Roles(
    EUserRole.ADMIN,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
    EUserRole.COORDINADOR_AREA,
    EUserRole.DOCENTE,
  )
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Se ha creado una actividad complmentaria.')
  @ApiOperation({
    summary: 'Crear una actividad complmentaria',
    description: 'Debería crear un nuevo tipo de actividad.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateComplementaryActivityDto })
  @ApiCommonResponses({
    summary: 'Crear una actividad complementaria',
    description: 'Debería crear un nuevo tipo de actividad.',
    createdDescription: 'Actividad complementaria creada exitosamente.',
    badRequestDescription: 'Datos inválidos para crear la actividad.',
    internalErrorDescription: 'Error interno al crear la actividad.',
    notFoundDescription: 'Recurso no encontrado.',
  })
  create(
    @Body()
    createComplementaryActivityDto: CreateComplementaryActivityDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.complementaryActivitiesService.create(
      createComplementaryActivityDto,
      files,
    );
  }

  @Get()
  @Roles(EUserRole.ADMIN, EUserRole.DIRECCION, EUserRole.RRHH)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de todas las actividades complementarias.')
  @ApiOperation({
    summary: 'Obtener todos los tipos de actividades',
    description: 'Devuelve una lista de todas las actividades complementarias.',
  })
  @ApiPagination({
    summary: 'Obtener todas las actividades complementarias',
    description: 'Devuelve una lista de todas las actividades complementarias.',
  })
  findAll(@Query() query: QueryPaginationDto) {
    return this.complementaryActivitiesService.findAllWithPagination(query);
  }

  @Get(':id')
  @Roles(
    EUserRole.ADMIN,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
    EUserRole.COORDINADOR_AREA,
    EUserRole.DOCENTE,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('La información de la actividad complementaria.')
  @ApiOperation({
    summary: 'Obtener una actividad complmentaria por ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la actividad complementaria a obtener',
    type: String,
    format: 'uuid',
  })
  findOne(@Param('id', ValidateIdPipe) id: string) {
    return this.complementaryActivitiesService.findOne(id);
  }

  @Get('my')
  @Roles(
    EUserRole.ADMIN,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
    EUserRole.COORDINADOR_AREA,
    EUserRole.DOCENTE,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(
    'Listado de actividades complementarias del usuario autenticado.',
  )
  @ApiPagination({
    summary:
      'Obtener todas las actividades complementarias del usuario autenticado',
    description:
      'Devuelve una lista de todas las actividades complementarias del usuario autenticado.',
  })
  findAllPersonal(
    @GetCurrentUserId() userId: string,
    @Query() query: QueryPaginationDto,
  ) {
    return this.complementaryActivitiesService.findAllByUserIdAndCode(query, {
      userId,
    });
  }

  @Patch(':id')
  @Roles(
    EUserRole.ADMIN,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
    EUserRole.COORDINADOR_AREA,
    EUserRole.DOCENTE,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha actualizado el tipo de actividad.')
  @ApiOperation({
    summary: 'Actualizar una actividad complmentaria por ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del tipo de actividad a actualizar',
    type: String,
    format: 'uuid',
  })
  update(
    @Param('id', ValidateIdPipe) id: string,
    @Body()
    updateComplementaryActivityDto: UpdateComplementaryActivityDto,
  ) {
    return this.complementaryActivitiesService.update(
      id,
      updateComplementaryActivityDto,
    );
  }

  @Patch('/files/:id')
  @UseInterceptors(FilesInterceptor('files', 5, multerConfig))
  @Roles(
    EUserRole.ADMIN,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
    EUserRole.COORDINADOR_AREA,
    EUserRole.DOCENTE,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha actualizado la actividad complmentaria.')
  @ApiOperation({
    summary: 'Actualizar una actividad complmentaria por ID y con archivos.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    required: false,
    description: 'Archivos a agregar al medio de verificación.',
    type: UpdateComplementaryActivityWithFilesDto,
  })
  updateWithFiles(
    @Param('id', ValidateIdPipe) id: string,
    @Body()
    updateComplementaryActivityWithFilesDto: UpdateComplementaryActivityWithFilesDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.complementaryActivitiesService.updateWithFiles(
      id,
      updateComplementaryActivityWithFilesDto,
      files,
    );
  }

  @Delete(':id')
  @Roles(
    EUserRole.ADMIN,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
    EUserRole.COORDINADOR_AREA,
    EUserRole.DOCENTE,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha eliminado una actividad complmentaria.')
  @ApiOperation({
    summary: 'Eliminar una actividad complmentaria por ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del tipo de actividad a eliminar',
    type: String,
    format: 'uuid',
  })
  remove(@Param('id', ValidateIdPipe) id: string) {
    return this.complementaryActivitiesService.remove(id);
  }
}
