import { FileInterceptor } from '@nestjs/platform-express';
import {
  Controller,
  Post,
  Get,
  Query,
  UploadedFile,
  UseInterceptors,
  Body,
  Param,
  BadRequestException,
  InternalServerErrorException,
  Delete,
} from '@nestjs/common';
import { multerConfig } from '../configs/multer.config';
import { CloudinaryService } from '../services/cloudinary.service';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { ApiCommonResponses } from 'src/common/decorators/api-response.decorator';
import { EUserRole } from 'src/common/enums';
import { Roles } from 'src/common/decorators';

@Controller('cloudinary')
@Roles(EUserRole.ADMIN)
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Get('test')
  @ApiCommonResponses({
    summary: 'Probar conexión con Cloudinary',
    description:
      'Este endpoint verifica que la conexión con el servicio de Cloudinary esté funcionando correctamente.',
    okDescription: 'Conexión con Cloudinary exitosa.',
    internalErrorDescription: 'Error al conectar con Cloudinary.',
  })
  async testConnection() {
    return await this.cloudinaryService.testConnection();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @ApiBody({
    required: true,
    description: 'Información necesaria para subir un archivo.',
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Código del usuario a guardar la imagen',
        },
        subject: {
          type: 'string',
          description: 'Subject donde guardar la imagen',
        },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['code', 'subject', 'file'],
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiCommonResponses({
    summary: 'Subir archivo a Cloudinary',
    description:
      'Este endpoint permite subir un archivo a Cloudinary, asociándolo a un código de usuario y un subject específicos.',
    createdDescription: 'Archivo subido correctamente.',
    badRequestDescription:
      'Solicitud inválida, falta algún campo o el archivo no es válido.',
    internalErrorDescription: 'Error interno al subir el archivo.',
  })
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('code') code: string,
    @Body('subject') subject: string,
  ) {
    return this.cloudinaryService.handleFileUpload(file, code, subject);
  }

  @Get('files/:code/:subject')
  @ApiCommonResponses({
    summary: 'Obtener archivos por carpeta',
    description:
      'Recupera los archivos almacenados en Cloudinary según el código de usuario y el subject especificado.',
    okDescription: 'Lista de archivos obtenida correctamente.',
    internalErrorDescription: 'Error interno del servidor.',
    notFoundDescription:
      'No se encontraron archivos para el código y subject especificados.',
  })
  async getFilesByFolder(
    @Param('code') code: string,
    @Param('subject') subject: string,
  ) {
    try {
      return await this.cloudinaryService.getFilesByFolder(code, subject);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error interno del servidor al obtener los archivos',
      );
    }
  }

  @Get('search/:code')
  @ApiCommonResponses({
    summary: 'Buscar archivos por usuario',
    description:
      'Busca archivos en Cloudinary asociados al código de usuario proporcionado, usando un término de búsqueda opcional.',
    okDescription: 'Archivos encontrados según el término de búsqueda.',
    internalErrorDescription: 'Error interno del servidor.',
    notFoundDescription:
      'No se encontraron archivos que coincidan con la búsqueda.',
  })
  async searchFilesByUser(
    @Param('code') code: string,
    @Query('q') searchTerm: string,
  ) {
    try {
      if (!searchTerm) {
        throw new BadRequestException('Término de búsqueda requerido');
      }

      return await this.cloudinaryService.searchFilesByUserAndTerm(
        code,
        searchTerm,
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error interno del servidor al subir archivo',
      );
    }
  }

  @Delete(':public_id')
  @ApiCommonResponses({
    summary: 'Elimina archivo por public_id',
    description: 'Elimina un archivo con solo colocar el public_id del mismo.',
    okDescription: 'Archivo eliminado exitosamente',
    internalErrorDescription: 'Error interno del servidor.',
    notFoundDescription:
      'No se logró eliminar el archivo asociado al public_id.',
  })
  async remove(@Query('public_id') public_id: string) {
    if (!public_id) throw new BadRequestException('El public_id es requerido');

    return await this.cloudinaryService.remove(public_id);
  }
}
