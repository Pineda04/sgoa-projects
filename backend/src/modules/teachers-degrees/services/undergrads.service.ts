import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TUndergraduateDegree } from '../types';
import { CreateUndergradDto } from '../dto/create-undergrad.dto';
import { UpdateUndergradDto } from '../dto/update-undergrad.dto';

@Injectable()
export class UndergradsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createUndergradDto: CreateUndergradDto,
  ): Promise<TUndergraduateDegree> {
    const newUndergrad = await this.prisma.undergraduateDegree.create({
      data: {
        ...createUndergradDto,
      },
    });

    return newUndergrad;
  }

  async findAll(): Promise<TUndergraduateDegree[]> {
    const undergrads = await this.prisma.undergraduateDegree.findMany();

    // if (undergrads.length === 0)
    //   throw new NotFoundException('No se encontraron datos.'); // tambien se puede devolver un 200 como consulta exitosa pero con data []

    return undergrads;
  }

  async findAllArray(): Promise<string[]> {
    const undergrads = await this.prisma.undergraduateDegree.findMany({
      select: { name: true },
    });

    // return undergrads.length === 0 ? [] : undergrads.map((u) => u.name);
    return undergrads.map((u) => u.name);
  }

  async findOne(id: string): Promise<TUndergraduateDegree> {
    const undergrad = await this.prisma.undergraduateDegree.findUnique({
      where: {
        id,
      },
    });

    if (!undergrad)
      throw new NotFoundException(
        `El pregrado con id <${id}> no fue encontrado.`,
      );

    return undergrad;
  }

  async findOneByName(name: string): Promise<TUndergraduateDegree> {
    const undergrad = await this.prisma.undergraduateDegree.findUnique({
      where: {
        name,
      },
    });

    if (!undergrad)
      throw new NotFoundException(
        `El pregrado con nombre <${name}> no fue encontrado.`,
      );

    return undergrad;
  }

  async update(
    id: string,
    updateUndergradDto: UpdateUndergradDto,
  ): Promise<TUndergraduateDegree> {
    const undergradUpdate = await this.prisma.undergraduateDegree.update({
      where: {
        id,
      },
      data: {
        ...updateUndergradDto,
      },
    });

    return undergradUpdate;
  }

  async remove(id: string): Promise<TUndergraduateDegree> {
    const undergradDelete = await this.prisma.undergraduateDegree.delete({
      where: {
        id,
      },
    });

    return undergradDelete;
  }
}
