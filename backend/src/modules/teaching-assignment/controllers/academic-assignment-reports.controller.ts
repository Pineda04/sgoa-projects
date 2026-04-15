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
  UploadedFile,
  UseInterceptors,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { AcademicAssignmentReportsService } from '../services/academic-assignment-reports.service';
import {
  AcademicAssignmentArrayDto,
  AcademicAssignmentDto,
  CreateAcademicAssignmentReportDto,
  propertiesAcademicAssignment,
  TAcademicAssignment,
  UpdateAcademicAssignmentReportDto,
} from '../dto';
import {
  ApiPagination,
  GetCurrentUserId,
  ResponseMessage,
  Roles,
} from 'src/common/decorators';
import { EUserRole } from 'src/common/enums';
import { ValidateIdPipe } from 'src/common/pipes';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ExcelFilesService } from 'src/modules/excel-files/services/excel-files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { QueryPaginationDto } from 'src/common/dto';
import { ApiCommonResponses } from 'src/common/decorators/api-response.decorator';

@Controller('academic-assignment-reports')
export class AssignmentReportsController {
  constructor(
    private readonly academicAssignmentReportsService: AcademicAssignmentReportsService,
    private readonly excelFilesService: ExcelFilesService<
      TAcademicAssignment,
      AcademicAssignmentDto
    >,
  ) {}

  @Post()
  @Roles(
    EUserRole.ADMIN,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
    EUserRole.COORDINADOR_AREA,
  )
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Se ha creado un informe de asignación académica.')
  @ApiBody({
    type: CreateAcademicAssignmentReportDto,
    description:
      'Datos necesarios para crear un informe de asignación académica.',
    required: true,
  })
  @ApiCommonResponses({
    summary: 'Crear informe de asignación académica',
    createdDescription: 'Informe de asignación académica creado exitosamente.',
    badRequestDescription: 'Datos inválidos para la creación del informe.',
    internalErrorDescription: 'Error interno al crear el informe.',
  })
  create(
    @Body()
    createAcademicAssignmentReportDto: CreateAcademicAssignmentReportDto,
  ) {
    return this.academicAssignmentReportsService.create(
      createAcademicAssignmentReportDto,
    );
  }

