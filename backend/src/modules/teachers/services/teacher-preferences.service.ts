import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/modules/users/services/users.service';
import { IPaginateOutput } from 'src/common/interfaces';
import { QueryPaginationDto } from 'src/common/dto';
import { paginate, paginateOutput } from 'src/common/utils';
import { CreateTeacherPreferenceDto } from '../dto/create-teacher-preference.dto';
import { UpdateTeacherPreferenceDto } from '../dto/update-teacher-preference.dto';
import { TTeacherPreferredClass } from '../types';
import { Prisma } from 'src/generated/prisma/client';
import { TeachersService } from './teachers.service';
import { CoursesService } from 'src/modules/course-classrooms/services/courses.service';

@Injectable()
export class TeacherPreferencesService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => TeachersService))
    private readonly teachersService: TeachersService,
  ) {}

  async create(createTeacherPreferenceDto: CreateTeacherPreferenceDto) {
    const { preferredClasses, teacherId } = createTeacherPreferenceDto;

    await this.teachersService.findOne(teacherId);

    const courses = await this.prisma.course.findMany({
      where: {
        id: {
          in: preferredClasses,
        },
      },
      select: {
        id: true,
      },
    });

    const coursesSet = new Set(courses.map((c) => c.id));
    const existsCourses = Array.from(coursesSet);
    const missingCourses = preferredClasses.filter(
      (courseId) => !coursesSet.has(courseId),
    );

    const newTeacherPreference =
      await this.prisma.teacherPreferredClass.createMany({
        data: existsCourses.map((c) => ({
          teacherId,
          courseId: c,
        })),
        skipDuplicates: true,
      });

    return {
      count: newTeacherPreference.count,
      inserted: existsCourses,
      skipped: missingCourses,
    };
  }

  async findAll(): Promise<TTeacherPreferredClass[]> {
    const teacherPreferences = await this.prisma.teacherPreferredClass.findMany(
      {
        relationLoadStrategy: 'join',
        include: {
          course: true,
          teacher: true,
        },
      },
    );

    return teacherPreferences;
  }

  async findAllWithPagination(
    query: QueryPaginationDto,
  ): Promise<IPaginateOutput<TTeacherPreferredClass>> {
    const [teacherPreferences, count] = await Promise.all([
      this.prisma.teacherPreferredClass.findMany({
        ...paginate(query),
        relationLoadStrategy: 'join',
        include: { course: true, teacher: true },
      }),
      this.prisma.teacherPreferredClass.count(),
    ]);

    if (teacherPreferences.length === 0)
      throw new BadRequestException(
        'No se encontraron preferencias de docentes.',
      );

    return paginateOutput<TTeacherPreferredClass>(
      teacherPreferences,
      count,
      query,
    );
  }

  async findOne(id: string) {
    // TODO: se puede buscar por el del docente, ya que solo tiene una
    const teacherPreference =
      await this.prisma.teacherPreferredClass.findUnique({
        where: {
          id,
        },
      });

    if (!teacherPreference)
      throw new NotFoundException(
        `La preferencia del docente con id <${id}> no fue encontrado.`,
      );

    return teacherPreference;
  }

  async findOneByUserId(userId: string): Promise<TTeacherPreferredClass> {
    const teacherPreference = await this.prisma.teacherPreferredClass.findFirst(
      {
        where: {
          teacher: {
            userId,
          },
        },
        relationLoadStrategy: 'join',
        include: {
          course: true,
          teacher: true,
        },
      },
    );

    if (!teacherPreference)
      throw new NotFoundException(
        `La preferencia de docente con userId <${userId}> no fue encontrado.`,
      );

    return teacherPreference;
  }

  async findOneByCode(code: string) {
    const teacherPreference = await this.prisma.teacherPreferredClass.findFirst(
      {
        where: {
          teacher: {
            user: {
              code,
            },
          },
        },
        relationLoadStrategy: 'join',
        include: {
          course: true,
          teacher: true,
        },
      },
    );

    if (!teacherPreference)
      throw new NotFoundException(
        `La preferencia de docente con el código <${code}> no fue encontrado.`,
      );

    return teacherPreference;
  }

  // async update(
  //   id: string,
  //   updateTeacherPreferenceDto: UpdateTeacherPreferenceDto,
  // ) {
  //   const teacherPreferenceUpdate =
  //     await this.prisma.teacherPreferredClass.update({
  //       where: {
  //         id,
  //       },
  //       data: {
  //         ...updateTeacherPreferenceDto,
  //       },
  //     });
  //
  //   return teacherPreferenceUpdate;
  // }

  async remove(id: string): Promise<Prisma.BatchPayload> {
    const teacherPreference = await this.findOne(id);

    const teacher = await this.usersService.findOne(
      teacherPreference.teacherId,
    );

    const deleteTeacherPreference =
      await this.prisma.teacherPreferredClass.deleteMany({
        where: {
          teacherId: teacher.id,
        },
      });

    return deleteTeacherPreference;
  }
}
