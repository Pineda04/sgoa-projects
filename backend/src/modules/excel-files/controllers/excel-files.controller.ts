import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ExcelFilesService } from '../services/excel-files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExcelResponseDto } from '../dto/excel-response.dto';
import {
  AcademicAssignmentReportDto,
  propertiesAcademicAssignmentReport,
  TAcademicAssignmentReport,
} from '../dto/academic-assignment-report.dto';
import { ApiConsumes } from '@nestjs/swagger';
import { ResponseMessage, ApiCommonResponses } from 'src/common/decorators';

@Controller('excel-files')
export class ExcelFilesController {
  constructor(
    private readonly excelFilesService: ExcelFilesService<
      TAcademicAssignmentReport,
      AcademicAssignmentReportDto
    >,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Archivo Excel subido y procesado correctamente.')
  @ApiConsumes('multipart/form-data')
  @ApiCommonResponses({
    summary: 'Subir archivo Excel para reporte académico',
    createdDescription: 'Archivo Excel procesado exitosamente.',
    badRequestDescription: 'Archivo inválido o formato no soportado.',
    internalErrorDescription: 'Error interno al procesar el archivo.',
  })
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ExcelResponseDto<AcademicAssignmentReportDto>> {
    const handledFile = this.excelFilesService.handleFileUpload(file);

    return this.excelFilesService.processFile(
      propertiesAcademicAssignmentReport,
      handledFile.buffer,
    );
  }
}
