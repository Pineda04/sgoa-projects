import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePcTypeDto, UpdatePcTypeDto } from '../dto';
import { TCreatePcType, TPcType, TUpdatePcType } from '../types';

@Injectable()
export class PcTypesService {
  constructor(private prisma: PrismaService) {}

  async create(createPcTypeDto: CreatePcTypeDto): Promise<TCreatePcType> {
    const newPcType = await this.prisma.pcType.create({
      data: {
        ...createPcTypeDto,
      },
    });

    return newPcType;
  }

  async findAll(): Promise<TPcType[]> {
    const pcTypes = await this.prisma.pcType.findMany();

    return pcTypes;
  }

  async findOne(id: string): Promise<TPcType> {
    const pcType = await this.prisma.pcType.findUnique({
      where: {
        id,
      },
    });

    if (!pcType)
      throw new NotFoundException(
        `El tipo de pc con id <${id}> no fue encontrado.`,
      );

    return pcType;
  }

  async update(
    id: string,
    updatePcTypeDto: UpdatePcTypeDto,
  ): Promise<TUpdatePcType> {
    const pcTypeUpdate = await this.prisma.pcType.update({
      where: {
        id,
      },
      data: {
        ...updatePcTypeDto,
      },
    });

    return pcTypeUpdate;
  }

  async remove(id: string): Promise<TPcType> {
    const pcTypeDelete = await this.prisma.pcType.delete({
      where: {
        id,
      },
    });

    return pcTypeDelete;
  }
}
