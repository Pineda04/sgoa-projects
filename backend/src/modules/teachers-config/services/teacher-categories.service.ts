import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTeacherCategoryDto } from '../dto/create-teacher-category.dto';
import { UpdateTeacherCategoryDto } from '../dto/update-teacher-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { TTeacherCategory } from '../types';

@Injectable()
export class TeacherCategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createTeacherCategoryDto: CreateTeacherCategoryDto,
  ): Promise<TTeacherCategory> {
    const newTeacherCategory = await this.prisma.teacherCategory.create({
      data: {
        ...createTeacherCategoryDto,
      },
    });

    return newTeacherCategory;
  }

  async findAll(): Promise<TTeacherCategory[]> {
    const teacherCategories = await this.prisma.teacherCategory.findMany();

    // if (teacherCategories.length === 0)
    //   throw new NotFoundException('No se encontraron datos.'); // tambien se puede devolver un 200 como consulta exitosa pero con data []

    return teacherCategories;
  }

  async findOne(id: string): Promise<TTeacherCategory> {
    const teacherCategory = await this.prisma.teacherCategory.findUnique({
      where: {
        id,
      },
    });

    if (!teacherCategory)
      throw new NotFoundException(
        `La categoría de docente con id <${id}> no fue encontrada.`,
      );

    return teacherCategory;
  }

  async findOneByName(name: string): Promise<TTeacherCategory> {
    const teacherCategory = await this.prisma.teacherCategory.findUnique({
      where: {
        name,
      },
    });

    if (!teacherCategory)
      throw new NotFoundException(
        `La categoría de docente con nombre <${name}> no fue encontrada.`,
      );

    return teacherCategory;
  }

  async update(
    id: string,
    updateTeacherCategoryDto: UpdateTeacherCategoryDto,
  ): Promise<TTeacherCategory> {
    const teacherCategoryUpdate = await this.prisma.teacherCategory.update({
      where: {
        id,
      },
      data: {
        ...updateTeacherCategoryDto,
      },
    });

    return teacherCategoryUpdate;
  }

  async remove(id: string): Promise<TTeacherCategory> {
    const teacherCategoryDelete = await this.prisma.teacherCategory.delete({
      where: {
        id,
      },
    });

    return teacherCategoryDelete;
  }
}
