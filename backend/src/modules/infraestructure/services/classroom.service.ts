import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClassroomDto } from '../dto/create-classroom.dto';
import { UpdateClassroomDto } from '../dto/update-classroom.dto';
import { TClassroom, TCreateClassroom, TUpdateClassroom } from '../types';
import { QueryPaginationDto } from 'src/common/dto';
import { IPaginateOutput } from 'src/common/interfaces';
import { normalizeText, paginate, paginateOutput } from 'src/common/utils';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class ClassroomService {
  constructor(private prisma: PrismaService) {}

  async create(
    createClassroomDto: CreateClassroomDto,
  ): Promise<TCreateClassroom> {
    const newClassroom = await this.prisma.classroom.create({
      data: {
        ...createClassroomDto,
      },
    });

    return newClassroom;
  }

  async findAll(): Promise<TClassroom[]> {
    const classrooms = await this.prisma.classroom.findMany();

    return classrooms;
  }

  async findAllWithPagination(
    query: QueryPaginationDto,
  ): Promise<IPaginateOutput<TClassroom>> {
    const [classrooms, count] = await Promise.all([
      this.prisma.classroom.findMany(),
      this.prisma.classroom.count(),
    ]);

    return paginateOutput<TClassroom>(classrooms, count, query);
  }

  async findOne(id: string): Promise<TClassroom> {
    const classroom = await this.prisma.classroom.findUnique({
      where: {
        id,
      },
    });

    if (!classroom)
      throw new NotFoundException(`El aula con id <${id}> no fue encontrado.`);

    return classroom;
  }

  async findBySearchTerm(searchTerm: string = '', query: QueryPaginationDto) {
    const where: Prisma.ClassroomWhereInput = {
      OR: [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        {
          classroomInfoView: {
            normalizedName: {
              contains: normalizeText(searchTerm),
              mode: 'insensitive',
            },
          },
        },
        {
          roomType: {
            description: { contains: searchTerm, mode: 'insensitive' },
          },
        },
        {
          building: {
            name: { contains: searchTerm, mode: 'insensitive' },
          },
        },
      ],
    };

    const [results, count] = await Promise.all([
      this.prisma.classroom.findMany({
        where,
        ...paginate(query),
        select: {
          id: true,
          name: true,
          building: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.classroom.count({
        where,
      }),
    ]);

    return paginateOutput(results, count, query);
  }

  async update(
    id: string,
    updateClassroomDto: UpdateClassroomDto,
  ): Promise<TUpdateClassroom> {
    const classroomUpdate = await this.prisma.classroom.update({
      where: {
        id,
      },
      data: {
        ...updateClassroomDto,
      },
    });

    return classroomUpdate;
  }

  async remove(id: string): Promise<TClassroom> {
    const classroomDelete = await this.prisma.classroom.delete({
      where: {
        id,
      },
    });

    return classroomDelete;
  }
}
