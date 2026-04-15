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
import { ApiBody, ApiParam, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import {
  Roles,
  ResponseMessage,
  ApiPagination,
  GetCurrentUserId,
  ApiCommonResponses,
} from 'src/common/decorators';
import { EUserRole } from 'src/common/enums';
import { ValidateIdPipe } from 'src/common/pipes';
import {
  CreateVerificationMediaDto,
  UpdateVerificationMediaDto,
  UpdateVerificationMediaWithFilesDto,
} from '../dto';
import { VerificationMediasService } from '../services/verification-medias.service';
import { QueryPaginationDto } from 'src/common/dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/modules/cloudinary/configs/multer.config';

@Controller('verification-medias')
@Roles(
  EUserRole.ADMIN,
  EUserRole.DIRECCION,
  EUserRole.RRHH,
  EUserRole.COORDINADOR_AREA,
  EUserRole.DOCENTE,
)
export class VerificationMediasController {
  constructor(
    private readonly verificationMediasService: VerificationMediasService,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', 5, multerConfig))
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Se ha creado un medio de verificación.')
  @ApiBody({
    required: true,
    description: 'Datos necesarios para crear un medio de verificación.',
    schema: {
      type: 'object',
      properties: {
        description: {
          description:
            'Descripción del medio de verificación, si no se mandan archivos solamente se guardará la descripción.',
          type: 'string',
          format: 'string',
        },
        activityId: {
          description:
            'ID de la actividad complemenetaria a la que pertenece este medio de verificación.',
          type: 'string',
          format: 'uuid',
        },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description:
            'Archivos a adjuntar, opcional y múltiples (solamente 5).',
        },
      },
      required: ['description', 'activityId'],
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiCommonResponses({
    summary: 'Crear un medio de verificación',
    createdDescription:
      'Medio de verificación creado correctamente, con o sin archivos adjuntos.',
    badRequestDescription: 'Datos inválidos para la creación.',
  })
  create(
    @Body() createVerificationMediaDto: CreateVerificationMediaDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.verificationMediasService.create(
      createVerificationMediaDto,
      files,
    );
  }

  @Get()
  @Roles(EUserRole.ADMIN, EUserRole.DIRECCION, EUserRole.RRHH)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de tipos de actividades.')
  @ApiPagination({
    summary: 'Obtener todos los medios de verificación',
    description: 'Devuelve una lista de todos los medios de verificación.',
  })
  @ApiCommonResponses({
    summary: 'Obtener todos los medios de verificación',
    okDescription: 'Lista de medios de verificación obtenida correctamente.',
  })
  findAll(@Query() query: QueryPaginationDto) {
    return this.verificationMediasService.findAllWithPagination(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('La información del medio de verificación.')
  @ApiParam({
    name: 'id',
    description: 'ID del medio de verificación a obtener',
    type: String,
    format: 'uuid',
  })
  @ApiCommonResponses({
    summary: 'Obtener un medio de verificación por ID',
    okDescription: 'Medio de verificación obtenido correctamente.',
    notFoundDescription: 'El medio de verificación no existe.',
  })
  findOne(@Param('id', ValidateIdPipe) id: string) {
    return this.verificationMediasService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha actualizado el medio de verificación.')
  @ApiParam({
    name: 'id',
    description: 'ID del medio de verificación a actualizar',
    type: String,
    format: 'uuid',
  })
  @ApiBody({ type: UpdateVerificationMediaDto })
  @ApiCommonResponses({
    summary: 'Actualizar un medio de verificación por ID',
    okDescription: 'Medio de verificación actualizado correctamente.',
    badRequestDescription: 'Datos inválidos para la actualización.',
    notFoundDescription: 'El medio de verificación no existe.',
  })
  update(
    @Param('id', ValidateIdPipe) id: string,
    @Body() updateVerificationMediaDto: UpdateVerificationMediaDto,
  ) {
    return this.verificationMediasService.update(
      id,
      updateVerificationMediaDto,
    );
  }

  @Patch('files/:complementaryActivityId')
  @UseInterceptors(FilesInterceptor('files', 5, multerConfig))
  @Roles(
    EUserRole.ADMIN,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
    EUserRole.COORDINADOR_AREA,
    EUserRole.DOCENTE,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(
    'Se ha actualizado un medio de verificación con archivos adjuntos opcionales.',
  )
  @ApiOperation({
    summary:
      'Actualizar un medio de verificación con archivos adjuntos opcionales mediante el ID de la actividad complementaria',
    description:
      'Debería actualizar un medio de verificación y permitir la carga de archivos adjuntos opcionales.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateVerificationMediaWithFilesDto })
  @ApiCommonResponses({
    summary:
      'Actualizar un medio de verificación con archivos adjuntos opcionales',
    description:
      'Debería actualizar un medio de verificación adjunto a la actividad complementaria y permitir la carga de archivos adjuntos opcionales.',
    createdDescription: 'Medio de verificación actualizado exitosamente.',
    badRequestDescription:
      'Datos inválidos para actualizar el medio de verificación.',
    internalErrorDescription:
      'Error interno al actualizar el medio de verificación.',
    notFoundDescription: 'Recurso no encontrado.',
  })
  updateWithFilesByComplementaryActivityId(
    @Param('complementaryActivityId', ValidateIdPipe)
    complementaryActivityId: string,
    @Body()
    updateVerificationMediaWithFilesDto: UpdateVerificationMediaWithFilesDto,
  ) {
    return this.verificationMediasService.updateWithFilesByComplementaryActivityId(
      complementaryActivityId,
      updateVerificationMediaWithFilesDto,
    );
  }

  @Delete(':id')
  @Roles(EUserRole.ADMIN, EUserRole.DIRECCION, EUserRole.RRHH)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha eliminado un medio de verificación.')
  @ApiParam({
    name: 'id',
    description: 'ID del medio de verificación a eliminar',
    type: String,
    format: 'uuid',
  })
  @ApiCommonResponses({
    summary: 'Eliminar un medio de verificación por ID',
    okDescription: 'Medio de verificación eliminado correctamente.',
    notFoundDescription: 'El medio de verificación no existe.',
  })
  remove(@Param('id', ValidateIdPipe) id: string) {
    return this.verificationMediasService.remove(id);
  }

  @Delete('file/:id')
  @Roles(EUserRole.ADMIN, EUserRole.DIRECCION, EUserRole.RRHH)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha eliminado un archivo de los medios de verificación.')
  @ApiParam({
    name: 'id',
    description: 'ID del archivo del medio de verificación a eliminar',
    type: String,
    format: 'uuid',
  })
  @ApiCommonResponses({
    summary: 'Eliminar un archivo de un medio de verificación por ID',
    okDescription: 'Archivo eliminado correctamente del medio de verificación.',
    notFoundDescription: 'El archivo del medio de verificación no existe.',
  })
  removeFile(@Param('id', ValidateIdPipe) id: string) {
    return this.verificationMediasService.removeFile(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(
    'Se ha eliminado un medio de verificación (usuario autenticado).',
  )
  @ApiParam({
    name: 'id',
    description: 'ID del medio de verificación a eliminar',
    type: String,
    format: 'uuid',
  })
  @ApiCommonResponses({
    summary: 'Eliminar un medio de verificación por ID (usuario autenticado)',
    okDescription:
      'Medio de verificación eliminado correctamente por el usuario autenticado.',
    notFoundDescription: 'El medio de verificación no existe.',
  })
  removePersonal(
    @GetCurrentUserId() currentUserId: string,
    @Param('id', ValidateIdPipe) id: string,
  ) {
    return this.verificationMediasService.removePersonal(currentUserId, id);
  }

  @Delete('file/personal/:id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(
    'Se ha eliminado un archivo de los medios de verificación (usuario autenticado).',
  )
  @ApiParam({
    name: 'id',
    description: 'ID del archivo del medio de verificación a eliminar',
    type: String,
    format: 'uuid',
  })
  @ApiCommonResponses({
    summary:
      'Eliminar un archivo de un medio de verificación por ID (usuario autenticado)',
    okDescription:
      'Archivo eliminado correctamente del medio de verificación por el usuario autenticado.',
    notFoundDescription: 'El archivo del medio de verificación no existe.',
  })
  removeFilePersonal(
    @GetCurrentUserId() currentUserId: string,
    @Param('id', ValidateIdPipe) id: string,
  ) {
    return this.verificationMediasService.removeFilePersonal(currentUserId, id);
  }
}
