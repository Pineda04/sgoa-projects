import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Observable } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import {
  CourseInfoDto,
  CreatePlanificatorAiDto,
} from '../dto/create-planificator-ai.dto';
import { roundToNearestHours } from 'date-fns';
import { envs } from 'src/config';

@Injectable()
export class PlanificatorAiService {
  private host = `${envs.planificatorAiHost}`;

  private days = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE'];
  private STRIPES_FALLBACK = [
    // Lunes
    { id: 'LUN_0600', descripcion: 'Lunes 06:00-07:00' },
    { id: 'LUN_0700', descripcion: 'Lunes 07:00-08:00' },
    { id: 'LUN_0800', descripcion: 'Lunes 08:00-09:00' },
    { id: 'LUN_0900', descripcion: 'Lunes 09:00-10:00' },
    { id: 'LUN_1000', descripcion: 'Lunes 10:00-11:00' },
    { id: 'LUN_1100', descripcion: 'Lunes 11:00-12:00' },
    { id: 'LUN_1400', descripcion: 'Lunes 14:00-15:00' },
    { id: 'LUN_1500', descripcion: 'Lunes 15:00-16:00' },
    { id: 'LUN_1600', descripcion: 'Lunes 16:00-17:00' },
    { id: 'LUN_1700', descripcion: 'Lunes 17:00-18:00' },
    { id: 'LUN_1800', descripcion: 'Lunes 18:00-19:00' },
    { id: 'LUN_1900', descripcion: 'Lunes 19:00-20:00' },
    { id: 'LUN_2000', descripcion: 'Lunes 20:00-21:00' },

    // Martes
    { id: 'MAR_0600', descripcion: 'Martes 06:00-07:00' },
    { id: 'MAR_0700', descripcion: 'Martes 07:00-08:00' },
    { id: 'MAR_0800', descripcion: 'Martes 08:00-09:00' },
    { id: 'MAR_0900', descripcion: 'Martes 09:00-10:00' },
    { id: 'MAR_1000', descripcion: 'Martes 10:00-11:00' },
    { id: 'MAR_1100', descripcion: 'Martes 11:00-12:00' },
    { id: 'MAR_1400', descripcion: 'Martes 14:00-15:00' },
    { id: 'MAR_1500', descripcion: 'Martes 15:00-16:00' },
    { id: 'MAR_1600', descripcion: 'Martes 16:00-17:00' },
    { id: 'MAR_1700', descripcion: 'Martes 17:00-18:00' },
    { id: 'MAR_1800', descripcion: 'Martes 18:00-19:00' },
    { id: 'MAR_1900', descripcion: 'Martes 19:00-20:00' },
    { id: 'MAR_2000', descripcion: 'Martes 20:00-21:00' },

    // Miércoles
    { id: 'MIE_0600', descripcion: 'Miércoles 06:00-07:00' },
    { id: 'MIE_0700', descripcion: 'Miércoles 07:00-08:00' },
    { id: 'MIE_0800', descripcion: 'Miércoles 08:00-09:00' },
    { id: 'MIE_0900', descripcion: 'Miércoles 09:00-10:00' },
    { id: 'MIE_1000', descripcion: 'Miércoles 10:00-11:00' },
    { id: 'MIE_1100', descripcion: 'Miércoles 11:00-12:00' },
    { id: 'MIE_1400', descripcion: 'Miércoles 14:00-15:00' },
    { id: 'MIE_1500', descripcion: 'Miércoles 15:00-16:00' },
    { id: 'MIE_1600', descripcion: 'Miércoles 16:00-17:00' },
    { id: 'MIE_1700', descripcion: 'Miércoles 17:00-18:00' },
    { id: 'MIE_1800', descripcion: 'Miércoles 18:00-19:00' },
    { id: 'MIE_1900', descripcion: 'Miércoles 19:00-20:00' },
    { id: 'MIE_2000', descripcion: 'Miércoles 20:00-21:00' },

    // Jueves
    { id: 'JUE_0600', descripcion: 'Jueves 06:00-07:00' },
    { id: 'JUE_0700', descripcion: 'Jueves 07:00-08:00' },
    { id: 'JUE_0800', descripcion: 'Jueves 08:00-09:00' },
    { id: 'JUE_0900', descripcion: 'Jueves 09:00-10:00' },
    { id: 'JUE_1000', descripcion: 'Jueves 10:00-11:00' },
    { id: 'JUE_1100', descripcion: 'Jueves 11:00-12:00' },
    { id: 'JUE_1400', descripcion: 'Jueves 14:00-15:00' },
    { id: 'JUE_1500', descripcion: 'Jueves 15:00-16:00' },
    { id: 'JUE_1600', descripcion: 'Jueves 16:00-17:00' },
    { id: 'JUE_1700', descripcion: 'Jueves 17:00-18:00' },
    { id: 'JUE_1800', descripcion: 'Jueves 18:00-19:00' },
    { id: 'JUE_1900', descripcion: 'Jueves 19:00-20:00' },
    { id: 'JUE_2000', descripcion: 'Jueves 20:00-21:00' },

    // Viernes
    { id: 'VIE_0600', descripcion: 'Viernes 06:00-07:00' },
    { id: 'VIE_0700', descripcion: 'Viernes 07:00-08:00' },
    { id: 'VIE_0800', descripcion: 'Viernes 08:00-09:00' },
    { id: 'VIE_0900', descripcion: 'Viernes 09:00-10:00' },
    { id: 'VIE_1000', descripcion: 'Viernes 10:00-11:00' },
    { id: 'VIE_1100', descripcion: 'Viernes 11:00-12:00' },
    { id: 'VIE_1400', descripcion: 'Viernes 14:00-15:00' },
    { id: 'VIE_1500', descripcion: 'Viernes 15:00-16:00' },
    { id: 'VIE_1600', descripcion: 'Viernes 16:00-17:00' },
    { id: 'VIE_1700', descripcion: 'Viernes 17:00-18:00' },
    { id: 'VIE_1800', descripcion: 'Viernes 18:00-19:00' },
    { id: 'VIE_1900', descripcion: 'Viernes 19:00-20:00' },
    { id: 'VIE_2000', descripcion: 'Viernes 20:00-21:00' },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  health(): Observable<AxiosResponse<string>> {
    // NOTE: With Observable
    // https://docs.nestjs.com/techniques/http-module
    return this.httpService.get(`${this.host}`);

    // NOTE: Using Axios directly
    // const res = await this.httpService.axiosRef.get(
    //   `${process.env.PLANIFICATOR_AI_HOST}`,
    // );
    // console.log(res);
    // return res;
  }

  async create(
    createPlanificatorAiDto: CreatePlanificatorAiDto,
  ): Promise<Observable<AxiosResponse<unknown>> | string> {
    const data = await this.assembleDatasetFallback(createPlanificatorAiDto);

    return this.httpService.post(`${this.host}/planificar`, data);
  }

  private async assembleDatasetFallback(dto: CreatePlanificatorAiDto) {
    const [docentes, secciones, aulas] = await Promise.all([
      this.getTeachersFallback(dto.centerDepartmentId),
      this.getCoursesFallback(dto.courses, dto.centerDepartmentId),
      this.getClassroomsFallback(),
    ]);

    return {
      docentes,
      secciones,
      aulas,
      franjas_horarias: this.STRIPES_FALLBACK,
    };
  }

  private async getTeachersFallback(centerDepartmentId: string) {
    const teachers = await this.prisma.teacher.findMany({
      where: {
        positionHeld: {
          some: {
            centerDepartmentId,
          },
        },
        shiftEnd: {
          not: null,
        },
        shiftStart: {
          not: null,
        },
      },
      relationLoadStrategy: 'join',
      include: {
        user: true,
        contractType: true,
        preferredClasses: {
          select: {
            course: { select: { code: true } },
          },
        },
      },
    });

    if (!teachers.length)
      throw new NotFoundException(
        'No se encontraron datos de docentes válidos, todos los docentes deben tener su horario/jornada ingresada para ser tomados en cuenta.',
      );

    return teachers.map((t) => ({
      id: t.id,
      nombre: t.user.name ?? t.id,
      tipo_contrato: this.normalizeTextPlanificator(t.contractType.name),
      carga_maxima_uv: (t as any).carga_maxima_uv ?? 12,
      horario_disponible: this.horaryMap(t.shiftStart!, t.shiftEnd!),
      preferencias: Array.from(
        new Set(t.preferredClasses.flatMap((pc) => pc.course.code)),
      ),
    }));
  }

  private async getCoursesFallback(
    coursesSelected: CourseInfoDto[],
    centerDepartmentId: string,
  ) {
    const courses = await this.prisma.course.findMany({
      where: {
        department: {
          centers: {
            every: {
              id: centerDepartmentId,
            },
          },
        },
        id: {
          in: coursesSelected.map((c) => c.courseId),
        },
      },
    });

    if (!courses.length)
      throw new BadRequestException(
        'Las clases seleccionadas no son válidas o no pertenecen al departamento/área/carrera seleccionado.',
      );

    return courses.map((cc, index) => ({
      id: `${cc.id}|${index}`,
      id_asignatura: `${cc.code}_${index}`,
      nombre_asignatura: cc.name,
      codigo_asignatura: cc.code,
      unidades_valorativas: cc.uvs,
      requiere_lab: coursesSelected.find((c) => c.courseId === cc.id)
        ?.labRequired,
      alumnos_matriculados: coursesSelected.find((c) => c.courseId === cc.id)
        ?.estimatedStudentsCount,
    }));
  }

  private async getClassroomsFallback() {
    const classrooms = await this.prisma.classroom.findMany({
      include: { roomType: true, building: true },
    });

    return classrooms.map((c) => ({
      id: c.name,
      tipo: this.normalizeTextPlanificator(c.roomType?.description) ?? 'NORMAL',
      capacidad: c.maxCapacity ?? c.desks ?? 30,
    }));
  }

  private horaryMap(shiftStart: Date, shiftEnd: Date) {
    const dateStart = roundToNearestHours(shiftStart);
    const dateEnd = roundToNearestHours(shiftEnd);

    // return (
    //   d.getUTCHours().toString().padStart(2, '0') +
    //   ':' +
    //   d.getUTCMinutes().toString().padStart(2, '0')
    // );

    // const parseShiftStart = dateToHHMM(shiftStart);
    // const parseShiftEnd = dateToHHMM(shiftEnd);

    const result: string[] = [];

    for (const day of this.days) {
      for (
        let index = dateStart.getUTCHours();
        index <= dateEnd.getUTCHours() - 1;
        index++
      ) {
        result.push(
          `${day}_${index.toString().padStart(2, '0').padEnd(4, '0')}`,
        );
      }
    }

    return result;
  }

  private normalizeTextPlanificator = (text: string): string =>
    text.toString().trim().toUpperCase().split(' ').join('_');
}
