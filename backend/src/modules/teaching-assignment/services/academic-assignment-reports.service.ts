import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AcademicAssignmentDto,
  CreateAcademicAssignmentReportDto,
  CreateTeachingSessionDto,
  UpdateAcademicAssignmentReportDto,
} from '../dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  TCreateAcademicAssignmentReport,
  TAcademicAssignmentReport,
  TUpdateAcademicAssignmentReport,
  TPacModality,
  TAcademicPeriod,
  TAcademicAssignmentReportFileView,
} from '../types';
import { TeachersService } from 'src/modules/teachers/services/teachers.service';
import { AcademicPeriodsService } from './academic-periods.service';
import { normalizeText, paginate, paginateOutput } from 'src/common/utils';
import { IPaginateOutput } from 'src/common/interfaces';
import { QueryPaginationDto } from 'src/common/dto';
import { CoursesService } from 'src/modules/course-classrooms/services/courses.service';
import {
  TCourseClassroomSelectPeriod,
  TCreateCourseClassroom,
  TModality,
} from 'src/modules/course-classrooms/types';
import { ModalitiesService } from 'src/modules/course-classrooms/services/modalities.service';
import { EClassModality } from 'src/modules/course-classrooms/enums';
import { formatISO } from 'date-fns';
import { ClassroomService } from 'src/modules/infraestructure/services/classroom.service';
import { TeachingSessionsService } from './teaching-sessions.service';
import { CourseClassroomsService } from 'src/modules/course-classrooms/services/course-classrooms.service';
import { Classroom, Course, Prisma, User } from 'src/generated/prisma/client';
import { TCustomOmit } from 'src/common/types';
import { TComplementaryActivity } from 'src/modules/complementary-activities/types';
import { EPosition } from 'src/modules/teachers-config/enums';
import { PositionsService } from 'src/modules/teachers-config/services/positions.service';
import { CreateTeacherDepartmentPositionDto } from 'src/modules/teachers/dto/create-teacher-department-position.dto';
import { TeacherDepartmentPositionService } from 'src/modules/teachers/services/teacher-department-position.service';
import { TCenterJoin, TDepartment } from 'src/modules/centers/types';
import { CenterDepartmentsService } from 'src/modules/centers/services/center-departments.service';
import { CentersService } from 'src/modules/centers/services/centers.service';

interface IParsedTitle {
  year: number;
  pac: number;
  pac_modality: TPacModality;
  title: string;
}

type TGroupedCoursesByTeacher = Record<
  string,
  Omit<TAcademicAssignmentReport, 'id'> & {
    userId: string;
    courses: TCreateCourseClassroom[];
  }
>;

type TCommonFindResponse<T> = [T | null, string];

