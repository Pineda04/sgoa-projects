import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCourseDto, UpdateCourseDto } from '../dto';
import {
  TCreateCourse,
  TCourse,
  TUpdateCourse,
  TOutputCourseWithSelect,
} from '../types';
import { normalizeText, paginate, paginateOutput } from 'src/common/utils';
import { IPaginateOutput } from 'src/common/interfaces';
import { QueryPaginationDto } from 'src/common/dto';
import { TCustomOmit } from 'src/common/types';
import { Prisma } from 'src/generated/prisma/client';
import { TDepartment } from 'src/modules/centers/types';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCourseDto: CreateCourseDto): Promise<TCreateCourse> {
    const newCourse = await this.prisma.course.create({
      data: {
        ...createCourseDto,
        code: createCourseDto.code.replace(/-/g, ''),
      },
    });

    return newCourse;
  }

  async findAll(): Promise<TCourse[]> {
    const courses = await this.prisma.course.findMany();

    return courses;
  }

  async findAllWithSelect(): Promise<
    TCustomOmit<TOutputCourseWithSelect, 'name' | 'uvs'>[]
  > {
    const courses = await this.prisma.course.findMany({
      select: {
        id: true,
        code: true,
        departmentId: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        activeStatus: true,
      },
    });

    return courses;
  }

  async findAllByCenterDepartmentId(
    centerDepartmentId: string,
  ): Promise<TOutputCourseWithSelect[]> {
    const courses = await this.prisma.course.findMany({
      where: {
        department: {
          centers: {
            every: {
              id: centerDepartmentId,
            },
          },
        },
      },
      select: {
        id: true,
        code: true,
        name: true,
        uvs: true,
        departmentId: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        activeStatus: true,
      },
    });

    return courses;
  }

  async findAllWithPagination(
    query: QueryPaginationDto,
  ): Promise<IPaginateOutput<TCourse>> {
    const [courses, count] = await Promise.all([
      this.prisma.course.findMany({
        ...paginate(query),
      }),
      this.prisma.course.count(),
    ]);

    return paginateOutput<TCourse>(courses, count, query);
  }

  async findOne(
    id: string,
  ): Promise<TCourse & { department: Pick<TDepartment, 'id' | 'name'> }> {
    const course = await this.prisma.course.findUnique({
      where: {
        id,
      },
      relationLoadStrategy: 'join',
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!course)
      throw new NotFoundException(
        `La asignatura con id ${id} no fue encontrada.`,
      );

    return course;
  }

  async findOneByCode(code: string): Promise<TCourse> {
    const course = await this.prisma.course.findUnique({
      where: {
        code: normalizeText(code),
      },
    });

    if (!course)
      throw new NotFoundException(
        `La asignatura con el código <${code}> no fue encontrada.`,
      );

    return course;
  }

  async findBySearchTerm(
    searchTerm: string = '',
    query: QueryPaginationDto,
    centerDepartmentId?: string,
  ) {
    const where: Prisma.CourseWhereInput = {
      OR: [
        {
          code: { contains: searchTerm.replace(/-/g, ''), mode: 'insensitive' },
        },
        { name: { contains: searchTerm, mode: 'insensitive' } },
      ],
      ...(centerDepartmentId
        ? {
            department: {
              centers: {
                some: {
                  id: centerDepartmentId,
                },
              },
            },
          }
        : {}),
    };

    const [results, count] = await Promise.all([
      this.prisma.course.findMany({
        ...paginate(query),
        where,
        select: {
          id: true,
          code: true,
          name: true,
          uvs: true,
          activeStatus: true,
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.course.count({
        where,
      }),
    ]);

    return paginateOutput(results, count, query);
  }

  async update(
    id: string,
    updateCourseDto: UpdateCourseDto,
  ): Promise<TUpdateCourse> {
    const courseUpdate = await this.prisma.course.update({
      where: {
        id,
      },
      data: {
        ...updateCourseDto,
        code: updateCourseDto.code
          ? updateCourseDto.code.replace(/-/g, '')
          : undefined,
      },
    });
    return courseUpdate;
  }

  async remove(id: string): Promise<TCourse> {
    const courseDelete = await this.prisma.course.delete({
      where: {
        id,
      },
    });

    return courseDelete;
  }

  async existsByCode(code: string): Promise<boolean> {
    const normalizedCode = normalizeText(code);

    const course = await this.prisma.course.findUnique({
      where: { code: normalizedCode },
    });

    return !!course;
  }
}
