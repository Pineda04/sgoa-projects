import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFacultyDto } from '../dto/create-faculty.dto';
import { UpdateFacultyDto } from '../dto/update-faculty.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { TFaculty } from '../types';

@Injectable()
export class FacultiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createFacultyDto: CreateFacultyDto): Promise<TFaculty> {
    const newFaculty = await this.prisma.faculty.create({
      data: {
        ...createFacultyDto,
      },
    });

    return newFaculty;
  }

  async findAll(): Promise<TFaculty[]> {
    const faculties = await this.prisma.faculty.findMany();

    // if (faculties.length === 0)
    //   throw new NotFoundException('No se encontraron datos.'); // tambien se puede devolver un 200 como consulta exitosa pero con data []

    return faculties;
  }

  async findOne(id: string): Promise<TFaculty> {
    const faculty = await this.prisma.faculty.findUnique({
      where: {
        id,
      },
    });

    if (!faculty)
      throw new NotFoundException(
        `La facultad con id <${id}> no fue encontrada.`,
      );

    // throw new HttpException(
    //   `La facultad con id <${id}> no fue encontrada.`,
    //   HttpStatus.NOT_FOUND,
    // );

    return faculty;
  }

  async findOneByName(name: string): Promise<TFaculty> {
    const faculty = await this.prisma.faculty.findUnique({
      where: {
        name,
      },
    });

    if (!faculty)
      throw new NotFoundException(
        `La facultad con nombre <${name}> no fue encontrada.`,
      );

    // throw new HttpException(
    //   `La facultad con id <${id}> no fue encontrada.`,
    //   HttpStatus.NOT_FOUND,
    // );

    return faculty;
  }

  async update(
    id: string,
    updateFacultyDto: UpdateFacultyDto,
  ): Promise<TFaculty> {
    const facultyUpdate = await this.prisma.faculty.update({
      where: {
        id,
      },
      data: {
        ...updateFacultyDto,
      },
    });

    return facultyUpdate;
  }

  async remove(id: string): Promise<TFaculty> {
    const facultyDelete = await this.prisma.faculty.delete({
      where: {
        id,
      },
    });

    return facultyDelete;
  }
}