  @Get()
  @Roles(
    EUserRole.ADMIN,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
    EUserRole.COORDINADOR_AREA,
    EUserRole.DOCENTE,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de informes de asignación académica.')
  @ApiPagination({
    summary: 'Obtener todos los informes de asignación académica',
    description:
      'Devuelve una lista de todos los informes de asignación académica.',
  })
  @ApiCommonResponses({
    summary: 'Obtener todos los informes de asignación académica',
    okDescription:
      'Listado de informes de asignación académica obtenido correctamente.',
    badRequestDescription: 'Solicitud inválida al obtener los informes.',
    internalErrorDescription: 'Error interno al obtener los informes.',
    notFoundDescription: 'No se encontraron informes de asignación académica.',
  })
  findAll(@Query() query: QueryPaginationDto) {
    return this.academicAssignmentReportsService.findAllWithPagination(query);
  }

  @Get('periods')
  @Roles(
    EUserRole.ADMIN,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
    EUserRole.COORDINADOR_AREA,
    EUserRole.DOCENTE,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(
    'Listado de solamente el periodo donde el usuario autenticado tiene informes.',
  )
  @ApiCommonResponses({
    summary:
      'Obtener todos los informes de asignación académica del usuario autenticado',
    okDescription:
      'Listado de periodos donde el usuario autenticado tiene informes de asignación académica obtenido correctamente.',
    badRequestDescription: 'Solicitud inválida al obtener los informes.',
    internalErrorDescription: 'Error interno al obtener los informes.',
    notFoundDescription: 'No se encontraron informes de asignación académica.',
  })
  findAllOnlyPeriods(@GetCurrentUserId() userId: string) {
    return this.academicAssignmentReportsService.findAllUserIdOnlyPeriods(
      userId,
    );
  }

  @Get('user/:id')
  @Roles(
    EUserRole.ADMIN,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
    EUserRole.COORDINADOR_AREA,
    EUserRole.DOCENTE,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(
    'Listado de informes de asignación académica de un usuario por ID.',
  )
  @ApiParam({
    name: 'id',
    description:
      'ID del usuario para obtener sus informes de asignación académica, este es el userId.',
    type: String,
    format: 'uuid',
  })
  @ApiPagination({
    summary:
      'Obtener todos los informes de asignación académica de un usuario por ID',
    description:
      'Devuelve una lista de todos los informes de asignación académica de un usuario específico.',
  })
  @ApiCommonResponses({
    summary: 'Obtener informes por userId',
    okDescription: 'Listado de informes obtenido correctamente.',
    badRequestDescription: 'ID inválido para obtener informes.',
    internalErrorDescription: 'Error interno al obtener informes.',
    notFoundDescription: 'No se encontraron informes para el usuario.',
  })
  findAllByUserId(
    @Param('id', ValidateIdPipe) userId: string,
    @Query() query: QueryPaginationDto,
  ) {
    return this.academicAssignmentReportsService.findAllByUserIdAndCode(query, {
      userId,
    });
  }

  @Get('user/code/:code')
  @Roles(
    EUserRole.ADMIN,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
    EUserRole.COORDINADOR_AREA,
    EUserRole.DOCENTE,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(
    'Listado de informes de asignación académica de un usuario por código.',
  )
  @ApiParam({
    name: 'code',
    description:
      'Código del usuario para obtener sus informes de asignación académica.',
    type: String,
    format: 'string',
  })
  @ApiPagination({
    summary:
      'Obtener todos los informes de asignación académica de un usuario por código',
    description:
      'Devuelve una lista de todos los informes de asignación académica de un usuario específico.',
  })
  @ApiCommonResponses({
    summary: 'Obtener informes por código de usuario',
    okDescription: 'Listado de informes obtenido correctamente.',
    badRequestDescription: 'Código inválido para obtener informes.',
    internalErrorDescription: 'Error interno al obtener informes.',
    notFoundDescription:
      'No se encontraron informes para el código proporcionado.',
  })
  findAllByCode(
    @Param('code') code: string,
    @Query() query: QueryPaginationDto,
  ) {
    return this.academicAssignmentReportsService.findAllByUserIdAndCode(query, {
      code,
    });
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
    'Listado de informes de asignación académica del usuario autenticado.',
  )
  @ApiPagination({
    summary:
      'Obtener todos los informes de asignación académica del usuario autenticado',
    description:
      'Devuelve una lista de todos los informes de asignación académica del usuario autenticado.',
  })
  @ApiCommonResponses({
    summary: 'Obtener informes del usuario autenticado',
    okDescription: 'Listado de informes obtenido correctamente.',
    badRequestDescription: 'Solicitud inválida.',
    internalErrorDescription: 'Error interno al obtener informes.',
    notFoundDescription:
      'No se encontraron informes para el usuario autenticado.',
  })
  findAllPersonal(
    @GetCurrentUserId() userId: string,
    @Query() query: QueryPaginationDto,
  ) {
    return this.academicAssignmentReportsService.findAllByUserIdAndCode(query, {
      userId,
    });
  }

  @Get('my/period/:id/center-department/:centerDepartmentId')
  @Roles(
    EUserRole.ADMIN,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
    EUserRole.COORDINADOR_AREA,
    EUserRole.DOCENTE,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(
    'Informe de asignación académica del usuario autenticado obtenido por ID de periodo e ID de la relación centro-departamento.',
  )
  @ApiCommonResponses({
    summary: 'Obtener informe del usuario autenticado',
    okDescription: 'Informe obtenido correctamente.',
    badRequestDescription: 'Solicitud inválida.',
    internalErrorDescription: 'Error interno al obtener el informe.',
    notFoundDescription:
      'No se encontró un informe para el usuario autenticado en el periodo indicado y la relación centro-departamento.',
  })
  findOnePersonalAndPeriodId(
    @GetCurrentUserId() userId: string,
    @Param('id', ValidateIdPipe) periodId: string,
    @Param('centerDepartmentId', ValidateIdPipe) centerDepartmentId: string,
  ) {
    return this.academicAssignmentReportsService.findOneByUserIdAndPeriodIdAndCenterDepartmentId(
      {
        userId,
      },
      periodId,
      centerDepartmentId,
    );
  }

  @Get('center-department/:centerDepartmentId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(
    'Listado de asignaciones académicas por la relación centro-departamento.',
  )
  @ApiParam({
    name: 'centerDepartmentId',
    description:
      'ID de la relación centro-departamento para filtrar las asignaciones académicas',
    type: String,
    format: 'uuid',
  })
  @ApiPagination({
    summary:
      'Listar las asignaciones académicas por centro-departamento específico',
    description:
      'Obtiene un listado paginado de asignaciones académicas asociadas a un centro-departamento específico',
  })
  @ApiCommonResponses({
    summary: 'Obtener asignaciones por centro-departamento',
    okDescription: 'Listado de asignaciones obtenido correctamente.',
    badRequestDescription: 'ID inválido para obtener asignaciones.',
    internalErrorDescription: 'Error interno al obtener asignaciones.',
    notFoundDescription:
      'No se encontraron asignaciones para el centro-departamento.',
  })
  findAllByCenterDepartmentId(
    @Query() query: QueryPaginationDto,
    @Param('centerDepartmentId', ValidateIdPipe) centerDepartmentId: string,
  ) {
    return this.academicAssignmentReportsService.findAllByCenterDepartmentId(
      query,
      centerDepartmentId,
    );
  }

  @Get('coordinator/:centerDepartmentId')
  @Roles(EUserRole.COORDINADOR_AREA)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(
    'Listado de asignaciones académicas por center-department para coordinadores de área.',
  )
  @ApiPagination({
    summary:
      'Listar asignaciones académicas por center-department para coordinadores de área (usuarios autenticados con rol COORDINADOR_AREA)',
    description:
      'Obtiene un listado paginado de asignaciones académicas asociadas a un center-department específico, siempre y cuando el usuario autenticado sea coordinador activo en ese center-department.',
  })
  @ApiCommonResponses({
    summary:
      'Obtener asignaciones para coordinadores de área por center-department',
    okDescription: 'Listado de asignaciones obtenido correctamente.',
    badRequestDescription: 'Solicitud inválida para coordinador.',
    internalErrorDescription: 'Error interno al obtener asignaciones.',
    notFoundDescription:
      'No se encontraron asignaciones para el coordinador en el center-department indicado.',
  })
  @ApiParam({
    name: 'centerDepartmentId',
    description: 'ID de la relación centro-departamento.',
    type: String,
    format: 'uuid',
  })
  findAllByCoordinator(
    @Query() query: QueryPaginationDto,
    @Param('centerDepartmentId', ValidateIdPipe) centerDepartmentId: string,
    @GetCurrentUserId() userId: string,
  ) {
    return this.academicAssignmentReportsService.findAllByCoordinator(
      query,
      userId,
      centerDepartmentId,
    );
  }

  @Get('coordinator/:centerDepartmentId/periods')
  @Roles(EUserRole.COORDINADOR_AREA)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(
    'Lista de periodos académicos con asignaciones académicas registradas para el center-department especificado.',
  )
  @ApiPagination({
    summary:
      'Obtener periodos académicos con asignaciones registradas para coordinadores de área y center-department',
    description:
      'Retorna un listado paginado de los periodos académicos en los que existen asignaciones académicas vinculadas al center-department especificado (se requiere que el usuario sea coordinador activo en ese center-department).',
  })
  @ApiCommonResponses({
    summary:
      'Consulta de periodos académicos con asignaciones por center-department',
    okDescription: 'Listado de periodos obtenido correctamente.',
    badRequestDescription: 'La solicitud contiene parámetros inválidos.',
    internalErrorDescription: 'Error interno al procesar la solicitud.',
    notFoundDescription:
      'No se encontraron periodos con asignaciones registradas para el center-department indicado.',
  })
  @ApiParam({
    name: 'centerDepartmentId',
    description: 'ID de la relación centro-departamento.',
    type: String,
    format: 'uuid',
  })
  findAllByCoordinatorOnlyPeriods(
    @Query() query: QueryPaginationDto,
    @Param('centerDepartmentId', ValidateIdPipe) centerDepartmentId: string,
    @GetCurrentUserId() userId: string,
  ) {
    return this.academicAssignmentReportsService.findAllByCoordinatorOnlyPeriods(
      query,
      userId,
      centerDepartmentId,
    );
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
  @ResponseMessage('La información del informe de asignación académica.')
  @ApiOperation({
    summary: 'Obtener un informe de asignación académica por ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del informe de asignación académica',
    type: String,
    format: 'uuid',
  })
  @ApiCommonResponses({
    summary: 'Obtener informe por ID',
    okDescription: 'Informe obtenido correctamente.',
    badRequestDescription: 'ID inválido para obtener informe.',
    internalErrorDescription: 'Error interno al obtener informe.',
    notFoundDescription: 'No se encontró el informe solicitado.',
  })
  findOne(@Param('id', ValidateIdPipe) id: string) {
    return this.academicAssignmentReportsService.findOne(id);
  }

  @Get('departments/:centerDepartmentId')
  @Roles(EUserRole.COORDINADOR_AREA)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(
    'Detalle de asignaciones académicas para el periodo especificado en el centro-departamento indicado.',
  )
  @ApiPagination({
    summary:
      'Obtener detalle de asignaciones académicas por periodo y centro-departamento',
    description:
      'Permite a un coordinador de área autenticado, que sea coordinador activo en el centro-departamento indicado, consultar las asignaciones académicas correspondientes a un periodo académico específico.',
  })
  @ApiCommonResponses({
    summary:
      'Consulta de asignaciones académicas por periodo y centro-departamento',
    okDescription: 'Detalle de asignaciones obtenido correctamente.',
    badRequestDescription: 'La solicitud contiene parámetros inválidos.',
    internalErrorDescription: 'Error interno al procesar la solicitud.',
    notFoundDescription:
      'No se encontraron asignaciones para el periodo o el centro-departamento especificado.',
  })
  // @ApiParam({
  //   name: 'centerDepartmentId',
  //   description: 'ID de la relación centro-departamento.',
  //   type: String,
  //   format: 'uuid',
  // })
  // @ApiParam({
  //   name: 'periodId',
  //   description: 'ID del periodo académico.',
  //   type: String,
  //   format: 'uuid',
  // })
  @ApiQuery({
    name: 'periodId',
    description:
      'ID del periodo a obtener los reportes de asignación académica',
    type: String,
    format: 'uuid',
    required: false,
  })
  @ApiQuery({
    name: 'teacherId',
    description:
      'ID del docente a obtener los reportes de asignación académica',
    type: String,
    format: 'uuid',
    required: false,
  })
  findOneByCoordinatorAndPeriodId(
    @GetCurrentUserId() userId: string,
    @Query() query: QueryPaginationDto,
    @Param('centerDepartmentId', ValidateIdPipe) centerDepartmentId: string,
    @Query('periodId', ValidateIdPipe) periodId?: string,
    @Query('teacherId', ValidateIdPipe) teacherId?: string,
  ) {
    return this.academicAssignmentReportsService.findOneByCoordinatorAndPeriodId(
      query,
      userId,
      centerDepartmentId,
      periodId,
      teacherId,
    );
  }

  @Patch(':id')
  @Roles(
    EUserRole.ADMIN,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
    EUserRole.COORDINADOR_AREA,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha actualizado un informe de asignación académica.')
  @ApiOperation({
    summary: 'Actualizar un informe de asignación académica por ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del informe de asignación académica a actualizar',
    type: String,
    format: 'uuid',
  })
  @ApiBody({ type: UpdateAcademicAssignmentReportDto })
  @ApiCommonResponses({
    summary: 'Actualizar informe por ID',
    okDescription: 'Informe actualizado correctamente.',
    badRequestDescription: 'Datos inválidos para actualizar informe.',
    internalErrorDescription: 'Error interno al actualizar informe.',
    notFoundDescription: 'No se encontró el informe a actualizar.',
  })
  update(
    @Param('id', ValidateIdPipe) id: string,
    @Body()
    updateAcademicAssignmentReportDto: UpdateAcademicAssignmentReportDto,
  ) {
    return this.academicAssignmentReportsService.update(
      id,
      updateAcademicAssignmentReportDto,
    );
  }

  @Delete(':id')
  @Roles(
    EUserRole.ADMIN,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
    EUserRole.COORDINADOR_AREA,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha eliminado un informe de asignación académica.')
  @ApiOperation({
    summary: 'Eliminar un informe de asignación académica por ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del informe de asignación académica a eliminar',
    type: String,
    format: 'uuid',
  })
  @ApiCommonResponses({
    summary: 'Eliminar informe por ID',
    okDescription: 'Informe eliminado correctamente.',
    badRequestDescription: 'ID inválido para eliminar informe.',
    internalErrorDescription: 'Error interno al eliminar informe.',
    notFoundDescription: 'No se encontró el informe a eliminar.',
  })
  remove(@Param('id', ValidateIdPipe) id: string) {
    return this.academicAssignmentReportsService.remove(id);
  }

  @Delete('/period/:id')
  @Roles(
    EUserRole.ADMIN,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
    EUserRole.COORDINADOR_AREA,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(
    'Se ha eliminado los informes de asignación académica para un periodo.',
  )
  @ApiOperation({
    summary: 'Eliminar todos los informes de asignación académica por periodo',
  })
  @ApiParam({
    name: 'id',
    description:
      'ID del periodo para eliminar informes de asignación académica',
    type: String,
    format: 'uuid',
  })
  @ApiCommonResponses({
    summary: 'Eliminar informes por periodo',
    okDescription: 'Informes eliminados correctamente.',
    badRequestDescription: 'ID inválido para eliminar informes.',
    internalErrorDescription: 'Error interno al eliminar informes.',
    notFoundDescription: 'No se encontraron informes para el periodo.',
  })
  removeAll(@Param('id', ValidateIdPipe) id: string) {
    return this.academicAssignmentReportsService.removeAll(id);
  }

  @Post('file/coordinator/view/:centerDepartmentId')
  @Roles(
    EUserRole.ADMIN,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
    EUserRole.COORDINADOR_AREA,
  )
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Vista previa generada correctamente desde el archivo.')
  @ApiOperation({
    summary: 'Visualiza informes de asignación académica desde un archivo',
    description:
      'Procesa un archivo Excel y devuelve una vista previa de los informes de asignación académica, sin guardar ningún dato. Esta operación solo puede ser realizada por un usuario con el rol de Coordinador de Área, autenticado mediante token.',
  })
  @ApiParam({
    name: 'centerDepartmentId',
    description:
      'ID del centro-departamento académico para el cual se está generando la vista previa de los informes de asignación académica.',
    type: String,
    example: '12345',
  })
  @ApiBody({
    required: true,
    description: 'Archivo Excel con los datos de los informes de asignación.',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiCommonResponses({
    summary: 'Vista previa de informes desde archivo',
    createdDescription: 'Vista previa generada exitosamente.',
    badRequestDescription: 'Archivo inválido o datos erróneos.',
    internalErrorDescription: 'Error interno al procesar el archivo.',
  })
  async viewFileCoordination(
    @Param('centerDepartmentId', ValidateIdPipe) centerDepartmentId: string,
    @GetCurrentUserId() currentUserId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const handledFile = this.excelFilesService.handleFileUpload(file);

    const data = await this.excelFilesService.processFile(
      propertiesAcademicAssignment,
      handledFile.buffer,
    );

    const parsedAcademicTitle =
      this.academicAssignmentReportsService.parsedTitleFromExcel(data.subtitle);

    const parsedData = await this.academicAssignmentReportsService.parsedData(
      data.data,
      centerDepartmentId,
      currentUserId,
      parsedAcademicTitle,
    );

    // Devuelve los datos procesados, sin guardar
    return parsedData.coursesView;
  }

  @Post('array/coordinator/:centerDepartmentId')
  @Roles(EUserRole.COORDINADOR_AREA)
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Se han creado los informes de asignación académica.')
  @ApiOperation({
    summary:
      'Crear múltiples informes de asignación académica desde un arreglo',
    description:
      'Permite a un Coordinador de Área crear múltiples informes de asignación académica proporcionando un arreglo de asignaciones en el cuerpo de la petición. Cada elemento del arreglo representa una asignación académica con su respectiva información.',
  })
  @ApiParam({
    name: 'centerDepartmentId',
    description:
      'ID del centro-departamento académico para el cual se están generando los informes de asignación académica. Este ID se utiliza para asociar los informes con el centro-departamento correspondiente.',
    type: String,
  })
  @ApiBody({
    type: AcademicAssignmentArrayDto,
    description:
      'Arreglo de objetos que representan las asignaciones académicas que se desean registrar.',
    required: true,
  })
  @ApiCommonResponses({
    summary: 'Crear múltiples informes de asignación académica',
    createdDescription:
      'Informes de asignación académica creados exitosamente a partir del arreglo de datos enviado.',
    badRequestDescription:
      'El cuerpo de la solicitud contiene datos inválidos o con formato incorrecto.',
    internalErrorDescription:
      'Error interno al procesar la creación de los informes de asignación académica.',
  })
  async createFromArray(
    @Param('centerDepartmentId', ValidateIdPipe) centerDepartmentId: string,
    @GetCurrentUserId() currentUserId: string,
    @Body() body: AcademicAssignmentArrayDto,
  ) {
    const parsedData = await this.academicAssignmentReportsService.parsedData(
      body.assignments,
      centerDepartmentId,
      currentUserId,
    );

    if (parsedData.coursesView.invalidElements.length > 0) {
      throw new BadRequestException({
        message: 'Algunos elementos no pasaron la validación',
        invalidElements: parsedData.coursesView.invalidElements,
      });
    }

    return this.academicAssignmentReportsService.createFromArray(
      parsedData.coursesGroupByTeacherCodeEntries,
    );
  }

  @Post('file/coordinator/:centerDepartmentId')
  @Roles(EUserRole.COORDINADOR_AREA)
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Se han creado los informes de asignación académica.')
  @ApiOperation({
    summary: 'Crea múltiples informes de asignación académica desde un archivo',
    description:
      'Debería crear múltiples informes de asignación académica a partir de un archivo Excel. Esta operación solo puede ser realizada por un usuario con el rol de Coordinador de Área, que será autenticado a través de su token.',
  })
  @ApiParam({
    name: 'centerDepartmentId',
    description:
      'ID del centro-departamento académico para el cual se están generando los informes de asignación académica. Este ID se utiliza para asociar los informes con el centro-departamento correspondiente.',
    type: String,
  })
  @ApiBody({
    required: true,
    description: 'Archivo Excel con los datos de los informes de asignación.',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiCommonResponses({
    summary: 'Crear informes desde archivo',
    createdDescription: 'Informes creados exitosamente desde el archivo.',
    badRequestDescription: 'Archivo inválido o datos erróneos.',
    internalErrorDescription: 'Error interno al procesar el archivo.',
  })
  async uploadFileCoordination(
    @Param('centerDepartmentId', ValidateIdPipe) centerDepartmentId: string,
    @GetCurrentUserId() currentUserId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const handledFile = this.excelFilesService.handleFileUpload(file);

    const data = await this.excelFilesService.processFile(
      propertiesAcademicAssignment,
      handledFile.buffer,
    );

    const parsedAcademicTitle =
      this.academicAssignmentReportsService.parsedTitleFromExcel(data.subtitle);

    const parsedData = await this.academicAssignmentReportsService.parsedData(
      data.data,
      centerDepartmentId,
      currentUserId,
      parsedAcademicTitle,
    );

    if (parsedData.coursesView.invalidElements.length > 0) {
      throw new BadRequestException({
        message: 'Algunos elementos no pasaron la validación',
        invalidElements: parsedData.coursesView.invalidElements,
      });
    }

    return this.academicAssignmentReportsService.createFromArray(
      parsedData.coursesGroupByTeacherCodeEntries,
    );
  }
}
