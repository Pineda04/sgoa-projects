import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTeacherUndergradDto } from '../dto';
import { TeachersService } from 'src/modules/teachers/services/teachers.service';
import { TCreateTeacherUndergrad, TTeacherUndergrad } from '../types';
import { IPaginateOutput } from 'src/common/interfaces';
import { QueryPaginationDto } from 'src/common/dto';
import { paginate, paginateOutput } from 'src/common/utils';

@Injectable()
export class TeachersUndergradService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly teachersService: TeachersService,
  ) {}

  async create(
    createTeacherUndergradDto: CreateTeacherUndergradDto,
  ): Promise<TCreateTeacherUndergrad> {
    const { userId, undergradId: undergraduateId } = createTeacherUndergradDto;

    const teacher = await this.teachersService.findOneByUserId(userId);

    const newTeacherUndergrad =
      await this.prisma.teacherUndergraduateDegree.create({
        data: {
          teacherId: teacher.id,
          undergraduateId,
        },
      });

    return newTeacherUndergrad;
  }

  async findAll(): Promise<TTeacherUndergrad[]> {
    const results = await this.prisma.undergraduateDegree.findMany({
      relationLoadStrategy: 'join',
      include: {
        undergraduateDegrees: {
          select: {
            teacher: {
              select: {
                id: true,
                userId: true,
                user: {
                  select: {
                    name: true,
                    code: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return results.map(({ id, name, undergraduateDegrees }) => ({
      id,
      name,
      count: undergraduateDegrees.length,
      teachers: undergraduateDegrees.map(
        ({
          teacher: {
            id,
            user: { name, code },
            userId,
          },
        }) => ({
          id: userId,
          teacherId: id,
          name,
          code,
        }),
      ),
    }));
  }

  async findAllWithPagination(
    query: QueryPaginationDto,
  ): Promise<IPaginateOutput<TTeacherUndergrad>> {
    const [results, count] = await Promise.all([
      this.prisma.undergraduateDegree.findMany({
        ...paginate({ page: query.page, size: query.size ?? '3' }),
        relationLoadStrategy: 'join',
        include: {
          undergraduateDegrees: {
            select: {
              teacher: {
                select: {
                  id: true,
                  userId: true,
                  user: {
                    select: {
                      name: true,
                      code: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.undergraduateDegree.count(),
    ]);

    return paginateOutput<TTeacherUndergrad>(
      results.map(({ id, name, undergraduateDegrees }) => ({
        id,
        name,
        count: undergraduateDegrees.length,
        teachers: undergraduateDegrees.map(
          ({
            teacher: {
              id,
              user: { name, code },
              userId,
            },
          }) => ({
            id: userId,
            teacherId: id,
            name,
            code,
          }),
        ),
      })),
      count,
      query,
    );
  }

  async remove(userId: string, undergradId: string): Promise<boolean> {
    const teacher = await this.teachersService.findOneByUserId(userId);

    const deleteTeacherUndergrad =
      await this.prisma.teacherUndergraduateDegree.delete({
        where: {
          teacherId_undergraduateId: {
            teacherId: teacher.id,
            undergraduateId: undergradId,
          },
        },
      });

    return !!deleteTeacherUndergrad;
  }
}
