import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiPagination,
  GetCurrentUserId,
  ResponseMessage,
  Roles,
} from 'src/common/decorators';
import { ApiCommonResponses } from 'src/common/decorators/api-response.decorator';
import { EUserRole } from 'src/common/enums';
import { ValidateIdPipe } from 'src/common/pipes';
import { QueryPaginationDto } from 'src/common/dto';
import { ApiBody } from '@nestjs/swagger';
import { CreateTeacherPreferenceDto } from '../dto/create-teacher-preference.dto';
import { TeacherPreferencesService } from '../services/teacher-preferences.service';

@Controller('teacher-preferences')
export class TeacherPreferencesController {
  constructor(
    private readonly teacherPreferencesService: TeacherPreferencesService,
  ) {}

  @Post()
  @Roles(EUserRole.ADMIN, EUserRole.COORDINADOR_AREA, EUserRole.RRHH)
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('')
  @ApiBody({
    type: CreateTeacherPreferenceDto,
    description: '',
  })
  @ApiCommonResponses({
    summary: '',
    createdDescription: '',
  })
  create(@Body() createTeacherPreferenceDto: CreateTeacherPreferenceDto) {
    return this.teacherPreferencesService.create(createTeacherPreferenceDto);
  }

  // @Post('my')
  // @HttpCode(HttpStatus.CREATED)
  // @ResponseMessage('')
  // @UseInterceptors(ExtractIdInterceptor)
  // @ApiBody({
  //   type: CreateTeacherPreferenceDto,
  //   description: '',
  // })
  // @ApiCommonResponses({
  //   summary: '',
  //   createdDescription: '',
  // })
  // createMyTeacherPreferenceProfile(
  //   @GetCurrentUserId() userId: string,
  //   @Body() createTeacherPreferenceDto: CreateTeacherPreferenceDto,
  // ) {
  //   return this.teacherPreferencesService.create(createTeacherPreferenceDto);
  // }

  @Get()
  @Roles(
    EUserRole.ADMIN,
    EUserRole.COORDINADOR_AREA,
    EUserRole.RRHH,
    EUserRole.DIRECCION,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('')
  @ApiPagination({
    summary: '',
    description: '',
  })
  @ApiCommonResponses({
    summary: '',
    okDescription: '',
  })
  findAll(@Query() query: QueryPaginationDto) {
    return this.teacherPreferencesService.findAllWithPagination(query);
  }

  @Get('user/:id')
  @Roles(
    EUserRole.ADMIN,
    EUserRole.COORDINADOR_AREA,
    EUserRole.RRHH,
    EUserRole.DIRECCION,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('')
  @ApiCommonResponses({
    summary: '',
    okDescription: '',
  })
  findTeacherPreferenceByUserId(@Param('id', ValidateIdPipe) id: string) {
    return this.teacherPreferencesService.findOneByUserId(id);
  }

  @Get('my')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('')
  @ApiCommonResponses({
    summary: '',
    createdDescription: '',
  })
  getCurrentProfile(@GetCurrentUserId() userId: string) {
    return this.teacherPreferencesService.findOneByUserId(userId);
  }

  @Get(':id')
  @Roles(
    EUserRole.ADMIN,
    EUserRole.COORDINADOR_AREA,
    EUserRole.RRHH,
    EUserRole.DIRECCION,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('')
  @ApiCommonResponses({
    summary: '',
    okDescription: '',
  })
  findOne(@Param('id', ValidateIdPipe) id: string) {
    return this.teacherPreferencesService.findOne(id);
  }

  // @Patch(':id')
  // @Roles(EUserRole.ADMIN, EUserRole.COORDINADOR_AREA, EUserRole.RRHH)
  // @HttpCode(HttpStatus.OK)
  // @ResponseMessage('')
  // @ApiBody({
  //   type: UpdateTeacherPreferenceDto,
  //   description: '',
  // })
  // @ApiCommonResponses({
  //   summary: '',
  //   okDescription: '',
  // })
  // update(
  //   @Param('id', ValidateIdPipe) id: string,
  //   @Body() updateTeacherPreferenceDto: UpdateTeacherPreferenceDto,
  // ) {
  //   return this.teacherPreferencesService.update(
  //     id,
  //     updateTeacherPreferenceDto,
  //   );
  // }

  @Delete(':id')
  @Roles(EUserRole.ADMIN, EUserRole.COORDINADOR_AREA, EUserRole.RRHH)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('')
  @ApiCommonResponses({
    summary: '',
    okDescription: '',
  })
  remove(@Param('id', ValidateIdPipe) id: string) {
    return this.teacherPreferencesService.remove(id);
  }
}