@Injectable()
export class AcademicAssignmentReportsService {
  private readonly includeOptionsAAR = {
    period: true,
    teacher: {
      select: {
        id: true,
        user: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    },
    centerDepartment: {
      select: {
        id: true,
        centerId: true,
        departmentId: true,
        center: {
          select: {
            name: true,
          },
        },
        department: {
          select: {
            name: true,
          },
        },
      },
    },
    teachingSession: {
      include: {
        courseClassrooms: {
          // select: {
          //   id: true,
          //   courseId: true,
          //   classroomId: true,
          //   section: true,
          //   days: true,
          //   studentCount: true,
          //   groupCode: true,
          //   nearGraduation: true,
          //   observation: true,
          //   modality: true,
          // },
          omit: {
            teachingSessionId: true,
            modalityId: true,
          },
          include: {
            modality: true,
            course: true,
            courseStadistic: true,
          },
        },
      },
    },
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly academicPeriodsService: AcademicPeriodsService,
    private readonly teachersService: TeachersService,
    private readonly teacherDepartmentPositionService: TeacherDepartmentPositionService,
    private readonly positionsService: PositionsService,
    private readonly centersService: CentersService,
    private readonly coursesService: CoursesService,
    private readonly modalitiesService: ModalitiesService,
    private readonly classroomService: ClassroomService,
    private readonly teachingSessionsService: TeachingSessionsService,
    private readonly courseClassroomsService: CourseClassroomsService,
    private readonly centerDepartmentsService: CenterDepartmentsService,
  ) {}

  async create(
    createAcademicAssignmentReportDto: CreateAcademicAssignmentReportDto,
  ): Promise<TCreateAcademicAssignmentReport> {
    const { userId, centerDepartmentId, periodId } =
      createAcademicAssignmentReportDto;

    const currentDate = formatISO(new Date().toISOString());
    const teacher = await this.teachersService.findOneByUserId(userId);

    // Primero verificamos si el docente pertenece al departamento
    // es decir buscamos si el docente esta asignado a ese departamento
    // si no lo esta, lo creamos con cargo academico "ninguno" y fecha de inicio
    // el mismo dia de la creacion del informe
    const existingTeacherDeptPos =
      await this.teacherDepartmentPositionService.findOneByTeacherCodeAndCenterDepartmentId(
        teacher.code,
        centerDepartmentId,
      );

    // no existe el docente en el departamento, por lo que se crea un nuevo informe
    if (!existingTeacherDeptPos) {
      const positionId = (
        await this.positionsService.findOneByName(EPosition.NONE as string)
      ).id;

      const dto = {
        userId,
        centerDepartmentId,
        positionId,
        startDate: currentDate,
      } as CreateTeacherDepartmentPositionDto;

      await this.teacherDepartmentPositionService.create(dto);
    }

    const newAcademicAssignmentReport =
      await this.prisma.academicAssignmentReport.create({
        data: {
          teacherId: teacher.id,
          centerDepartmentId,
          periodId,
          teachingSession: {
            create: {
              consultHour: currentDate, // Fecha actual
              // +1 hour
              tutoringHour: formatISO(
                new Date(currentDate).getTime() + 3600000,
              ),
            },
          },
        },
        select: {
          id: true,
          teacherId: true,
          centerDepartmentId: true,
          periodId: true,
          teachingSession: true,
        },
      });

    return newAcademicAssignmentReport;
  }

  async findAll(): Promise<TAcademicAssignmentReport[]> {
    const academicAssignmentReports =
      await this.prisma.academicAssignmentReport.findMany({
        relationLoadStrategy: 'join',
        include: {
          teachingSession: {
            include: {
              courseClassrooms: true,
            },
          },
        },
      });

    return academicAssignmentReports;
  }

  async findAllWithPagination(
    query: QueryPaginationDto,
  ): Promise<IPaginateOutput<TAcademicAssignmentReport>> {
    const [academicAssignmentReports, count] = await Promise.all([
      this.prisma.academicAssignmentReport.findMany({
        ...paginate(query),
        relationLoadStrategy: 'join',
        include: this.includeOptionsAAR,
        omit: {
          teacherId: true,
          centerDepartmentId: true,
        },
      }),
      this.prisma.academicAssignmentReport.count(),
    ]);

    return paginateOutput<TAcademicAssignmentReport>(
      academicAssignmentReports,
      count,
      query,
    );
  }

  async findAllByUserIdAndCode(
    query: QueryPaginationDto,
    user: {
      userId?: string;
      code?: string;
    },
  ): Promise<IPaginateOutput<TAcademicAssignmentReport>> {
    // const teacher = await this.teachersService.findOneByUserId(userId);
    const { userId, code } = user;

    const [academicAssignmentReports, count] = await Promise.all([
      this.prisma.academicAssignmentReport.findMany({
        where: {
          teacher: {
            OR: [
              {
                userId,
              },
              {
                user: {
                  code: code ? normalizeText(code) : undefined,
                },
              },
            ],
          },
        },
        ...paginate(query),
        relationLoadStrategy: 'join',
        include: this.includeOptionsAAR,
        omit: {
          teacherId: true,
          centerDepartmentId: true,
        },
      }),
      this.prisma.academicAssignmentReport.count({
        where: {
          teacher: {
            userId,
          },
        },
      }),
    ]);

    if (count === 0)
      throw new NotFoundException(
        `No se encontraron informes de asignación académica para el usuario con ID <${userId}>.`,
      );

    return paginateOutput<TAcademicAssignmentReport>(
      academicAssignmentReports,
      count,
      query,
    );
  }

  async findAllByCenterDepartmentId(
    query: QueryPaginationDto,
    centerDepartmentId: string,
  ): Promise<IPaginateOutput<TAcademicAssignmentReport>> {
    await this.centerDepartmentsService.findOne(centerDepartmentId);

    const where = {
      centerDepartmentId,
    };

    const [academicAssignmentReports, count] = await Promise.all([
      this.prisma.academicAssignmentReport.findMany({
        where,
        ...paginate(query),
        relationLoadStrategy: 'join',
        include: this.includeOptionsAAR,
        omit: {
          teacherId: true,
        },
      }),
      this.prisma.academicAssignmentReport.count({
        where,
      }),
    ]);

    return paginateOutput<TAcademicAssignmentReport>(
      academicAssignmentReports,
      count,
      query,
    );
  }

  // Para no inicializar el teacherDepartmentPositionService en el controller
  async findAllByCoordinator(
    query: QueryPaginationDto,
    userId: string,
    centerDepartmentId: string,
  ) {
    // Validacion
    await this.teacherDepartmentPositionService.findOneDepartmentHeadByUserIdAndCenterDepartment(
      userId,
      centerDepartmentId,
    );

    return await this.findAllByCenterDepartmentId(query, centerDepartmentId);
  }

  async findAllByCoordinatorOnlyPeriods(
    query: QueryPaginationDto,
    userId: string,
    centerDepartmentId: string,
  ): Promise<
    IPaginateOutput<
      TAcademicPeriod & { title: string; centerDepartmentId: string }
    >
  > {
    const user =
      await this.teacherDepartmentPositionService.findOneDepartmentHeadByUserIdAndCenterDepartment(
        userId,
        centerDepartmentId,
      );

    // Periodos donde existen reportes y que sean del departamento del usuario.
    const [periods, count] = await Promise.all([
      this.prisma.academicAssignmentReport.findMany({
        ...paginate(query),
        distinct: ['periodId'],
        where: {
          centerDepartmentId,
        },
        relationLoadStrategy: 'join',
        select: {
          period: true,
          centerDepartmentId: true,
        },
      }),
      this.prisma.academicAssignmentReport
        .findMany({
          distinct: ['periodId'],
          where: {
            centerDepartmentId: user.centerDepartmentId,
          },
          select: {
            periodId: true,
          },
        })
        .then((results) => results.length),
    ]);

    if (count === 0)
      throw new BadRequestException(
        `No se encontraron planificaciones académica para el departamento <${user.centerDepartment.department.name}>.`,
      );

    const mapped = periods.map(({ period, centerDepartmentId }) => ({
      ...period,
      title: `PAC No. ${period.pac}, ${period.pac_modality}, ${period.year}`,
      centerDepartmentId,
    }));

    return paginateOutput(mapped, count, query);
  }

  async findOne(id: string): Promise<TAcademicAssignmentReport> {
    const academicAssignmentReport =
      await this.prisma.academicAssignmentReport.findUnique({
        where: {
          id,
        },
        relationLoadStrategy: 'join',
        include: {
          ...this.includeOptionsAAR,
          complementaryActivities: {
            include: {
              verificationMedia: {
                include: {
                  verificationMediaFiles: true,
                },
              },
              activityType: true,
            },
          },
        },
        omit: {
          teacherId: true,
          centerDepartmentId: true,
        },
      });

    if (!academicAssignmentReport)
      throw new NotFoundException(
        `La asignación académica con id <${id}> no fue encontrada.`,
      );

    return academicAssignmentReport;
  }

  async findAllUserIdOnlyPeriods(userId: string) {
    const academicAssignmentReports =
      await this.prisma.academicAssignmentReport.findMany({
        where: {
          teacher: {
            userId,
          },
        },
        select: {
          id: true,
          period: true,
          centerDepartment: {
            select: {
              id: true,
              centerId: true,
              departmentId: true,
              center: {
                select: {
                  name: true,
                },
              },
              department: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

    if (academicAssignmentReports.length === 0)
      throw new BadRequestException(
        `No se encontraron informes de asignación académica para el usuario con id <${userId}>`,
      );

    return academicAssignmentReports.map((p) => ({
      ...p.period,
      reportId: p.id,
      centerDepartmentId: p.centerDepartment.id,
      center: p.centerDepartment.center.name,
      department: p.centerDepartment.department.name,
    }));
  }

  async findOneByUserIdAndPeriodIdAndCenterDepartmentId(
    user: {
      userId?: string;
      code?: string;
    },
    periodId: string,
    centerDepartmentId: string,
  ): Promise<
    TAcademicAssignmentReport & {
      complementaryActivities: TComplementaryActivity[];
    }
  > {
    // const teacher = await this.teachersService.findOneByUserId(userId);
    const { userId, code } = user;

    const existsPeriod = await this.academicPeriodsService.findOne(periodId);

    const academicAssignmentReport =
      await this.prisma.academicAssignmentReport.findFirst({
        where: {
          teacher: {
            OR: [
              {
                userId,
              },
              {
                user: {
                  code: code ? normalizeText(code) : undefined,
                },
              },
            ],
          },
          periodId,
          centerDepartmentId,
        },
        relationLoadStrategy: 'join',
        include: {
          ...this.includeOptionsAAR,
          complementaryActivities: {
            include: {
              verificationMedia: {
                include: {
                  verificationMediaFiles: true,
                },
              },
              activityType: true,
            },
          },
          // teachingSessions: {
          //   include: {
          //     courseClassrooms: {
          //       include: {
          //         course: true,
          //         courseStadistics: true,
          //       },
          //     },
          //   },
          // },
        },
        omit: {
          teacherId: true,
          centerDepartmentId: true,
        },
      });

    if (!academicAssignmentReport)
      throw new NotFoundException(
        `No se encontraron informes de asignación académica para el usuario con ID <${userId}> en el periodo <${periodId}>.`,
      );

    return academicAssignmentReport;
  }

  async findOneByCoordinatorAndPeriodId(
    query: QueryPaginationDto,
    userId: string,
    centerDepartmentId: string,
    periodId?: string,
    teacherId?: string,
  ): Promise<
    IPaginateOutput<
      TCustomOmit<
        TAcademicAssignmentReport,
        'centerDepartment' | 'teachingSession'
      >
    >
  > {
    // Validacion
    await this.teacherDepartmentPositionService.findOneDepartmentHeadByUserIdAndCenterDepartment(
      userId,
      centerDepartmentId,
    );

    const where = {
      periodId,
      centerDepartmentId,
      // ...(teacherId ? { teacherId } : {}),
      teacherId,
    };

    const [academicAssignmentReports, count] = await Promise.all([
      this.prisma.academicAssignmentReport.findMany({
        ...paginate(query),
        where,
        relationLoadStrategy: 'join',
        include: {
          period: this.includeOptionsAAR.period,
          teacher: this.includeOptionsAAR.teacher,
        },
        omit: {
          teacherId: true,
          centerDepartmentId: true,
        },
      }),
      this.prisma.academicAssignmentReport.count({ where }),
    ]);

    if (!academicAssignmentReports.length)
      throw new NotFoundException(
        'No se encontraron asignaciones académicas para el periodo y docente seleccionado.',
      );

    return paginateOutput<
      TCustomOmit<
        TAcademicAssignmentReport,
        'centerDepartment' | 'teachingSession'
      >
    >(academicAssignmentReports, count, query);
  }

  async update(
    id: string,
    updateAcademicAssignmentReportDto: UpdateAcademicAssignmentReportDto,
  ): Promise<TUpdateAcademicAssignmentReport> {
    const academicAssignmentReportUpdate =
      await this.prisma.academicAssignmentReport.update({
        where: {
          id,
        },
        data: {
          ...updateAcademicAssignmentReportDto,
        },
      });

    return academicAssignmentReportUpdate;
  }

  async remove(id: string): Promise<TAcademicAssignmentReport> {
    const academicAssignmentReportDelete =
      await this.prisma.academicAssignmentReport.delete({
        where: {
          id,
        },
      });

    return academicAssignmentReportDelete;
  }

  async removeAll(id: string): Promise<Prisma.BatchPayload> {
    const academicAssignmentReportDelete =
      await this.prisma.academicAssignmentReport.deleteMany({
        where: {
          periodId: id, // Elimina todos los informes del periodo académico
        },
      });

    return academicAssignmentReportDelete;
  }

  parsedTitleFromExcel(subtitle: string) {
    return this.parseAcademicTitle(subtitle);
  }

  // parsedData
  async parsedData(
    allData: AcademicAssignmentDto[],
    centerDepartmentId: string,
    currentUserId: string,
    parseAcademicTitle?: {
      year: number;
      pac: number;
      pac_modality: TPacModality;
      title: string;
    },
  ) {
    const coordinator =
      await this.teacherDepartmentPositionService.findOneDepartmentHeadByUserIdAndCenterDepartment(
        currentUserId,
        centerDepartmentId,
      );

    await this.academicPeriodsService.currentAcademicPeriod(
      parseAcademicTitle && parseAcademicTitle.pac_modality,
    );
    const academicPeriod =
      await this.academicPeriodsService.getNextAcademicPeriod(
        await this.academicPeriodsService.currentAcademicPeriod(),
      );

    const academicPeriodTitle = `Periodo Académico No. ${academicPeriod.pac}, ${academicPeriod.pac_modality}, ${academicPeriod.year}`;

    // En cuestion de rendimiento, es mejor hacer las consultas
    // de todos los datos necesarios antes de iterar sobre el archivo
    // y no hacer una consulta cada vez que se itere sobre un item
    // Aca se evita realizar hasta quiza +100 consultas a la base de datos
    const [
      teachers,
      allCourses,
      modalities,
      existingCourseClassrooms,
      classrooms,
    ] = await Promise.all([
      // this.teachersService.findAll(),
      this.prisma.user.findMany({
        where: {
          code: {
            in: allData.map((u) => u.teacherCode.toString()),
          },
        },
        relationLoadStrategy: 'join',
        include: {
          teacher: {
            select: {
              id: true,
            },
          },
        },
      }),
      // this.coursesService.findAllByCenterDepartmentId(centerDepartmentId),
      this.prisma.course.findMany({
        where: {
          code: {
            in: allData.map((u) =>
              normalizeText(u.courseCode.toString().replace(/-/g, '')),
            ),
          },
          department: {
            centers: {
              every: {
                id: centerDepartmentId,
              },
            },
          },
          activeStatus: true,
        },
      }),
      this.modalitiesService.findAll(),
      this.courseClassroomsService.findAllWithSelectAndPeriodId(
        academicPeriod.id,
      ),
      this.prisma.classroom.findMany({
        where: {
          OR: allData.map((u) => ({
            classroomInfoView: {
              normalizedName: {
                contains: normalizeText(u.classroomName),
                mode: 'insensitive',
              },
            },
          })),
        },
        relationLoadStrategy: 'join',
        include: {
          roomType: {
            select: {
              description: true,
            },
          },
        },
      }),
    ]);

    const teacherMap = new Map(teachers.map((t) => [t.code, t]));
    // const courseSet = new Set(allCourses.map((c) => c.code));
    const courseMap = new Map<string, Course>(
      allCourses.map((c) => [c.code, c]),
    );
    const classroomMap = new Map(
      classrooms.map((c) => [normalizeText(c.name), c]),
    );

    const existingCourseClassroomsMap = new Map<
      string,
      TCourseClassroomSelectPeriod
    >();
    existingCourseClassrooms.forEach((cc) => {
      const key = `${cc.teachingSession.assignmentReport.teacher.user.code}|${cc.course.code}|${cc.days}`;
      existingCourseClassroomsMap.set(key, cc);
    });

    const existingCourseClassroomsTeacherMap = new Map<
      string,
      TCourseClassroomSelectPeriod[]
    >();
    existingCourseClassrooms.forEach((cc) => {
      const key = cc.teachingSession.assignmentReport.teacher.user.code;

      if (!existingCourseClassroomsTeacherMap.has(key)) {
        existingCourseClassroomsTeacherMap.set(key, []);
      }

      existingCourseClassroomsTeacherMap.get(key)?.push(cc);
    });

    const classroomNotAvailableMap = new Map<
      string,
      {
        daysSet: Set<string>;
        days: string;
        courseName: string;
        teacherCode: string;
      }[]
    >();

    for (const cc of existingCourseClassrooms) {
      const key = `${cc.section}|${normalizeText(cc.classroom.name)}`;
      const daysSet = new Set(cc.days.match(/.{1,2}/g) || []);

      if (!classroomNotAvailableMap.has(key)) {
        classroomNotAvailableMap.set(key, []);
      }
      classroomNotAvailableMap.get(key)!.push({
        daysSet,
        days: cc.days,
        courseName: cc.course.name,
        teacherCode: cc.teachingSession.assignmentReport.teacher.user.code,
      });
    }

    // const currentCourseClassroomSet = new Set(
    //   allData.map(
    //     (cc) => `${cc.teacherCode}|${cc.courseCode}|${cc.section}|${cc.days}`,
    //   ),
    // );

    const currentCourseClassroomSetMap = allData.reduce(
      (acc, cc, index) => {
        const key = `${cc.teacherCode}|${cc.courseCode}|${cc.section}|${cc.days}`;

        if (!acc.set.has(key)) {
          acc.set.add(key);
          acc.items.push({ ...cc, originalIndex: index });
        }

        return acc;
      },
      {
        set: new Set<string>(),
        items: [] as ((typeof allData)[number] & { originalIndex: number })[],
      },
    );

    const modalitySet = new Map(
      modalities.map((m) => [normalizeText(m.name).replace(/-/g, ''), m]),
    );

    type TItemWithIndex = AcademicAssignmentDto & { originalIndex: number };

    const currentArrayClassroomMap = new Map<
      string,
      { daysSet: Set<string>; item: TItemWithIndex }[]
    >();

    const coursesGroupByTeacherCodeEntries: Record<
      string,
      Omit<TAcademicAssignmentReport, 'id'> & {
        userId: string;
        courses: TCreateCourseClassroom[];
      }
    > = {};
    const coursesArray: TAcademicAssignmentReportFileView[] = [];

    const validElements: TItemWithIndex[] = [];
    const invalidElements: (TItemWithIndex & { errors: string[] })[] = [];
    const itemsToInvalidate: Set<number> = new Set();

    for (const item of currentCourseClassroomSetMap.items) {
      const errors: string[] = [];
      // item.coordinator = coordinatorInfo.teacher.user.name;
      // item.center = coordinatorInfo.centerDepartment.center.name;

      item.coordinator = coordinator.teacher.user.name;
      item.center = coordinator.centerDepartment.center.name;
      item.departmentName = coordinator.centerDepartment.department.name;
      item.courseCode = normalizeText(item.courseCode.replace(/-/g, ''));
      item.nearGraduation = item.nearGraduation ?? false;

      const dayError = this.validateDays(item.days);

      if (dayError) errors.push(dayError);

      const [teacher, teacherError] = this.findTeacher(
        teacherMap,
        item.teacherCode,
      );

      if (!teacher) errors.push(teacherError);
      if (teacher) item.teacherName = teacher.name;

      const [course, courseError] = this.findCourse(
        courseMap,
        item.courseCode,
        item.departmentName,
      );

      if (!course) errors.push(courseError);
      if (course) item.courseName = course.name;

      const [classroom, classroomError] = this.findClassroom(
        classroomMap,
        item.classroomName,
      );

      if (!classroom) errors.push(classroomError);

      // const existingCourseClassroom = existingCourseClassroomsMap.get(
      //   `${course.id}|${days}|${teacher.id}`,
      // );

      const [validateCourseClassroom, validateCourseClassroomError] =
        this.validateCourseClassroom(
          existingCourseClassroomsMap,
          item,
          academicPeriodTitle,
          academicPeriod.id,
        );

      if (!validateCourseClassroom && validateCourseClassroomError !== '')
        errors.push(validateCourseClassroomError);

      const [
        validateIfExistingAnotherCourseClassroom,
        validateIfExistingAnotherCourseClassroomError,
      ] = this.validateIfExistingAnotherCourseClassroom(
        existingCourseClassroomsTeacherMap,
        item.teacherCode,
        item,
        academicPeriodTitle,
      );
      if (
        !validateIfExistingAnotherCourseClassroom &&
        validateIfExistingAnotherCourseClassroomError !== ''
      )
        errors.push(validateIfExistingAnotherCourseClassroomError);

      const classroomKey = `${item.section}|${normalizeText(item.classroomName)}`;
      const occupiedSchedules = classroomNotAvailableMap.get(classroomKey);
      const itemDaysSet = new Set(item.days.match(/.{1,2}/g) || []);

      let hasOverlap = false;

      if (occupiedSchedules) {
        for (const occupied of occupiedSchedules) {
          const hasCommonDay = [...itemDaysSet].some((day) =>
            occupied.daysSet.has(day),
          );

          if (hasCommonDay) {
            hasOverlap = true;
            break;
          }
        }
      }

      if (
        classroom &&
        hasOverlap &&
        normalizeText(classroom.roomType.description) !==
          normalizeText(EClassModality.VIRTUAL_SPACE)
      ) {
        const occupiedInfo = occupiedSchedules?.find((o) =>
          [...itemDaysSet].some((day) => o.daysSet.has(day)),
        );

        const conflictInfo = occupiedInfo
          ? ` por <${occupiedInfo.courseName}> (${occupiedInfo.teacherCode})`
          : '';

        errors.push(
          `El salón de clase <${classroom.name}> ya se encuentra en uso${conflictInfo} los días <${item.days}> en la sección <${item.section}>.`,
        );
      }

      const currentArrayOccupied = currentArrayClassroomMap.get(classroomKey);

      if (classroom && currentArrayOccupied) {
        for (const occupied of currentArrayOccupied) {
          const hasCommonDay = [...itemDaysSet].some((day) =>
            occupied.daysSet.has(day),
          );

          if (hasCommonDay) {
            errors.push(
              `El salón de clase <${classroom.name}> ya se encuentra en uso por <${occupied.item.courseName}> (${occupied.item.teacherCode}) los días <${occupied.item.days}> en la sección <${occupied.item.section}>.`,
            );

            itemsToInvalidate.add(item.originalIndex);
            itemsToInvalidate.add(occupied.item.originalIndex);

            break;
          }
        }
      }

      const [modality, modalityError] = this.getModalityId(
        item.classroomName,
        modalitySet,
      );

      if (!modality) errors.push(modalityError);

      if (errors.length) {
        invalidElements.push({
          ...item,
          errors,
        });

        if (classroom) {
          if (!currentArrayClassroomMap.has(classroomKey)) {
            currentArrayClassroomMap.set(classroomKey, []);
          }

          currentArrayClassroomMap.get(classroomKey)!.push({
            daysSet: itemDaysSet,
            item: item,
          });
        }

        continue;
      }

      validElements.push({
        ...item,
      });

      if (!currentArrayClassroomMap.has(classroomKey)) {
        currentArrayClassroomMap.set(classroomKey, []);
      }
      currentArrayClassroomMap.get(classroomKey)!.push({
        daysSet: itemDaysSet,
        item: item,
      });

      if (!coursesGroupByTeacherCodeEntries[item.teacherCode]) {
        coursesGroupByTeacherCodeEntries[item.teacherCode] = {
          teacherId: teacher!.teacher!.id,
          userId: teacher!.id,
          centerDepartmentId,
          periodId: academicPeriod.id,
          courses: [],
        };
      }

      const courseElement = {
        courseId: course!.id,
        section: item.section,
        days: item.days.toString(),
        classroomId: classroom!.id,
        modalityId: modality!.id,
        studentCount: isNaN(parseInt(item.studentCount.toString()))
          ? 0
          : item.studentCount,
        groupCode: `${item.teacherCode}-${item.section}-${item.days}`, // Generamos un código de grupo único
        nearGraduation: item.nearGraduation,
        observation: item.observation || null, // Si no hay observación, se asigna
      };

      coursesGroupByTeacherCodeEntries[item.teacherCode].courses.push(
        courseElement,
      );

      coursesArray.push({
        userId: teacher!.id,
        teacherId: teacher!.teacher!.id,
        teacherCode: teacher!.code,
        teacherName: teacher!.name,
        courseCode: course!.code,
        courseName: course!.name,
        uv: course!.uvs,
        section: item.section,
        studentCount: isNaN(parseInt(item.studentCount.toString()))
          ? 0
          : item.studentCount,
        days: item.days.toString(),
        center: item.center,
        classroomName: classroom!.name,
        departmentName: item.departmentName,
        centerDepartmentId,
        coordinator: coordinator.teacher.user.name,
        observation: courseElement.observation,
        nearGraduation: item.nearGraduation,
      });
    }

    if (itemsToInvalidate.size > 0) {
      const remainingValidElements: typeof validElements = [];
      for (let i = 0; i < validElements.length; i++) {
        if (itemsToInvalidate.has(validElements[i].originalIndex)) {
          invalidElements.push({
            ...validElements[i],
            errors: [
              `Conflicto de horario con otro registro en el mismo archivo.`,
            ],
          });
        } else {
          remainingValidElements.push(validElements[i]);
        }
      }
      validElements.length = 0;
      validElements.push(...remainingValidElements);

      coursesArray.length = 0;
      for (const item of validElements) {
        const teacher = teacherMap.get(item.teacherCode.toString());
        const course = courseMap.get(item.courseCode);
        const classroom = classroomMap.get(normalizeText(item.classroomName));
        const modality = this.getModalityFromMap(
          item.classroomName,
          modalitySet,
        );

        if (!teacher || !course || !classroom || !modality) continue;

        const courseElement = {
          courseId: course.id,
          section: item.section,
          days: item.days.toString(),
          classroomId: classroom.id,
          modalityId: modality.id,
          studentCount: isNaN(parseInt(item.studentCount.toString()))
            ? 0
            : item.studentCount,
          groupCode: `${item.teacherCode}-${item.section}-${item.days}`,
          nearGraduation: item.nearGraduation,
          observation: item.observation || null,
        };

        if (!coursesGroupByTeacherCodeEntries[item.teacherCode]) {
          coursesGroupByTeacherCodeEntries[item.teacherCode] = {
            teacherId: teacher.teacher!.id,
            userId: teacher.id,
            centerDepartmentId,
            periodId: academicPeriod.id,
            courses: [],
          };
        }
        coursesGroupByTeacherCodeEntries[item.teacherCode].courses.push(
          courseElement,
        );

        coursesArray.push({
          userId: teacher.id,
          teacherId: teacher.teacher!.id,
          teacherCode: teacher.code,
          teacherName: teacher.name,
          courseCode: course.code,
          courseName: course.name,
          uv: course.uvs,
          section: item.section,
          studentCount: isNaN(parseInt(item.studentCount.toString()))
            ? 0
            : item.studentCount,
          days: item.days.toString(),
          center: item.center,
          classroomName: classroom.name,
          departmentName: item.departmentName,
          centerDepartmentId,
          coordinator: coordinator.teacher.user.name,
          observation: courseElement.observation,
          nearGraduation: item.nearGraduation,
        });
      }
    }

    return {
      coursesView: {
        pacId: academicPeriod.id,
        pac: academicPeriod.pac,
        year: academicPeriod.year,
        pac_modality: academicPeriod.pac_modality,
        title: academicPeriodTitle,
        courses: coursesArray,
        invalidElements,
      },
      coursesGroupByTeacherCodeEntries,
    };
  }

  // createFromArray
  async createFromArray(
    coursesGroupByTeacherCodeEntries: TGroupedCoursesByTeacher,
  ) {
    const allAcademicAssignmentReports = await this.findAll();
    const results: TAcademicAssignmentReport[] &
      {
        teachingSession: {
          courseClassrooms: TCreateCourseClassroom[];
        };
      }[] = [];

    for (const [, academicInfo] of Object.entries(
      coursesGroupByTeacherCodeEntries,
    )) {
      const { teacherId, userId, centerDepartmentId, periodId, courses } =
        academicInfo;

      const academicAssignmentReport =
        allAcademicAssignmentReports.find(
          (aar: TAcademicAssignmentReport) =>
            aar.teacherId === teacherId &&
            aar.centerDepartmentId === centerDepartmentId &&
            aar.periodId === periodId,
        ) ??
        (await this.create({
          userId,
          centerDepartmentId,
          periodId,
        } as CreateAcademicAssignmentReportDto));

      // no validamos si ya existe 'teachingSessions' porque ya lo hicimos al crear el informe
      // y en este punto nadie podria eliminarlo, ya que se estan creando en el mismo momento
      // pero nunca se sabe, asi que lo dejamos por si acaso
      const teachingSession =
        academicAssignmentReport.teachingSession ??
        (await this.teachingSessionsService.create({
          consultHour: formatISO(new Date().toISOString()),
          tutoringHour: formatISO(
            new Date(new Date().getTime() + 3600000), // +1 hour
          ),
          assignmentReportId: academicAssignmentReport.id,
        } as CreateTeachingSessionDto));

      // Creamos CourseClassroom
      const courseClassrooms: TCreateCourseClassroom[] = await Promise.all(
        courses.map((cc) =>
          this.prisma.courseClassroom.create({
            data: {
              ...cc,
              teachingSessionId: teachingSession.id,
              courseStadistic: {
                create: {
                  APB: 0, // Asignación por defecto
                  ABD: 0, // Asignación por defecto
                  NSP: 0, // Asignación por defecto
                  RPB: 0, // Asignación por defecto
                },
              },
            },
          }),
        ),
      );

      results.push({
        ...academicAssignmentReport,
        teachingSession: {
          ...teachingSession,
          courseClassrooms: courseClassrooms.map((cc) => ({
            ...cc,
            classroom: {
              id: cc.classroomId,
            },
          })),
        },
      });
    }

    return results;
  }

  private parseAcademicTitle(title?: string): IParsedTitle | undefined {
    if (!title) return;

    // Inicialmente permitimos numero o null
    let year: number | null = null;
    let pac: number | null = null;
    let pac_modality: TPacModality = 'Trimestre';

    const yearMatch = title.match(/\b(20\d{2})\b/);
    if (yearMatch) {
      year = parseInt(yearMatch[1], 10);
    }

    const pacMap: Record<string, number> = {
      primero: 1,
      segundo: 2,
      tercer: 3,
    };
    const pacRegex = new RegExp(
      `\\b(${Object.keys(pacMap).join('|')})\\b`,
      'i',
    );
    const pacMatch = title.match(pacRegex);
    if (pacMatch) {
      pac = pacMap[pacMatch[1].toLowerCase()];
    }

    const modMatch = title.match(/\b(semestre|trimestre)\b/i);
    if (modMatch) {
      pac_modality = modMatch[1] as TPacModality;
    }

    // Valor por defecto si no se encontró
    if (year === null) {
      year = new Date(Date.now()).getFullYear();

      // throw new BadRequestException(`No se detectó año en “${title}”.`);
    }

    if (pac === null) {
      pac = 1;
    }

    return {
      year,
      pac,
      pac_modality,
      title,
    };
  }

  private validateUniqueClass(
    allData: AcademicAssignmentDto[],
    item: AcademicAssignmentDto,
  ) {
    if (
      allData.some(
        (cc) =>
          cc.id !== item.id &&
          cc.teacherCode === item.teacherCode &&
          cc.courseCode === item.courseCode &&
          cc.section === item.section &&
          cc.days === item.days,
      )
    ) {
      throw new BadRequestException(
        `Ya existe una clase con el docente <${item.teacherCode}>...`,
      );
    }
  }

  private validateDays(days: string): string | undefined {
    const validDays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

    const regex = /^(Lu|Ma|Mi|Ju|Vi|Sa|Do)+$/;

    if (!regex.test(days)) {
      return `El valor de 'days' (${days}) no es válido. Debe ser combinación de: ${validDays.join(
        ', ',
      )}.`;
    }

    return;
  }

  private findTeacher(
    teacherMap: Map<string, User & { teacher: { id: string } | null }>,
    teacherCode: string,
  ): TCommonFindResponse<User & { teacher: { id: string } | null }> {
    const teacher = teacherMap.get(teacherCode);

    return teacher
      ? [teacher, '']
      : [null, `No se encontró el docente con código <${teacherCode}>.`];
  }

  private findCenterDepartment(
    centerDepartments: Map<string, TCenterJoin>,
    center: string,
  ): TCenterJoin {
    const centerDepartment = centerDepartments.get(normalizeText(center));

    if (!centerDepartment)
      throw new NotFoundException(
        `No se encontró el centro con nombre <${center}>.`,
      );

    return centerDepartment;
  }

  private findDepartment(
    departments: (TDepartment & { centerDepartmentId: string })[],
    departmentName: string,
  ): TDepartment & { centerDepartmentId: string } {
    const department = departments.find((d) => d.name === departmentName);

    if (!department)
      throw new NotFoundException(
        `No se encontró el departamento con nombre <${departmentName}> en el centro seleccionado.`,
      );

    return department;
  }

  private findCourse(
    courseMap: Map<string, Course>,
    courseCode: string,
    departmentName: string,
  ): TCommonFindResponse<Course> {
    const course = courseMap.get(courseCode.replace(/-/g, ''));

    if (!course)
      return [
        null,
        `No se encontró la clase con código <${courseCode}> en el departamento <${departmentName}> (puede que no exista o no esté activa).`,
      ];

    // NOTE: Si la asignatura no se encuentra activa, lanzamos un error,
    // ya que puede ser una clase de un pensum anterior
    if (!course.activeStatus)
      return [null, `La asignatura con código <${courseCode}> no está activa.`];

    return [course, ''];
  }

  private findClassroom(
    classroomMap: Map<
      string,
      Classroom & { roomType: { description: string } }
    >,
    classroomName: string,
  ): TCommonFindResponse<Classroom & { roomType: { description: string } }> {
    const classroom = classroomMap.get(normalizeText(classroomName));

    return classroom
      ? [classroom, '']
      : [
          null,
          `No se encontró el salón de clase con nombre <${classroomName}>.`,
        ];
  }

  private validateCourseClassroom(
    existingCourseClassroomsMap: Map<string, TCourseClassroomSelectPeriod>,
    { teacherName, teacherCode, courseCode, days }: AcademicAssignmentDto,
    academicPeriodTitle: string,
    periodId: string,
  ): TCommonFindResponse<TCourseClassroomSelectPeriod | undefined> {
    const existingCourseClassroom = existingCourseClassroomsMap.get(
      `${teacherCode}|${courseCode}|${days}`,
    );

    return existingCourseClassroom &&
      existingCourseClassroom.teachingSession.assignmentReport.periodId ===
        periodId
      ? [
          null,
          `Ya existe una clase para el docente <${teacherCode} - ${teacherName}> con la asignatura <${courseCode}> en <${academicPeriodTitle}>.`,
        ]
      : [existingCourseClassroom, ''];
  }

  private validateIfExistingAnotherCourseClassroom(
    existingCourseClassroomsMap: Map<string, TCourseClassroomSelectPeriod[]>,
    key: string,
    { teacherCode, teacherName, days, section }: AcademicAssignmentDto,
    academicPeriodTitle: string,
  ): TCommonFindResponse<TCourseClassroomSelectPeriod[] | undefined> {
    const existingCourseClassrooms = existingCourseClassroomsMap.get(key);

    if (!existingCourseClassrooms) return [existingCourseClassrooms, ''];

    const regex = new RegExp(
      `(${days
        .toString()
        .trim()
        .split(/([a-zA-Z]{2})/gm)
        .slice(1, -1)
        .filter((e) => e !== '')
        .join('|')})`,
      'gm',
    );

    for (const cc of existingCourseClassrooms) {
      if (cc.days.match(regex) && cc.section === section)
        return [
          null,
          `El docente <${teacherCode} - ${teacherName}> tiene un traslape de horario con una clase existente <${cc.course.code}> en el periodo académico ${academicPeriodTitle}>, por favor revise de nuevo.`,
        ];
    }

    return [existingCourseClassrooms, ''];
  }

  private getModalityId(
    classroomName: string,
    modalities: Map<string, TModality>,
  ): TCommonFindResponse<TModality> {
    const normalizedClassroomName = normalizeText(classroomName).replace(
      /-/g,
      '',
    );

    const modality =
      modalities.get(normalizedClassroomName) ??
      modalities.get(normalizeText(EClassModality.PRESENTIAL));

    return modality ? [modality, ''] : [null, `No se encontró las modalidad.`];
  }

  private getModalityFromMap(
    classroomName: string,
    modalities: Map<string, TModality>,
  ): TModality | null {
    const normalizedClassroomName = normalizeText(classroomName).replace(
      /-/g,
      '',
    );

    return (
      modalities.get(normalizedClassroomName) ??
      modalities.get(normalizeText(EClassModality.PRESENTIAL)) ??
      null
    );
  }
}
