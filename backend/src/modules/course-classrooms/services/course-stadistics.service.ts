import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateCourseStadisticDto,
  QueryConsolidatedDto,
  UpdateCourseStadisticDto,
} from '../dto';
import {
  TCreateCourseStadistic,
  TCourseStadistic,
  TOutputConsolidated,
} from '../types';
import { CourseClassroomsService } from './course-classrooms.service';
import { IPaginateOutput } from 'src/common/interfaces';
import { QueryPaginationDto } from 'src/common/dto';
import { paginate, paginateOutput } from 'src/common/utils';

@Injectable()
export class CourseStadisticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly courseClassroomsService: CourseClassroomsService,
  ) {}

  async create(
    createCourseStadisticDto: CreateCourseStadisticDto,
  ): Promise<TCreateCourseStadistic> {
    const newCourseStadistic = await this.prisma.courseStadistic.create({
      data: {
        ...createCourseStadisticDto,
      },
    });

    return newCourseStadistic;
  }

  async findAll(): Promise<TCourseStadistic[]> {
    const courseStadistics = await this.prisma.courseStadistic.findMany();

    return courseStadistics;
  }

  async findAllWithPagination(
    query: QueryPaginationDto,
  ): Promise<IPaginateOutput<TCourseStadistic>> {
    const [courseStadistics, count] = await Promise.all([
      this.prisma.courseStadistic.findMany({
        ...paginate(query),
      }),
      this.prisma.courseStadistic.count(),
    ]);

    return paginateOutput<TCourseStadistic>(courseStadistics, count, query);
  }

  async findOne(id: string): Promise<TCourseStadistic> {
    const courseStadistic = await this.prisma.courseStadistic.findUnique({
      where: {
        id,
      },
    });

    if (!courseStadistic)
      throw new NotFoundException(
        `La estadística de clase con id ${id} no fue encontrada.`,
      );

    return courseStadistic;
  }

  async update(
    id: string,
    updateCourseStadisticDto: UpdateCourseStadisticDto,
  ): Promise<TCourseStadistic> {
    const { studentCount } = await this.courseClassroomsService.findOne(id);
    const { ABD, APB, NSP, RPB } = updateCourseStadisticDto;

    const valuesToSum = [ABD, APB, NSP, RPB].filter((v) => this.isNumber(v));

    if (valuesToSum.length > 0) {
      const total = valuesToSum.reduce((acc, val) => acc + val, 0);
      if (total !== studentCount) {
        throw new BadRequestException(
          `La suma de ABD, APB, NSP, RPB <${total}> no coincide con la cantidad de estudiantes <${studentCount}>`,
        );
      }
    }

    const courseStadisticUpdate = await this.prisma.courseStadistic.update({
      where: {
        courseClassroomId: id,
      },
      data: {
        ...updateCourseStadisticDto,
      },
    });

    return courseStadisticUpdate;
  }

  async remove(id: string): Promise<TCourseStadistic> {
    const courseStadisticDelete = await this.prisma.courseStadistic.delete({
      where: {
        id,
      },
    });

    return courseStadisticDelete;
  }

  private isNumber(value: unknown): value is number {
    return typeof value === 'number';
  }

  // Consolidado
  async generateConsolidated(
    query: QueryPaginationDto,
    searchQuery: QueryConsolidatedDto,
  ): Promise<IPaginateOutput<TOutputConsolidated>> {
    const where = {
      courseClassroom: {
        teachingSession: {
          assignmentReport: {
            period: {
              ...(searchQuery.year
                ? { year: Math.abs(parseInt(searchQuery.year)) }
                : {}),
              ...(searchQuery.pac
                ? { pac: Math.abs(parseInt(searchQuery.pac)) }
                : {}),
              ...(searchQuery.periodId ? { id: searchQuery.periodId } : {}),
            },
            ...(searchQuery.centerDepartmentId
              ? { centerDepartmentId: searchQuery.centerDepartmentId }
              : {}),
          },
        },
        ...(searchQuery.courseId ? { courseId: searchQuery.courseId } : {}),
      },
    };

    const [allCoursesStadistics, count] = await Promise.all([
      this.prisma.courseStadistic.findMany({
        ...paginate(query),
        where,
        relationLoadStrategy: 'join',
        include: {
          courseClassroom: {
            select: {
              studentCount: true,
              section: true,
              teachingSession: {
                select: {
                  assignmentReport: {
                    select: {
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
                      period: {
                        select: {
                          pac: true,
                          year: true,
                        },
                      },
                    },
                  },
                },
              },
              modality: {
                select: {
                  name: true,
                },
              },
              course: {
                select: {
                  name: true,
                  code: true,
                  department: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.courseStadistic.count({
        where,
      }),
    ]);

    if (allCoursesStadistics.length === 0)
      throw new BadRequestException(
        `No se encontraron estadísticas de clases para generar el consolidado.`,
      );

    const mapped: TOutputConsolidated[] = allCoursesStadistics.map(
      ({ courseClassroom: cc, ABD, APB, NSP, RPB }) => {
        const final = ABD + RPB + APB;
        const initial = cc.studentCount;

        return {
          courseCode: cc.course.code,
          courseName: cc.course.name,
          section: cc.section,
          initial,
          final,
          ABD,
          NSP,
          RPB,
          APB,
          teacherCode: cc.teachingSession.assignmentReport.teacher.user.code,
          teacherName: cc.teachingSession.assignmentReport.teacher.user.name,
          department: cc.course.department.name,
          modality: cc.modality.name,
          indexABD: (ABD * 100) / initial,
          indexNSP: (NSP * 100) / initial,
          indexRPB: (RPB * 100) / initial,
          indexAPB: (APB * 100) / initial,
          finalSummatoryInconsistency:
            final === ABD + RPB + APB ? 'Correcto' : 'Error',
          initialSummatoryInconsistency:
            initial === ABD + NSP + RPB + APB ? 'Correcto' : 'Incorrecto',
          terminalEfficiency: (APB * 100) / initial,
          pac: cc.teachingSession.assignmentReport.period.pac,
          year: cc.teachingSession.assignmentReport.period.year,
        };
      },
    );

    return paginateOutput<TOutputConsolidated>(mapped, count, query);
  }
}
