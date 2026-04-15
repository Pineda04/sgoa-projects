import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateModalityDto, UpdateModalityDto } from '../dto';
import { TCreateModality, TModality, TUpdateModality } from '../types';

@Injectable()
export class ModalitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createModalityDto: CreateModalityDto): Promise<TCreateModality> {
    const newModality = await this.prisma.modality.create({
      data: {
        ...createModalityDto,
      },
    });

    return newModality;
  }

  async findAll(): Promise<TModality[]> {
    const modalities = await this.prisma.modality.findMany();

    return modalities;
  }

  async findOne(id: string): Promise<TModality> {
    const modality = await this.prisma.modality.findUnique({
      where: {
        id,
      },
    });

    if (!modality)
      throw new NotFoundException(
        `La modalidad de asignatura con id ${id} no fue encontrada.`,
      );

    return modality;
  }

  async update(
    id: string,
    updateModalityDto: UpdateModalityDto,
  ): Promise<TUpdateModality> {
    const modalityUpdate = await this.prisma.modality.update({
      where: {
        id,
      },
      data: {
        ...updateModalityDto,
      },
    });

    return modalityUpdate;
  }

  async remove(id: string): Promise<TModality> {
    const modalityDelete = await this.prisma.modality.delete({
      where: {
        id,
      },
    });

    return modalityDelete;
  }
}
