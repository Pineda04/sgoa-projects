import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TeachersService } from 'src/modules/teachers/services/teachers.service';
import { TCreateTeacherPostgrad, TTeacherPostgrad } from '../types';
import { CreateTeacherPostgradDto } from '../dto';
import { QueryPaginationDto } from 'src/common/dto';
import { IPaginateOutput } from 'src/common/interfaces';
import { paginate, paginateOutput } from 'src/common/utils';

@Injectable()
export class TeachersPostgradService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly teachersService: TeachersService,
  ) {}

  async create(
    createTeacherPostgradDto: CreateTeacherPostgradDto,
  ): Promise<TCreateTeacherPostgrad> {
    const { userId, postgradId: postgraduateId } = createTeacherPostgradDto;

    const teacher = await this.teachersService.findOneByUserId(userId);

    const newTeacherPostgrad =
      await this.prisma.teacherPostgraduateDegree.create({
        data: {
          teacherId: teacher.id,
          postgraduateId,
        },
      });

    return newTeacherPostgrad;
  }

  async findAll(): Promise<TTeacherPostgrad[]> {
    const results = await this.prisma.postgraduateDegree.findMany({
      relationLoadStrategy: 'join',
      include: {
        postgraduateDegrees: {
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

    return results.map(({ id, name, postgraduateDegrees }) => ({
      id,
      name,
      count: postgraduateDegrees.length,
      teachers: postgraduateDegrees.map(
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
  ): Promise<IPaginateOutput<TTeacherPostgrad>> {
    const [results, count] = await Promise.all([
      this.prisma.postgraduateDegree.findMany({
        ...paginate({ page: query.page, size: query.size ?? '3' }),
        relationLoadStrategy: 'join',
        include: {
          postgraduateDegrees: {
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
      this.prisma.postgraduateDegree.count(),
    ]);

    return paginateOutput<TTeacherPostgrad>(
      results.map(({ id, name, postgraduateDegrees }) => ({
        id,
        name,
        count: postgraduateDegrees.length,
        teachers: postgraduateDegrees.map(
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

  async remove(userId: string, postgradId: string): Promise<boolean> {
    const teacher = await this.teachersService.findOneByUserId(userId);

    const deleteTeacherPostgrad =
      await this.prisma.teacherPostgraduateDegree.delete({
        where: {
          teacherId_postgraduateId: {
            teacherId: teacher.id,
            postgraduateId: postgradId,
          },
        },
      });

    return !!deleteTeacherPostgrad;
  }
}
